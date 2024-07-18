import express from 'express';
import { Duration, DurationType } from './types';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Duration
 *   description: Duration management APIs
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
 *           description: Unique identifier for the duration
 *         name:
 *           type: string
 *           description: Name of the duration
 *         duration:
 *           type: number
 *           description: Duration value
 *         type:
 *           type: string
 *           enum:
 *             - Hari
 *             - Jam
 *           description: Type of duration (Hari or Jam)
 */

let durations: Duration[] = [
  { id: '1', name: 'One Day', duration: 1, type: DurationType.Hari },
  { id: '2', name: 'Two Hours', duration: 2, type: DurationType.Jam },
];

/**
 * @swagger
 * /v1/duration:
 *   get:
 *     summary: Get all durations
 *     description: Retrieve a list of all durations
 *     tags: [Duration]
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Duration'
 */
router.get('/', (req, res) => {
  res.json(durations);
});

/**
 * @swagger
 * /v1/duration:
 *   post:
 *     summary: Create a new duration
 *     description: Create a new duration record
 *     tags: [Duration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Duration'
 *     responses:
 *       201:
 *         description: Duration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Duration'
 *       400:
 *         description: Bad request, invalid input
 */
router.post('/', (req, res) => {
  const { id, name, duration, type } = req.body;

  if (!id || !name || !duration || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newDuration: Duration = { id, name, duration, type };
  durations.push(newDuration);

  res.status(201).json(newDuration);
});

/**
 * @swagger
 * /v1/duration/{id}:
 *   put:
 *     summary: Update a duration
 *     description: Update an existing duration record by ID
 *     tags: [Duration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the duration to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Duration'
 *     responses:
 *       200:
 *         description: Duration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Duration'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Duration not found
 */
router.put('/:id', (req, res) => {
  const durationId = req.params.id;
  const { name, duration, type } = req.body;

  const durationIndex = durations.findIndex(duration => duration.id === durationId);

  if (durationIndex === -1) {
    return res.status(404).json({ error: 'Duration not found' });
  }

  if (!name || !duration || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  durations[durationIndex] = { id: durationId, name, duration, type };

  res.json(durations[durationIndex]);
});

/**
 * @swagger
 * /v1/duration/{id}:
 *   delete:
 *     summary: Delete a duration
 *     description: Delete a duration record by ID
 *     tags: [Duration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the duration to delete
 *     responses:
 *       204:
 *         description: Duration deleted successfully
 *       404:
 *         description: Duration not found
 */
router.delete('/:id', (req, res) => {
  const durationId = req.params.id;

  const durationIndex = durations.findIndex(duration => duration.id === durationId);

  if (durationIndex === -1) {
    return res.status(404).json({ error: 'Duration not found' });
  }

  durations.splice(durationIndex, 1);

  res.status(204).send();
});

/**
 * @swagger
 * /v1/duration/{id}:
 *   get:
 *     summary: Get a duration by ID
 *     description: Retrieve a duration by its ID
 *     tags: [Duration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the duration to retrieve
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Duration'
 *       404:
 *         description: Duration not found
 */
router.get('/:id', (req, res) => {
  const durationId = req.params.id;
  const duration = durations.find(duration => duration.id === durationId);

  if (!duration) {
    return res.status(404).json({ error: 'Duration not found' });
  }

  res.json(duration);
});

export default router;
