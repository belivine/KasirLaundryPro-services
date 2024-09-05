import express from 'express';
import { serviceSchema } from './types';
import { addService, deleteService, getServiceById, getServices, updateService } from './controller';
import { AuthenticatedRequest } from 'src/middlewares';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceAll:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the service
 *           example: "1"
 *         name:
 *           type: string
 *           description: Service name
 *           example: "Dry Cleaning"
 *     Duration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Duration ID
 *           example: "1"
 *         duration:
 *           type: number
 *           description: Duration in minutes
 *           example: 30
 *         duration_name:
 *           type: string
 *           description: Name of the duration
 *           example: "Half Hour"
 *         price:
 *           type: number
 *           description: Price for the duration
 *           example: 10000
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the service
 *           example: "1"
 *         name:
 *           type: string
 *           description: Service name
 *           example: "Dry Cleaning"
 *         unit:
 *           type: string
 *           description: Unit of measurement
 *           example: "kg"
 *         durations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Duration'
 *           example: [
 *             {
 *               id: "1",
 *               duration: 30,
 *               duration_name: "Half Hour",
 *               price: 10000
 *             },
 *             {
 *               id: "2",
 *               duration: 60,
 *               duration_name: "One Hour",
 *               price: 15000
 *             }
 *           ]
 *     ServiceRequestBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Service name
 *           example: "Dry Cleaning"
 *         unit:
 *           type: string
 *           description: Unit of measurement
 *           example: "kg"
 *         durations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               duration:
 *                 type: string
 *                 description: UUID of the duration
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               price:
 *                 type: number
 *                 description: Price for the duration
 *                 example: 10000
 *           example: [
 *             {
 *               duration: "550e8400-e29b-41d4-a716-446655440000",
 *               price: 10000
 *             },
 *             {
 *               duration: "550e8400-e29b-41d4-a716-446655440001",
 *               price: 15000
 *             }
 *           ]
 *       required:
 *         - name
 *         - unit
 *         - durations
 *     ServiceResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Layanan berhasil dibuat"
 *         data:
 *           $ref: '#/components/schemas/Service'
 *       example:
 *         status: "success"
 *         message: "Layanan berhasil dibuat"
 *         data:
 *           id: "1"
 *           name: "Dry Cleaning"
 *           unit: "kg"
 *           durations: [
 *             {
 *               id: "550e8400-e29b-41d4-a716-446655440000",
 *               duration: 30,
 *               duration_name: "Half Hour",
 *               price: 10000
 *             },
 *             {
 *               id: "550e8400-e29b-41d4-a716-446655440001",
 *               duration: 60,
 *               duration_name: "One Hour",
 *               price: 15000
 *             }
 *           ]
 */

/**
 * @swagger
 * /service:
 *   get:
 *     summary: Get all services
 *     description: Retrieve a list of all services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter data by name
 *       - in: query
 *         name: duration
 *         schema:
 *           type: string
 *         description: Filter data by duration
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceAll'
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  // Extract query parameters from the request
  const filter = req.query.filter as string | null;
  const durationId = req.query.duration as string | null;
  try {
    const services = await getServices(filter, req.userId, durationId);
    res.json(services);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Gagal mengambil layanan' });
  }
});

/**
 * @swagger
 * /service:
 *   post:
 *     summary: Create a new service
 *     description: Create a new service record
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceRequestBody'
 *     responses:
 *       201:
 *         description: Layanan berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceResponse'
 *       400:
 *         description: Bad request, invalid input
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
  const { error } = serviceSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newService = await addService(req.body, req.userId);
    res.status(201).json({
      status: 'success',
      message: 'Layanan berhasil dibuat',
      data: newService
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Gagal membuat layanan' });
  }
});

/**
 * @swagger
 * /service/{id}:
 *   put:
 *     summary: Update a service
 *     description: Update an existing service record
 *     tags: [Services]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceRequestBody'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceResponse'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Layanan tidak ditemukan
 */
router.put('/:id', async (req, res) => {
  const { error } = serviceSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const updatedService = await updateService(req.params.id, req.body);
    res.json({
      status: 'success',
      message: 'Layanan berhasil diubah',
      data: updatedService
    });
  } catch (error) {
    res.status(404).json({ error: 'Layanan tidak ditemukan' });
  }
});

/**
 * @swagger
 * /service/{id}:
 *   delete:
 *     summary: Delete a service
 *     description: Delete an existing service record
 *     tags: [Services]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Service deleted successfully
 *       404:
 *         description: Layanan tidak ditemukan
 */
router.delete('/:id', async (req, res) => {
  try {
    await deleteService(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(404).json({ error: 'Layanan tidak ditemukan' });
  }
});

/**
 * @swagger
 * /service/{id}:
 *   get:
 *     summary: Get a service by ID
 *     description: Retrieve a service by its ID
 *     tags: [Services]
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
 *         description: Layanan tidak ditemukan
 */
router.get('/:id', async (req, res) => {
  const serciveId = req.params.id;

  try {
    const duration = await getServiceById(serciveId);
    if (!duration) {
      return res.status(404).json({ error: 'Layanan tidak ditemukan' });
    }
    res.json(duration);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
  }
});
export default router;
