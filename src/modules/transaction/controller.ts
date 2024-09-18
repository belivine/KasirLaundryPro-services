import { Transaction, TransactionData, TransactionDetails } from "./types";
import pool from "../../database/postgres";
import { addPayment } from "../payments/controller";

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

    // Add customer ID condition
    if (filter) {
      conditions.push(`(c.name ILIKE '%' || $${values.length + 1} || '%' OR d.invoice_id ILIKE '%' || $${values.length + 1} || '%')`);
      values.push(filter);
    }

    // Add date range condition
    if (date_from && date_to) {
      conditions.push(`${dateColumn} BETWEEN $${values.length + 1}::date AND $${values.length + 2}::date`);
      values.push(date_from, date_to);
    }

    // Add merchant_id condition
    if (merchant_id) {
      conditions.push(`t.merchant_id = $${values.length + 1}`);
      values.push(merchant_id);
    }

    // Construct query
    const query = `
      SELECT 
          t.id AS id,
          c.name AS customer,
          d.status AS payment_status,
          d.invoice_id AS invoice,
          t.status,
          t.created_at,
          t.ready_to_pick_up_at,
          t.completed_at
      FROM transaction t
      LEFT JOIN customer c ON t.customer = c.id
      LEFT JOIN payment d ON t.id = d.transaction_id
      WHERE ${conditions.join(' AND ')}
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
    const query = `
        INSERT INTO transaction (customer, duration, status, merchant_id)
        VALUES ($1, $2, $3, $4) RETURNING id;
      `;
    const values = [customer, duration, status, merchant_id];
    const result = await client.query(query, values);
    const newTransactionId = result.rows[0].id;

    // Insert service items
    const transactionQueries = items?.map(item => {
      return {
        text: `
            INSERT INTO transaction_item (transaction_id, service, qty)
            VALUES ($1, $2, $3);
          `,
        values: [newTransactionId, item.service, item.qty],
      };
    }) ?? [];

    for (const query of transactionQueries) {
      await client.query(query.text, query.values);
    }

    const transactionDetail = await getTransactionById(newTransactionId);

    //Create Payment
    const paymentDetail = await addPayment({
      status: "Belum Dibayar",
      invoice_id: generateInvoiceId(),
      total_amount_due: transactionDetail?.total || 0,
      transaction_id: newTransactionId
    }, merchant_id);

    return {
      transaction: transactionDetail,
      payment: paymentDetail
    }
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
export async function updateTransaction(status: string, invoiceId: string): Promise<Transaction> {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE transaction
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
        FROM transaction t
        JOIN payment p ON t.id = p.transaction_id
        WHERE p.invoice_id = $2
      )
      RETURNING *;
    `;
    
    const values = [status, invoiceId];
    
    const result = await client.query(query, values);
  
    return result.rows[0];
  } finally {
    client.release(); 
  }
}

/**
 * Retrieve details of a specific transaction by its ID, including a nested list of items.
 * @param {string} transactionId - The ID of the transaction to retrieve.
 * @returns {Promise<Transaction | null>} - A promise that resolves to the transaction details or null if not found.
 */
export async function getTransactionById(transactionId: string): Promise<TransactionDetails | null> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        t.id AS transaction_id,
        t.customer AS customer_id,
        t.ready_to_pick_up_at,
        t.completed_at,
        c.name AS customer_name,
        c.phone_number AS customer_phone_number,
        d.name AS duration_name,
        t.status AS transaction_status,
        p.invoice_id AS invoice,
        SUM(sd.price * ti.qty) AS total,
        p.status AS payment_status,
        p.id AS payment_id,
        json_agg(
          json_build_object(
            'service_id', s.id,
            'service_name', s.name,
            'price', sd.price,
            'quantity', ti.qty
          )
        ) AS services
      FROM transaction t
      LEFT JOIN customer c ON t.customer = c.id
      LEFT JOIN duration d ON t.duration = d.id
      LEFT JOIN payment p ON t.id = p.transaction_id
      LEFT JOIN transaction_item ti ON t.id = ti.transaction_id
      LEFT JOIN service s ON ti.service = s.id
      LEFT JOIN service_duration sd ON sd.service = s.id AND sd.duration = d.id
      WHERE p.invoice_id = $1
      GROUP BY t.id, t.customer, c.name, c.phone_number, d.name, p.invoice_id, p.id, p.status, t.status, t.ready_to_pick_up_at, t.completed_at
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

function generateInvoiceId() {
  const prefix = 'INV';
  const timestamp = Date.now(); // Current timestamp
  return `${prefix}-${timestamp}`;
}