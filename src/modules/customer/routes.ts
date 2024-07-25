import express, { Request, Response } from "express";
import { addCustomer, GetCustomers, updateCustomer } from "./controller";
import { customerSchema } from "./types";

const router = express.Router();

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
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         name:
 *           type: string
 *           description: Customer's name
 *           example: "John Doe"
 *         phone_number:
 *           type: string
 *           description: Customer's phone number
 *           example: "089121333242"
 *         email:
 *           type: string
 *           description: Customer's email address
 *           example: "johndoe@gmail.com"
 *         address:
 *           type: string
 *           description: Customer's address
 *           example: "Jl. Kaliurang 190222"
 *         gender:
 *           type: string
 *           description: Customer's gender
 *           enum:
 *             - Laki-laki
 *             - Perempuan
 *           example: "Laki-laki"
 *     CustomerRequestBody:
 *       type: object
 *       required:
 *           - name
 *           - gender
 *       properties:
 *         name:
 *           type: string
 *           description: Customer's name
 *           example: "John Doe"
 *         phone_number:
 *           type: string
 *           description: Customer's phone number
 *           example: "089121333242"
 *         email:
 *           type: string
 *           description: Customer's email address
 *           example: "johndoe@gmail.com"
 *         address:
 *           type: string
 *           description: Customer's address
 *           example: "Jl. Kaliurang 190222"
 *         gender:
 *           type: string
 *           description: Customer's gender
 *           enum:
 *             - Laki-laki
 *             - Perempuan
 *           example: "Laki-laki"
 *     CustomerResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Customer created successfully"
 *         data:
 *           $ref: '#/components/schemas/Customer'
 */

/**
 * @swagger
 * /api/customer:
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
router.get("/", async (req, res) => {
  try {
    const data = await GetCustomers();
    res.json(data);
  } catch (error) {
    const err = error as Error; // Type assertion
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/customer:
 *   post:
 *     summary: Create a new customer
 *     description: Create a new customer record
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerRequestBody'
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerResponse'
 *       400:
 *         description: Bad request, invalid input
 */
router.post("/", (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      errors: [{
        type: 'body',
        msg: 'Request body is missing or invalid',
      }],
    });
  }

  const { error, value } = customerSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      errors: error.details.map(err => ({
        type: 'field',
        msg: err.message,
        path: err.path[0],
        location: 'body'
      }))
    });
  }

  const { name, phone_number, email, address, gender } = req.body;
  addCustomer({ name, phone_number, email, address, gender })
    .then((newCustomer) =>
      res.status(201).json({
        status: "success",
        message: "Customer created successfully",
        data: newCustomer
      })
    )
    .catch((error) => {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    });
  }
);

/**
 * @swagger
 * /api/customer/{id}:
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
 *             $ref: '#/components/schemas/CustomerRequestBody'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerResponse'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Customer not found
 */
router.put("/:id",(req: Request, res: Response) => {
    const { error, value } = customerSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        errors: error.details.map(err => ({
          type: 'field',
          msg: err.message,
          path: err.path[0],
          location: 'body'
        }))
      });
    }

  const { id } = req.params;
  const { name, phone_number, email, address, gender } = req.body;

  updateCustomer(id, { name, phone_number, email, address, gender })
    .then((updatedCustomer) =>
      res.status(200).json({
        status: "success",
        message: "Customer updated successfully",
        data: updatedCustomer
      })
    )
    .catch((error) => {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    });
  }
);

export default router;
