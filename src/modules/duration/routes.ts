import express from 'express';
import { Duration, durationSchema, DurationType } from './types';
import { getDurations, getDurationById, addDuration, updateDuration, deleteDuration } from './controller';

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
 *           example: "1"
 *         name:
 *           type: string
 *           description: Name of the duration
 *           example: "One Day"
 *         duration:
 *           type: number
 *           description: Duration value
 *           example: 1
 *         type:
 *           type: string
 *           enum:
 *             - Hari
 *             - Jam
 *           description: Type of duration (Hari or Jam)
 *           example: "Hari"
 *     DurationRequestBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the duration
 *           example: "One Day"
 *         duration:
 *           type: number
 *           description: Duration value
 *           example: 1
 *         type:
 *           type: string
 *           enum:
 *             - Hari
 *             - Jam
 *           description: Type of duration (Hari or Jam)
 *           example: "Hari"
 *     DurationResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Duration created successfully"
 *         data:
 *           $ref: '#/components/schemas/Duration'
 */

/**
 * @swagger
 * /api/duration:
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
router.get('/', async (req, res) => {
  try {
    const durations = await getDurations();
    res.json(durations);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

/**
 * @swagger
 * /api/duration:
 *   post:
 *     summary: Create a new duration
 *     description: Create a new duration record
 *     tags: [Duration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DurationRequestBody'
 *     responses:
 *       201:
 *         description: Duration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DurationResponse'
 *       400:
 *         description: Bad request, invalid input
 */
router.post('/', async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      errors: [{
        type: 'body',
        msg: 'Request body is missing or invalid',
      }],
    });
  }

  const { error, value } = durationSchema.validate(req.body, { abortEarly: false });
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

  const { id, name, duration, type } = req.body;
  try {
    const newDuration = await addDuration({ name, duration, type });
    res.status(201).json({ status: 'success', message: 'Duration created successfully', data: newDuration });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

/**
 * @swagger
 * /api/duration/{id}:
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
 *             $ref: '#/components/schemas/DurationRequestBody'
 *     responses:
 *       200:
 *         description: Duration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DurationResponse'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Duration not found
 */
router.put('/:id', async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      errors: [{
        type: 'body',
        msg: 'Request body is missing or invalid',
      }],
    });
  }

  const { error, value } = durationSchema.validate(req.body, { abortEarly: false });
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

  const { id, name, duration, type } = req.body;
  const durationId = req.params.id;
  try {
    const updatedDuration = await updateDuration(durationId, { name, duration, type });
    res.json({ status: 'success', message: 'Duration updated successfully', data: updatedDuration });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: 'Duration not found' });
      } else {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

/**
 * @swagger
 * /api/duration/{id}:
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
 *       200:
 *         description: Duration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Duration deleted successfully"
 *       404:
 *         description: Duration not found
 */
router.delete('/:id', async (req, res) => {
  const durationId = req.params.id;
  try {
    await deleteDuration(durationId);
    res.status(200).json({
      status: 'success',
      message: 'Duration deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: 'Duration not found' });
      } else {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

/**
 * @swagger
 * /api/duration/{id}:
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
router.get('/:id', async (req, res) => {
  const durationId = req.params.id;

  try {
    const duration = await getDurationById(durationId);
    if (!duration) {
      return res.status(404).json({ error: 'Duration not found' });
    }
    res.json(duration);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

export default router;
