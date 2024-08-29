import { Transaction } from "./types";
import pool from "../../database/postgres";

/**
 * Retrieve a list of transactions with optional filters for status, customer, and date.
 * @param {string | null} status - Optional filter by transaction status.
 * @param {string | null} customer - Optional filter by customer UUID.
 * @param {string | null} date - Optional filter by date created (in YYYY-MM-DD format).
 * @returns {Promise<Transaction[]>} - A promise that resolves to an array of transactions.
 */
export async function getTransactions(
  status: string | null = null,
  customer: string | null = null,
  date: string | null = null
): Promise<Transaction[]> {
  const client = await pool.connect();
  try {
    const query = `
        SELECT 
            t.id AS transaction_id,
            t.customer AS customer_id,
            c.name AS customer_name,
            t.duration AS duration_id,
            d.name AS duration_name,
            t.status AS transaction_status
        FROM transaction t
        LEFT JOIN customer c ON t.customer = c.id
        LEFT JOIN duration d ON t.duration = d.id
        WHERE 
            ($1::text IS NULL OR t.status = $1)
            AND ($2::uuid IS NULL OR t.customer = $2::uuid)
            AND ($3::date IS NULL OR t.created_at::date = $3)
      `;

    const result = await client.query(query, [status, customer, date ? new Date(date) : null]);

    return result.rows.map(row => ({
      id: row.transaction_id,
      customer: row.customer_id,
      customer_name: row.customer_name,
      duration: row.duration_id,
      duration_name: row.duration_name,
      status: row.transaction_status,
    }));
  } finally {
    client.release();
  }
}


/**
 * Add a new transaction to the database.
 * @param transaction - The transaction data to add.
 * @returns {Promise<Service>} - A promise that resolves to the newly created transaction.
 */
export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
  const client = await pool.connect();
  try {
    const { customer, duration, status, items } = transaction;
    const query = `
        INSERT INTO transaction (customer, duration, status)
        VALUES ($1, $2, $3) RETURNING id;
      `;
    const values = [customer, duration, status];
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
    return transactionDetail
  } finally {
    client.release();
  }
}

/**
 * Retrieve details of a specific transaction by its ID, including a nested list of items.
 * @param {string} transactionId - The ID of the transaction to retrieve.
 * @returns {Promise<Transaction | null>} - A promise that resolves to the transaction details or null if not found.
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const client = await pool.connect();
  try {
    const query = `
        SELECT 
            t.id AS transaction_id,
            t.customer AS customer_id,
            c.name AS customer_name,
            t.duration AS duration_id,
            d.name AS duration_name,
            t.status AS transaction_status,
            json_agg(
                json_build_object(
                    'service', s.id,
                    'service_name', s.name,
                    'qty', ti.qty
                )
            ) AS items
        FROM transaction t
        LEFT JOIN customer c ON t.customer = c.id
        LEFT JOIN duration d ON t.duration = d.id
        LEFT JOIN transaction_item ti ON t.id = ti.transaction_id
        LEFT JOIN service s ON ti.service = s.id
        WHERE t.id = $1
        GROUP BY t.id, c.name, d.name
      `;

    const result = await client.query(query, [transactionId]);
    if (result.rows.length === 0) {
      return null; // No transaction found
    }

    const row = result.rows[0];
    return {
      id: row.transaction_id,
      customer: row.customer_id,
      customer_name: row.customer_name,
      duration: row.duration_id,
      duration_name: row.duration_name,
      status: row.transaction_status,
      items: row.items
    };
  } finally {
    client.release();
  }
}