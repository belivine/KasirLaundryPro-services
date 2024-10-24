import { InvoiceDetails, Transaction, TransactionData, TransactionDetails, TransactionQuery } from "./types";
import pool from "../../database/postgres";
import { addPayment } from "../payments/controller";
import { getCustomerById } from "../customer/controller";
import { getDurationById } from "../duration/controller";
import { getServiceDurationDetail } from "../services/controller";

export async function getTransactions(
  status: string | null = null,
  filter: string | null = null,
  date_from: string | null = null,
  date_to: string | null = null,
  merchant_id?: string
): Promise<TransactionData[]> {
  const client = await pool.connect();

  try {
    // Determine the date column based on the status
    let dateColumn: string;

    switch (status) {
      case "Diproses":
        dateColumn = "t.created_at";
        break;
      case "Siap Diambil":
        dateColumn = "t.ready_to_pick_up_at";
        break;
      case "Selesai":
        dateColumn = "t.completed_at";
        break;
      default:
        dateColumn = "t.created_at";
        break;
    }

    // Building dynamic conditions for each filter
    let conditions: string[] = [];
    let values: any[] = [];

    // Add status condition
    if (status) {
      conditions.push(`t.status = $${values.length + 1}`);
      values.push(status);
    }

    // Add customer filter condition
    if (filter) {
      conditions.push(`(t.customer_name ILIKE '%' || $${values.length + 1} || '%' OR p.invoice_id ILIKE '%' || $${values.length + 1} || '%')`);
      values.push(filter);
    }

    // Add date range condition
    if (date_from && date_to) {
      conditions.push(`${dateColumn}::date BETWEEN $${values.length + 1}::date AND $${values.length + 2}::date`);
      values.push(date_from, date_to);
    }

    // Add merchant_id condition
    if (merchant_id) {
      conditions.push(`t.merchant_id = $${values.length + 1}`);
      values.push(merchant_id);
    }

    // Construct query using dateColumn for ordering
    const query = `
      SELECT 
        t.id AS id,
        t.customer_name AS customer,
        p.status AS payment_status,
        p.invoice_id AS invoice,
        t.status,
        t.created_at,
        t.ready_to_pick_up_at,
        t.completed_at
      FROM new_transaction t
      LEFT JOIN new_payment p ON t.id = p.transaction_id
      WHERE ${conditions.length > 0 ? conditions.join(' AND ') : 'TRUE'}
      ORDER BY ${dateColumn} DESC
    `;
    
    // Execute the query
    const result = await client.query(query, values);

    return result.rows;
  } finally {
    client.release();
  }
}


/**
 * Add a new transaction to the database.
 * @param transaction - The transaction data to add.
 * @returns {Promise<Service>} - A promise that resolves to the newly created transaction.
 */
export async function addTransaction(transaction: Omit<Transaction, 'id'>, merchant_id?: string): Promise<any | null> {
  const client = await pool.connect();
  try {
    const { customer, duration, status, items } = transaction;
    const customerDetail = await getCustomerById(customer);
    const durationDetail = await getDurationById(duration);

    const query = `
      INSERT INTO new_transaction (
        customer_id, 
        customer_name, 
        customer_phone_number, 
        customer_email, 
        customer_address, 
        duration_id, 
        duration_name,
        duration_length,
        duration_length_type,
        status, 
        merchant_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id;
    `;
    const values = [
      customerDetail?.id, 
      customerDetail?.name,
      customerDetail?.phone_number,
      customerDetail?.email,
      customerDetail?.address,
      durationDetail?.id,
      durationDetail?.name,
      durationDetail?.duration,
      durationDetail?.type, 
      status, 
      merchant_id
    ];
    const result = await client.query(query, values);
    const newTransactionId = result.rows[0].id;

    console.log(result);
    

    // Insert service items
    const transactionQueries: TransactionQuery[] = [];

    for (const item of items || []) {
      const serviceDetail = await getServiceDurationDetail(item.service, duration);
      
      transactionQueries.push({
        text: `
          INSERT INTO new_transaction_item (transaction_id, service_id, service_name, service_unit, price, qty)
          VALUES ($1, $2, $3, $4, $5, $6);
        `,
        values: [newTransactionId, serviceDetail.id, serviceDetail.name, serviceDetail.unit, serviceDetail.price, item.qty],
      });
    }

    for (const query of transactionQueries) {
      await client.query(query.text, query.values);
    }

    const totalPrice = await getInvoiceTotalPrice(newTransactionId);

    // Generate Invoice ID
    const invoiceId = generateInvoiceId();

    // Create Payment
    await addPayment({
      status: "Belum Dibayar",
      invoice_id: invoiceId,
      total_amount_due: totalPrice?.total || 0,
      transaction_id: newTransactionId
    }, merchant_id);

    const transactionDetail = await getTransactionById(invoiceId);
    return {
      transaction: transactionDetail
    }
  } finally {
    client.release();
  }
}


/**
 * Retrieve price details of a specific transaction by its ID.
 * @param {string} invoiceId - The ID of the transaction to retrieve.
 */
async function getInvoiceTotalPrice(transactionId: string): Promise<{total: number} | null> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        SUM(ti.price * ti.qty) AS total
      FROM new_transaction_item ti
      WHERE ti.transaction_id = $1
      GROUP BY ti.transaction_id
    `;

    const result = await client.query(query, [transactionId]);
    if (result.rows.length === 0) {
      return null; // No transaction found
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Updates the status and the completed_at timestamp of a transaction by its invoice ID.
 * If the status is "Selesai", the completed_at timestamp will be set to the current time.
 * 
 * @param status - The new status of the transaction.
 * @param invoiceId - The invoice ID of the transaction to update.
 * @returns A Promise resolving to the updated Transaction object.
 */
export async function updateTransaction(status: string, invoiceId: string): Promise<TransactionDetails> {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE new_transaction
      SET 
        status = $1::text, 
        completed_at = CASE 
                          WHEN $1 = 'Selesai' THEN NOW() 
                          ELSE completed_at 
                        END,
        ready_to_pick_up_at = CASE 
                                WHEN $1 = 'Siap Diambil' THEN NOW() 
                                ELSE ready_to_pick_up_at 
                              END
      WHERE id = (
        SELECT t.id
        FROM new_transaction t
        JOIN new_payment p ON t.id = p.transaction_id
        WHERE p.invoice_id = $2
      )
      RETURNING *;
    `;
    
    const values = [status, invoiceId];
    
    const result = await client.query(query, values);
    const transactionDetail = getTransactionByTransactionId(result.rows[0].id);
    return transactionDetail;
  } finally {
    client.release(); 
  }
}

/**
 * Retrieve details of a specific transaction by its ID, including a nested list of items.
 * @param {string} invoiceId - The ID of the transaction to retrieve.
 * @returns {Promise<Transaction | null>} - A promise that resolves to the transaction details or null if not found.
 */
export async function getTransactionById(invoiceId: string): Promise<TransactionDetails | null> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        t.id AS transaction_id,
        t.customer_id AS customer_id,
        t.customer_name AS customer_name,
        t.customer_phone_number AS customer_phone_number,
        t.ready_to_pick_up_at,
        t.completed_at,
        t.duration_name,
        t.status AS transaction_status,
        p.invoice_id AS invoice,
        SUM(ti.price * ti.qty) AS total,
        p.status AS payment_status,
        p.id AS payment_id,
        json_agg(
          json_build_object(
            'service_id', ti.service_id,
            'service_name', ti.service_name,
            'price', ti.price,
            'quantity', ti.qty
          )
        ) AS services
      FROM new_transaction t
      LEFT JOIN new_payment p ON t.id = p.transaction_id
      LEFT JOIN new_transaction_item ti ON t.id = ti.transaction_id
      WHERE p.invoice_id = $1
      GROUP BY t.id, p.id
    `;

    const result = await client.query(query, [invoiceId]);
    if (result.rows.length === 0) {
      return null; // No transaction found
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Retrieve details of a specific transaction by its ID.
 * @param {string} invoiceId - The ID of the transaction to retrieve.
 * @returns {Promise<TransactionDetails | null>} - Transaction details or null if not found.
 */
export async function getTransactionByTransactionId(invoiceId: string): Promise<TransactionDetails> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        new_transaction.id AS transaction_id,
        new_transaction.customer_id,
        new_transaction.customer_name,
        new_transaction.customer_phone_number,
        p.invoice_id AS invoice,
        t.status
      FROM new_transaction
      LEFT JOIN new_payment p ON new_transaction.id = p.transaction_id
      WHERE new_transaction.id = $1
    `;
    const { rows } = await client.query(query, [invoiceId]);
    return rows.length ? rows[0] : null;
  } finally {
    client.release();
  }
}

/**
 * Retrieve details of a specific invoice by its ID, including a nested list of items.
 * @param {string} invoiceId - The ID of the transaction to retrieve.
 * @returns {Promise<InvoiceDetails | null>} - A promise that resolves to the transaction details or null if not found.
 */
export async function getInvoiceById(invoiceId: string): Promise<InvoiceDetails | null> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
          json_build_object(
              'name', u.name,
              'logo', u.logo,
              'address', u.address,
              'note', n.notes
          ) as merchant,
          json_build_object(
              'name', t.customer_name,
              'address', t.customer_address,
              'phone_number', t.customer_phone_number,
              'email', t.customer_email
          ) as customer,
          json_build_object(
              'entry_date', TO_CHAR(t.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
              'ready_to_pickup_date', TO_CHAR(t.ready_to_pick_up_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
              'completed_date', TO_CHAR(t.completed_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
              'duration', t.duration_name,
              'services', json_agg(
                  json_build_object(
                      'service_name', ti.service_name,
                      'unit', ti.service_unit,
                      'price', ti.price,
                      'quantity', ti.qty,
                      'total_price', ti.qty * ti.price
                  )
              ),
              'total_price', SUM(ti.price * ti.qty),
              'payment_received', p.payment_received,
              'change_given', p.change_given
          ) as transaction
      FROM new_transaction t
      LEFT JOIN new_payment p ON t.id = p.transaction_id
      LEFT JOIN new_transaction_item ti ON t.id = ti.transaction_id
      LEFT JOIN users u ON u.id = t.merchant_id
      LEFT JOIN note n ON n.merchant_id = u.id
      WHERE p.invoice_id = $1
      GROUP BY t.id, u.id, n.id, p.id
    `;

    const result = await client.query(query, [invoiceId]);
    if (result.rows.length === 0) {
      return null; // No Invoice found
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}

function generateInvoiceId() {
  const prefix = 'INV';
  const timestamp = Date.now(); // Current timestamp
  return `${prefix}-${timestamp}`;
}