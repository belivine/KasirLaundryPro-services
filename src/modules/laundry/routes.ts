import express from 'express';
import { Laundry } from './types';

const router = express.Router();
const laundryItems: Laundry[] = [
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
 *   name: Laundry
 *   description: Laundry management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Laundry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the laundry
 *         customer:
 *           type: string
 *           description: Customer's UUID
 *         duration:
 *           type: string
 *           description: Duration UUID
 *         qty:
 *           type: number
 *           description: Quantity of laundry items
 *         service:
 *           type: string
 *           description: Service UUID
 *         status:
 *           type: string
 *           description: Status of the laundry
 *           enum: [Diproses, Selesai, Siap Diambil]
 */

/**
 * @swagger
 * /laundry:
 *   get:
 *     summary: Get all laundry items
 *     description: Retrieve a list of all laundry items
 *     tags:
 *       - Laundry
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Diproses, Selesai, Siap Diambil]
 *         description: Filter by laundry status
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
 *                 $ref: '#/components/schemas/Laundry'
 */
router.get('/', (req, res) => {
  res.json(laundryItems); // Replace with your logic to fetch laundry items
});

/**
 * @swagger
 * /laundry:
 *   post:
 *     summary: Create a new laundry item
 *     description: Create a new laundry record
 *     tags:
 *       - Laundry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Laundry'
 *     responses:
 *       201:
 *         description: Laundry item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Laundry'
 *       400:
 *         description: Bad request, invalid input
 */
router.post('/', (req, res) => {
  const { id, customer, duration, qty, service, status } = req.body;

  if (!id || !customer || !duration || !qty || !service || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newLaundry: Laundry = { id, customer, duration, qty, service, status };
  laundryItems.push(newLaundry);

  res.status(201).json(newLaundry); // Replace with your logic to create a new laundry item
});

/**
 * @swagger
 * /laundry/{id}:
 *   put:
 *     summary: Update a laundry item
 *     description: Update an existing laundry record by ID
 *     tags:
 *       - Laundry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the laundry item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Laundry'
 *     responses:
 *       200:
 *         description: Laundry item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Laundry'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Laundry item not found
 */
router.put('/:id', (req, res) => {
  const laundryId = req.params.id;
  const { customer, duration, qty, service, status } = req.body;

  const laundryIndex = laundryItems.findIndex(laundry => laundry.id === laundryId);

  if (laundryIndex === -1) {
    return res.status(404).json({ error: 'Laundry item not found' });
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

  res.json(laundryItems[laundryIndex]); // Replace with your logic to update the laundry item
});

/**
 * @swagger
 * /laundry/{id}:
 *   get:
 *     summary: Get laundry item details
 *     description: Retrieve details of a specific laundry item by ID
 *     tags:
 *       - Laundry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the laundry item to retrieve
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Laundry'
 *       404:
 *         description: Laundry item not found
 */
router.get('/:id', (req, res) => {
  const laundryId = req.params.id;

  const laundryItem = laundryItems.find(laundry => laundry.id === laundryId);

  if (!laundryItem) {
    return res.status(404).json({ error: 'Laundry item not found' });
  }

  res.json(laundryItem); // Replace with your logic to fetch the laundry item details
});

export default router;
