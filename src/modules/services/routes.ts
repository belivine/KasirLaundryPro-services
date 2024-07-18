import express from 'express';
import { Service } from './types';
import { serviceItems } from './data'; // Importing the serviceItems array

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Service
 *   description: Service management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Duration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Duration ID
 *         price:
 *           type: number
 *           description: Price for the duration
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the service
 *         name:
 *           type: string
 *           description: Service name
 *         satuan:
 *           type: string
 *           description: Unit of measurement
 *         durations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Duration'
 */

/**
 * @swagger
 * /v1/service:
 *   get:
 *     summary: Get all services
 *     description: Retrieve a list of all services
 *     tags: [Service]
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
router.get('/', (req, res) => {
  res.json(serviceItems); // Replace with your logic to fetch services
});

/**
 * @swagger
 * /v1/service:
 *   post:
 *     summary: Create a new service
 *     description: Create a new service record
 *     tags: [Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Bad request, invalid input
 */
router.post('/', (req, res) => {
  const { id, name, satuan, durations } = req.body;

  if (!id || !name || !satuan || !durations) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newService: Service = { id, name, satuan, durations };
  serviceItems.push(newService);

  res.status(201).json(newService); // Replace with your logic to create a new service
});

/**
 * @swagger
 * /v1/service/{id}:
 *   get:
 *     summary: Get a service by ID
 *     description: Retrieve a service by its ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service to retrieve
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
router.get('/:id', (req, res) => {
  const serviceId = req.params.id;
  const service = serviceItems.find(service => service.id === serviceId);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json(service); // Replace with your logic to fetch a service by ID
});

/**
 * @swagger
 * /v1/service/{id}:
 *   put:
 *     summary: Update a service
 *     description: Update an existing service record by ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Service not found
 */
router.put('/:id', (req, res) => {
  const serviceId = req.params.id;
  const { name, satuan, durations } = req.body;

  const serviceIndex = serviceItems.findIndex(service => service.id === serviceId);

  if (serviceIndex === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }

  if (!name || !satuan || !durations) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  serviceItems[serviceIndex] = { id: serviceId, name, satuan, durations };

  res.json(serviceItems[serviceIndex]); // Replace with your logic to update the service
});

/**
 * @swagger
 * /v1/service/{id}:
 *   delete:
 *     summary: Delete a service
 *     description: Delete a service record by ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service to delete
 *     responses:
 *       204:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 */
router.delete('/:id', (req, res) => {
  const serviceId = req.params.id;

  const serviceIndex = serviceItems.findIndex(service => service.id === serviceId);

  if (serviceIndex === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }

  serviceItems.splice(serviceIndex, 1);

  res.status(204).send(); // Replace with your logic to delete the service
});

export default router;
