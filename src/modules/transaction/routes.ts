import express, { Request, Response } from "express";
import {
  transactionSchema,
} from "./types";
import {
  addTransaction,
  getInvoiceById,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "./controller";
import { AuthenticatedRequest } from "../../middlewares";

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
 *           description: UUID of the customer
 *         duration:
 *           type: string
 *           description: UUID of the duration
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
 *         customer_name:
 *           type: string
 *           description: Customer's Name
 *           example: "Brian Kliwon"
 *         customer_phone_number:
 *           type: string
 *           description: Customer's Phone Number
 *           example: "+1234567890"
 *         duration_name:
 *           type: string
 *           description: Name of the duration
 *           example: "Express"
 *         total:
 *           type: number
 *           format: float
 *           description: Total amount for the transaction
 *           example: 150.75
 *         payment_id:
 *           type: integer
 *           description: ID of the associated payment
 *           example: 12345
 *         payment_status:
 *           type: string
 *           description: Status of the payment
 *           example: "Completed"
 *         invoice:
 *           type: string
 *           description: Invoice number associated with the transaction
 *           example: "INV-001"
 *         services:
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
 *               service_name: "Service A",
 *               qty: 2
 *             },
 *             {
 *               service: "550e8400-e29b-41d4-a716-446655440001",
 *               service_name: "Service B",
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
 *     InvoiceDetail:
 *       type: object
 *       properties:
 *         merchant:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Merchant's name
 *             logo:
 *               type: string
 *               description: Merchant's logo URL
 *             address:
 *               type: string
 *               description: Merchant's address
 *             note:
 *               type: string
 *               description: Note from the merchant
 *         customer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Customer's name
 *             address:
 *               type: string
 *               description: Customer's address
 *             phone_number:
 *               type: string
 *               description: Customer's phone number
 *             email:
 *               type: string
 *               description: Customer's email address
 *         transaction:
 *           type: object
 *           properties:
 *             entry_date:
 *               type: string
 *               format: date-time
 *               description: The date the transaction was created
 *             ready_to_pickup_date:
 *               type: string
 *               format: date-time
 *               description: The date the transaction is ready for pickup
 *             completed_date:
 *               type: string
 *               format: date-time
 *               description: The date the transaction was completed
 *             duration:
 *               type: string
 *               description: The duration of the service
 *             services:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   service_name:
 *                     type: string
 *                     description: Name of the service
 *                   price:
 *                     type: number
 *                     format: float
 *                     description: Price of the service
 *                   quantity:
 *                     type: integer
 *                     description: Quantity of the service
 *                   total_price:
 *                     type: number
 *                     format: float
 *                     description: Total price for the service (price * quantity)
 *             total_price:
 *               type: number
 *               format: float
 *               description: Total price of the transaction
 *             payment_received:
 *               type: number
 *               format: float
 *               description: Amount of payment received
 *             change_given:
 *               type: number
 *               format: float
 *               description: Change given to the customer
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
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter by customer name or invoice ID
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
    const { status, filter, date_from, date_to } = req.query;

    const transactions = await getTransactions(
      status as string || null,
      filter as string || null,
      date_from as string || null,
      date_to as string || null,
      req.userId
    );

    res.json(transactions);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
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
    return res.status(400).json({ status: "error", message: error.details[0].message });
  }

  try {
    const newTransaction = await addTransaction(req.body, req.userId);
    res.status(201).json({
      status: "success",
      message: "Transaksi berhasil dibuat",
      data: newTransaction,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Transaksi gagal dibuat" });
  }
});

/**
 * @swagger
 * /transaction/{invoiceId}:
 *   put:
 *     summary: Update the status of a transaction
 *     description: Update the status field of an existing transaction record by ID.
 *     tags:
 *       - Transaction
 *     parameters:
 *       - in: path
 *         name: invoiceId
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
router.put("/:invoiceId", async (req, res) => {
  if (!req.body || typeof req.body.status !== "string") {
    return res.status(400).json({ message: 'Invalid request. "status" field is required.' });
  }

  try {
    const invoiceId = req.params.invoiceId;
    const updatedTransaction = await updateTransaction(req.body.status, invoiceId);

    if (updatedTransaction) {
      res.status(200).json({
        status: "success",
        message: "Transaction status updated successfully",
        data: updatedTransaction,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Transaksi tidak ditemukan",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal membuat layanan" });
  }
});

/**
 * @swagger
 * /transaction/{invoiceId}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieve a transaction by its ID, including the customer, duration, status, and a list of items.
 *     tags:
 *       - Transaction
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionDetail'
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Gagal membuat layanan
 */
router.get("/:invoiceId", async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.invoiceId;
    const transaction = await getTransactionById(invoiceId);

    if (transaction) {
      res.status(200).json(transaction);
    } else {
      res.status(404).json({ status: "error", message: "Transaksi tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat layanan" });
  }
});

/**
 * @swagger
 * /transaction/invoice/{invoiceId}:
 *   get:
 *     summary: Get transaction by invoice ID
 *     description: Retrieve a transaction by its invoice ID, including the merchant, customer, transaction details, and a list of services.
 *     tags:
 *       - Transaction
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The invoice ID of the transaction to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvoiceDetail'
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Gagal membuat layanan
 */
router.get("/invoice/:invoiceId", async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.invoiceId;
    const transaction = await getInvoiceById(invoiceId);

    if (transaction) {
      res.status(200).json(transaction);
    } else {
      res.status(404).json({ status: "error", message: "Transaksi tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal membuat layanan" });
  }
});

export default router;
