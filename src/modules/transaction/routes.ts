import express, { Request, Response } from 'express';
import { Transaction, transactionSchema } from './types';
import { addTransaction, getTransactions } from './controller';

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
 *           enum: [Diproses, Selesai, Siap Diambil]
 *         description: Filter by transaction status
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer UUID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Filter by date created
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Extract query parameters from the request
    const status = req.query.status as string | null;
    const customer = req.query.customer as string | null;
    const date = req.query.date as string | null;

    // Call the getTransactions function with extracted parameters
    const transactions = await getTransactions(status || null, customer || null, date || null);

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
router.post('/', async (req, res) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'error', message: error.details[0].message });
  }

  try {
    const newService = await addTransaction(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Transaction created successfully',
      data: newService
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: 'Failed to create transaction' });
  }
});

/**
 * @swagger
 * /transaction/{id}:
 *   put:
 *     summary: Update a transaction item
 *     description: Update an existing transaction record by ID
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
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Transaction item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Transaction item not found
 */
router.put('/:id', (req, res) => {
  res.json({
    status: 'success',
    message: 'Transaction updated successfully',
  }); // Replace with your logic to update the transaction item
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
router.get('/:id', (req, res) => {
  res.json({
    status: 'success',
    message: 'Transaction retrieved successfully',
    data: []
  }); // Replace with your logic to fetch the transaction item details
});

export default router;
