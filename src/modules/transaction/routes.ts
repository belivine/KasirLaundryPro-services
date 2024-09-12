import express, { Request, Response } from "express";
import {
  Transaction,
  transactionSchema,
  transactionUpdateSchema,
} from "./types";
import {
  addTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "./controller";
import { AuthenticatedRequest } from "src/middlewares";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transaction management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the transaction
 *         customer:
 *           type: string
 *           description: Customer's Name
 *         duration:
 *           type: string
 *           description: Duration Name
 *         status:
 *           type: string
 *           description: Status of the transaction
 *           enum: [Diproses, Selesai, Siap Diambil]
 *     TransactionDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the transaction
 *         customer:
 *           type: string
 *           description: UUID of the customer
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         duration:
 *           type: string
 *           description: UUID of the duration
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         customer_name:
 *           type: string
 *           description: Customer's Name
 *           example: "Brian Kliwon"
 *         duration_name:
 *           type: string
 *           description: Duration Name
 *           example: "Express"
 *         status:
 *           type: string
 *           description: Status of the transaction
 *           enum: [Diproses, Selesai, Siap Diambil]
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               service:
 *                 type: string
 *                 description: UUID of the service
 *                 example: "550e8400-e29b-41d4-a716-446655440982"
 *               service_name:
 *                 type: string
 *                 description: Name of the service
 *                 example: "Reguler"
 *               qty:
 *                 type: number
 *                 description: Total quantity per service
 *                 example: 23
 *           example: [
 *             {
 *               service: "550e8400-e29b-41d4-a716-446655440000",
 *               qty: 2
 *             },
 *             {
 *               service: "550e8400-e29b-41d4-a716-446655440001",
 *               qty: 3
 *             }
 *           ]
 *     TransactionBodyRequest:
 *       type: object
 *       required:
 *         - customer
 *         - duration
 *         - status
 *         - items
 *       properties:
 *         customer:
 *           type: string
 *           description: UUID of the customer
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         duration:
 *           type: string
 *           description: UUID of the duration
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         status:
 *           type: string
 *           description: Status of the transaction
 *           enum: [Diproses, Selesai, Siap Diambil]
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               service:
 *                 type: string
 *                 description: UUID of the service
 *                 example: "550e8400-e29b-41d4-a716-446655440982"
 *               qty:
 *                 type: number
 *                 description: Total quantity per service
 *                 example: 23
 *           example: [
 *             {
 *               service: "550e8400-e29b-41d4-a716-446655440000",
 *               qty: 2
 *             },
 *             {
 *               service: "550e8400-e29b-41d4-a716-446655440001",
 *               qty: 3
 *             }
 *           ]
 *     TransactionResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Transaction created successfully"
 *         data:
 *           $ref: '#/components/schemas/TransactionDetail'
 */

/**
 * @swagger
 * /transaction:
 *   get:
 *     summary: Get all transaction items
 *     description: Retrieve a list of all transaction items
 *     tags:
 *       - Transaction
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: 
 *             - Diproses
 *             - Selesai
 *             - Siap Diambil
 *         description: Filter by transaction status
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer UUID
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Successful retrieval of transaction items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 */
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Extract query parameters from the request
    const status = req.query.status as string | null;
    const customer = req.query.customer as string | null;
    const date_from = req.query.date_from as string | null;
    const date_to = req.query.date_to as string | null;

    // Call the getTransactions function with extracted parameters
    const transactions = await getTransactions(
      status || null,
      customer || null,
      date_from || null,
      date_to || null,
      req.userId // Assuming the user's merchant_id is retrieved from req.userId
    );

    // Send the response with the transactions data
    res.json(transactions);
  } catch (error) {
    // Handle and return any errors that occur
    const err = error as Error; // Type assertion
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Create a new transaction item
 *     description: Create a new transaction record
 *     tags:
 *       - Transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionBodyRequest'
 *     responses:
 *       201:
 *         description: Transaction item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Bad request, invalid input
 */
router.post("/", async (req: AuthenticatedRequest, res) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  try {
    const newService = await addTransaction(req.body, req.userId);
    res.status(201).json({
      status: "success",
      message: "Transaksi berhasil dibuat",
      data: newService,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "error", message: "Transaksi gagal dibuat" });
  }
});

/**
 * @swagger
 * /transaction/{id}:
 *   put:
 *     summary: Update the status of a transaction
 *     description: Update only the status field of an existing transaction record by ID, allowing only "Siap Diambil" or "Selesai" as valid statuses.
 *     tags:
 *       - Transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transaction item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: Siap Diambil
 *                 description: The new status for the transaction. Allowed values are "Siap Diambil" and "Selesai".
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Transaction item not found
 */
router.put('/:id', async (req, res) => {
  // Check if the body contains only the status field
  if (!req.body || typeof req.body.status !== 'string') {
    return res.status(400).json({
      errors: [{
        type: 'body',
        msg: 'Isi permintaan harus berisi field "status" yang valid.',
      }],
    });
  }

  const { status } = req.body;

  // Allow only 'Siap Diambil' or 'Selesai' as the valid status
  const validStatuses = ['Siap Diambil', 'Selesai'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Status tidak valid. Hanya "Siap Diambil" dan "Selesai" yang diperbolehkan.',
    });
  }

  const transactionId = req.params.id;

  try {
    const updatedTransaction = await updateTransaction(status, transactionId);
    res.json({ status: 'sukses', pesan: 'Status transaksi berhasil diperbarui', data: updatedTransaction });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: 'Transaksi tidak ditemukan' });
      } else {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  }
});


/**
 * @swagger
 * /transaction/{id}:
 *   get:
 *     summary: Get transaction item details
 *     description: Retrieve details of a specific transaction item by ID
 *     tags:
 *       - Transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transaction item to retrieve
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionDetail'
 *       404:
 *         description: Transaction item not found
 */
router.get("/:id", async (req, res) => {
  const transactionId = req.params.id;

  try {
    const duration = await getTransactionById(transactionId);
    if (!duration) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    res.json(duration);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Terjadi kesalahan server" });
    }
  }
});

export default router;
