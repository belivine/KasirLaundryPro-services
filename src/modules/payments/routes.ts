import express, { Request, Response } from "express";
import { getPaymentByInvoiceId, updatePayment } from "./controller";
import { AuthenticatedRequest } from "src/middlewares";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         payment_received:
 *           type: number
 *           description: The total amount of payment received
 *         change_given:
 *           type: number
 *           description: The amount of change returned to the customer
 */

/**
 * @swagger
 * /payment/{invoiceId}:
 *   put:
 *     summary: Update a payment
 *     description: Update an existing payment record, including the status, payment received, and change given.
 *     tags: [Payment]
 *     parameters:
 *       - name: invoiceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       200:
 *         description: Pembayaran berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Permintaan tidak valid, input salah
 *       404:
 *         description: Pembayaran tidak ditemukan
 */
router.put('/:invoiceId', async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const { payment_received, change_given } = req.body;

  if (!payment_received || !change_given) {
    return res.status(400).json({
      error: 'Input tidak valid, status, payment_received, dan change_given diperlukan.'
    });
  }

  try {
    const updatedPayment = await updatePayment(invoiceId, { payment_received, change_given });
    res.json({
      status: 'success',
      message: 'Pembayaran berhasil diperbarui',
      data: updatedPayment
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
  }
});

/**
 * @swagger
 * /payment/{invoiceId}:
 *   get:
 *     summary: Get payment details by invoice ID
 *     description: Retrieve the payment details, including services and total amount due, for a specific payment by its invoice ID.
 *     tags: [Payment]
 *     parameters:
 *       - name: invoiceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentDetails'
 *       400:
 *         description: Invalid input, invoice ID is required
 *       404:
 *         description: Payment not found
 */
router.get('/:invoiceId', async (req: Request, res: Response) => {
  const { invoiceId } = req.params;

  if (!invoiceId) {
    return res.status(400).json({
      error: 'Input tidak valid, invoice ID diperlukan.'
    });
  }

  try {
    const paymentDetails = await getPaymentByInvoiceId(invoiceId);
    if (!paymentDetails) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    }
    
    res.json({
      status: 'success',
      message: 'Detail pembayaran berhasil diambil',
      data: paymentDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

export default router;
