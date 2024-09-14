import pool from "../../database/postgres";
import { Payment, PaymentDetails, PaymentInput } from "./types";

/**
 * Add a new payment to the database.
 * @param payment - The payment data to be added (excluding ID).
 * @param merchant_id - The optional merchant ID.
 * @returns {Promise<PaymentDetails | null>} - A promise that resolves to the payment details with services or null if not found.
 */
export async function addPayment(
    payment: Omit<PaymentInput, "id">,
    merchant_id?: string
): Promise<PaymentDetails | null> {
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
            merchant_id || null,  
        ];

        const result = await client.query(query, values);
        const newPaymentId = result.rows[0].id;

        const paymentDetail = await getPaymentByInvoiceId(invoice_id);

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
export async function updatePayment(invoiceId: string, paymentParams: { change_given: number, payment_received: number }): Promise<Payment> {
    const client = await pool.connect();
    try {
      const { change_given, payment_received} = paymentParams;
      const query = `
        UPDATE payment
        SET status = 'Lunas',
            payment_received = $1,
            change_given = $2
        WHERE invoice_id = $3
        RETURNING *;
      `;
      const values = [payment_received, change_given, invoiceId];
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
}

/**
 * Retrieve a specific payment by its invoice ID, along with services and total amount.
 * @param invoiceId - The invoice ID of the payment to retrieve.
 * @returns {Promise<PaymentDetails | null>} - A promise that resolves to the payment details with services or null if not found.
 */
export async function getPaymentByInvoiceId(invoiceId: string): Promise<PaymentDetails | null> {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                p.id AS payment_id,
                p.invoice_id AS invoice,
                SUM(sd.price * ti.qty) AS total,
                p.status AS payment_status,
                json_agg(
                    json_build_object(
                        'service_id', s.id,
                        'service_name', s.name,
                        'price', sd.price,
                        'quantity', ti.qty
                    )
                ) AS services
            FROM transaction t
            LEFT JOIN payment p ON t.id = p.transaction_id
            LEFT JOIN transaction_item ti ON t.id = ti.transaction_id
            LEFT JOIN service s ON ti.service = s.id
            LEFT JOIN service_duration sd ON sd.service = s.id AND sd.duration = t.duration
            WHERE p.invoice_id = $1
            GROUP BY p.id, p.invoice_id, p.status
        `, [invoiceId]);

        return res.rows[0] || null;
    } finally {
        client.release();
    }
}