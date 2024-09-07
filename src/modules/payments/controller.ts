import pool from "../../database/postgres";
import { Payment, PaymentInput } from "./types";
/**
 * Add a new payment to the database.
 * @param payment - The payment data to add.
 * @returns {Promise<Payment>} - A promise that resolves to the newly created payment.
 */
export async function addPayment(
    payment: Omit<PaymentInput, "id">,
    merchant_id?: string
): Promise<Payment | null> {
    const client = await pool.connect();
    try {
        const { status, invoice_id, transaction_id, total_amount_due } = payment;
        const query = `
          INSERT INTO payment (status, invoice_id, transaction_id, total_amount_due, merchant_id)
          VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;
        const values = [
            status,
            invoice_id,
            transaction_id,
            total_amount_due,
            merchant_id,
        ];
        const result = await client.query(query, values);
        const newPaymentId = result.rows[0].id;
        const paymentDetail = await getPaymentById(newPaymentId);
        return paymentDetail;
    } finally {
        client.release();
    }
}

/**
 * Update an existing payment in the database.
 * @param id - The ID of the payment to update
 * @param paymentParams - The updated payment data (status and change given).
 * @returns {Promise<Payment>} - A promise that resolves to the updated payment.
 */
export async function updatePayment(id: string, paymentParams: { status: string, change_given: number, payment_received: number }): Promise<Payment> {
    const client = await pool.connect();
    try {
      const { status, change_given, payment_received} = paymentParams;
      const query = `
        UPDATE payment
        SET status = $1,
            payment_received = $2,
            change_given = $3
        WHERE id = $4
        RETURNING *;
      `;
      const values = [status, payment_received, change_given, id];
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
}

/**
 * Retrieve a specific payment by its ID.
 * @param id - The ID of the payment to retrieve.
 * @returns {Promise<Payment | null>} - A promise that resolves to the payment if found, or null if not found.
 */
export async function getPaymentById(id: string): Promise<Payment | null> {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM payment WHERE id = $1", [id]);
        return res.rows[0] || null;
    } finally {
        client.release();
    }
}
