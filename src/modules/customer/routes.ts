import express from 'express';
import { Customer } from './types';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer management APIs
 */

let customers: Customer[] = [
  { id: '1', name: 'John Doe', phone_number: '123456789', email: 'john@example.com', address: '123 Main St' },
  { id: '2', name: 'Jane Smith', phone_number: '987654321', email: 'jane@example.com', address: '456 Elm St' },
];

/**
 * @swagger
 * /v1/customer:
 *   get:
 *     summary: Get all customers
 *     description: Retrieve a list of all customers
 *     tags: 
 *       - Customer 
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 */
router.get('/', (req, res) => {
  res.json(customers);
});

/**
 * @swagger
 * /v1/customer:
 *   post:
 *     summary: Create a new customer
 *     description: Create a new customer record
 *     tags: 
 *       - Customer 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request, invalid input
 */
router.post('/', (req, res) => {
  const { id, name, phone_number, email, address } = req.body;

  if (!id || !name || !phone_number || !email || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newCustomer: Customer = { id, name, phone_number, email, address };
  customers.push(newCustomer);

  res.status(201).json(newCustomer);
});

/**
 * @swagger
 * /v1/customer/{id}:
 *   put:
 *     summary: Update a customer
 *     description: Update an existing customer record by ID
 *     tags: 
 *       - Customer 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Customer not found
 */
router.put('/:id', (req, res) => {
  const customerId = req.params.id;
  const { name, phone_number, email, address } = req.body;

  const customerIndex = customers.findIndex(cust => cust.id === customerId);

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  if (!name || !phone_number || !email || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  customers[customerIndex] = {
    id: customerId,
    name,
    phone_number,
    email,
    address,
  };

  res.json(customers[customerIndex]);
});

export default router;
