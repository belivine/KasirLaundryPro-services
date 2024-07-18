import express from 'express';
import { Customer } from './types';

const router = express.Router();
const customers: Customer[] = [
  { id: '1', name: 'John Doe', phone_number: '123456789', email: 'john@example.com', address: '123 Main St', gender: "Laki-laki" },
  { id: '2', name: 'Jane Smith', phone_number: '987654321', email: 'jane@example.com', address: '456 Elm St', gender:"Laki-laki" },
];

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Customer's name
 *         phone_number:
 *           type: string
 *           description: Customer's phone number
 *         email:
 *           type: string
 *           description: Customer's email address
 *         address:
 *           type: string
 *           description: Customer's address
 *         gender:
 *           type: string
 *           description: Customer's gender
 *           enum:
 *             - Laki-laki
 *             - Perempuan
 */

/**
 * @swagger
 * /v1/customer:
 *   get:
 *     summary: Get all customers
 *     description: Retrieve a list of all customers
 *     tags: [Customer]
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
  res.json(customers); // Replace with your logic to fetch customers
});

/**
 * @swagger
 * /v1/customer:
 *   post:
 *     summary: Create a new customer
 *     description: Create a new customer record
 *     tags: [Customer]
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
  const { name, phone_number, email, address, gender } = req.body;

  if (!name || !phone_number || !email || !address || !gender) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  res.status(201).json(null); // Replace with your logic to create a new customer
});

/**
 * @swagger
 * /v1/customer/{id}:
 *   put:
 *     summary: Update a customer
 *     description: Update an existing customer record by ID
 *     tags: [Customer]
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
  res.json(null); // Replace with your logic to update the customer
});

export default router;
