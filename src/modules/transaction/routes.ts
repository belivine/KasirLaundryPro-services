import express from 'express';
import { Transaction } from './types';

const router = express.Router();
const laundryItems: Transaction[] = [
  // Example data
  {
    id: '1',
    customer: 'customer-uuid-1',
    duration: 'duration-uuid-1',
    qty: 5,
    service: 'service-uuid-1',
    status: 'Diproses',
  },
  {
    id: '2',
    customer: 'customer-uuid-2',
    duration: 'duration-uuid-2',
    qty: 10,
    service: 'service-uuid-2',
    status: 'Selesai',
  },
];

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
 *           description: Customer's UUID
 *         duration:
 *           type: string
 *           description: Duration UUID
 *         qty:
 *           type: number
 *           description: Quantity of transaction items
 *         service:
 *           type: string
 *           description: Service UUID
 *         status:
 *           type: string
 *           description: Status of the transaction
 *           enum: [Diproses, Selesai, Siap Diambil]
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 */
router.get('/', (req, res) => {
  res.json(laundryItems); // Replace with your logic to fetch transaction items
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
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request, invalid input
 */
router.post('/', (req, res) => {
  const { id, customer, duration, qty, service, status } = req.body;

  if (!id || !customer || !duration || !qty || !service || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newLaundry: Transaction = { id, customer, duration, qty, service, status };
  laundryItems.push(newLaundry);

  res.status(201).json(newLaundry); // Replace with your logic to create a new transaction item
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
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Transaction item not found
 */
router.put('/:id', (req, res) => {
  const laundryId = req.params.id;
  const { customer, duration, qty, service, status } = req.body;

  const laundryIndex = laundryItems.findIndex(transaction => transaction.id === laundryId);

  if (laundryIndex === -1) {
    return res.status(404).json({ error: 'Transaction item not found' });
  }

  if (!customer || !duration || !qty || !service || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  laundryItems[laundryIndex] = {
    id: laundryId,
    customer,
    duration,
    qty,
    service,
    status,
  };

  res.json(laundryItems[laundryIndex]); // Replace with your logic to update the transaction item
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
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction item not found
 */
router.get('/:id', (req, res) => {
  const laundryId = req.params.id;

  const laundryItem = laundryItems.find(transaction => transaction.id === laundryId);

  if (!laundryItem) {
    return res.status(404).json({ error: 'Transaction item not found' });
  }

  res.json(laundryItem); // Replace with your logic to fetch the transaction item details
});

export default router;
