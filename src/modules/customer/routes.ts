import express, { Request, Response } from "express";
import { addCustomer, GetCustomers, updateCustomer, getCustomerById, deleteCustomer } from "./controller";
import { customerSchema } from "./types";

const router = express.Router();

/**
 * @swagger
 * /customer:
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
 * /customer:
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
});

/**
 * @swagger
 * /customer/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     description: Retrieve a customer record by ID
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer to retrieve
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const customer = await getCustomerById(id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /customer/{id}:
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
router.put("/:id", (req: Request, res: Response) => {
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
});

/**
 * @swagger
 * /customer/{id}:
 *   delete:
 *     summary: Delete a customer
 *     description: Delete a customer record by ID
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer to delete
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await deleteCustomer(id);
    if (result) {
      res.status(200).json({ status: "success", message: "Customer deleted successfully" });
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

export default router;
