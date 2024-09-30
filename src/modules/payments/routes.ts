import express, { Request, Response } from "express";
import { getPaymentByInvoiceId, updatePayment } from "./controller";

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
 *     ServicePayment:
 *       type: object
 *       properties:
 *         service_id:
 *           type: string
 *           description: The unique identifier of the service.
 *         service_name:
 *           type: string
 *           description: The name of the service.
 *         price:
 *           type: number
 *           description: The price of the service.
 *         quantity:
 *           type: number
 *           description: The quantity of the service.
 *     PaymentDetails:
 *       type: object
 *       properties:
 *         payment_received:
 *           type: number
 *           description: The total amount of payment received.
 *         change_given:
 *           type: number
 *           description: The amount of change returned to the customer.
 *         services:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ServicePayment'
 *           description: List of services included in the payment.
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Pembayaran berhasil dilakukan"
 *     PaymentRequest:
 *       type: object
 *       properties:
 *         payment_received:
 *           type: number
 *           example: 100000
 *         change_given:
 *           type: number
 *           example: 30000
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
 *             $ref: '#/components/schemas/PaymentRequest'
 *     responses:
 *       200:
 *         description: Payment successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Invalid request, wrong input
 *       404:
 *         description: Payment not found
 */
router.put('/:invoiceId', async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const { payment_received, change_given } = req.body;

  if (!payment_received || change_given < 0) {
    return res.status(400).json({
      message: 'Input tidak valid, payment_received dan change_given diperlukan.'
    });
  }

  try {
    const updatedPayment = await updatePayment(invoiceId, { payment_received, change_given });
    res.json({
      status: 'sukses',
      message: 'Pembayaran berhasil diperbarui.',
      data: updatedPayment
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'Pembayaran tidak ditemukan.' });
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
      message: 'Input tidak valid, ID faktur diperlukan.'
    });
  }

  try {
    const paymentDetails = await getPaymentByInvoiceId(invoiceId);
    if (!paymentDetails) {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan.' });
    }
    
    res.json({
      status: 'sukses',
      message: 'Detail pembayaran berhasil diambil.',
      data: paymentDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});


export default router;
