import express, { Request, Response } from "express";
import { updatePayment } from "./controller";
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
 *         id:
 *           type: string
 *           description: Unique identifier for the payment
 *         status:
 *           type: string
 *           description: Status of the payment
 *           enum: [Belum Dibayar, Lunas]
 *         payment_received:
 *           type: number
 *           description: The total amount of payment received
 *         change_given:
 *           type: number
 *           description: The amount of change returned to the customer
 */

/**
 * @swagger
 * /payment/{id}:
 *   put:
 *     summary: Update a payment
 *     description: Update an existing payment record, including the status, payment received, and change given.
 *     tags: [Payment]
 *     parameters:
 *       - name: id
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
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, payment_received, change_given } = req.body;

  if (!status || !payment_received || !change_given) {
    return res.status(400).json({
      error: 'Input tidak valid, status, payment_received, dan change_given diperlukan.'
    });
  }

  try {
    const updatedPayment = await updatePayment(id, { status, payment_received, change_given });
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

export default router;
