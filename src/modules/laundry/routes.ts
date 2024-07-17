import express from 'express';
import { LaundryEntry, LaundryStatus } from './types';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Laundry
 *   description: Laundry management APIs
 */

/**
 * @swagger
 * /v1/laundry/get:
 *   get:
 *     summary: Get laundry details
 *     description: Retrieve details of the laundry with optional filters
 *     tags: 
 *       - Laundry 
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - Diproses
 *             - Selesai
 *             - Siap Diambil
 *         description: Filter by laundry status
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by customer name
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date created
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer:
 *                   type: string
 *                 duration:
 *                   type: string
 *                 qty:
 *                   type: number
 *                 service:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum:
 *                     - Diproses
 *                     - Selesai
 *                     - Siap Diambil
 */
router.get('/get', (req, res) => {
  const statusFilter = req.query.status as LaundryStatus | undefined;

  // Sample laundry data
  const sampleLaundry: LaundryEntry[] = [
    { customer: 'uuid-123', duration: 'uuid-456', qty: 5, service: 'uuid-789', status: LaundryStatus.DiProses },
    { customer: 'uuid-124', duration: 'uuid-457', qty: 3, service: 'uuid-790', status: LaundryStatus.Selesai },
    { customer: 'uuid-125', duration: 'uuid-458', qty: 7, service: 'uuid-791', status: LaundryStatus.SiapDiambil }
  ];

  const filteredLaundry = statusFilter ? sampleLaundry.filter(entry => entry.status === statusFilter) : sampleLaundry;

  res.json(filteredLaundry);
});

/**
 * @swagger
 * /v1/laundry/create:
 *   post:
 *     summary: Create a new laundry entry
 *     description: Create a new laundry entry with items
 *     tags: 
 *       - Laundry 
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer:
 *                 type: string
 *               duration:
 *                 type: string
 *               qty:
 *                 type: number
 *               service:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum:
 *                   - Diproses
 *     responses:
 *       201:
 *         description: Laundry entry created
 */
router.post('/create', (req, res) => {
  const { customer, duration, qty, service, status }: LaundryEntry = req.body;
  if (status !== LaundryStatus.DiProses) {
    return res.status(400).send('Invalid status for new entry');
  }
  res.status(201).send('Laundry entry created');
});

/**
 * @swagger
 * /v1/laundry/edit:
 *   put:
 *     summary: Edit laundry details
 *     description: Edit existing laundry entry details
 *     tags: 
 *       - Laundry 
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - Diproses
 *                   - Selesai
 *                   - Siap Diambil
 *     responses:
 *       200:
 *         description: Laundry entry updated
 */
router.put('/edit', (req, res) => {
  const { customer, duration, qty, service, status }: LaundryEntry = req.body;
  if (!Object.values(LaundryStatus).includes(status)) {
    return res.status(400).send('Invalid status');
  }
  res.send('Laundry entry updated');
});

/**
 * @swagger
 * /v1/laundry/payment:
 *   post:
 *     summary: Make a payment
 *     description: Handle a payment with a cash input
 *     tags: 
 *       - Laundry 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cash:
 *                 type: number
 *                 description: Amount of cash paid
 *             required:
 *               - cash
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success status
 *                 message:
 *                   type: string
 *                   description: Success message
 */
router.post('/payment', (req, res) => {
    const { cash } = req.body;
  
    // Process payment (mock implementation)
    if (cash > 0) {
      res.json({ success: true, message: 'Payment processed successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }
  });
  
/**
 * @swagger
 * /v1/laundry/detail/{laundryId}:
 *   get:
 *     summary: Get laundry details by ID
 *     description: Retrieve details of a specific laundry entry by its ID
 *     tags: 
 *       - Laundry 
 *     parameters:
 *       - in: path
 *         name: laundryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the laundry entry to retrieve
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer:
 *                   type: string
 *                 duration:
 *                   type: string
 *                 qty:
 *                   type: number
 *                 service:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum:
 *                     - Diproses
 *                     - Selesai
 *                     - Siap Diambil
 *                 created_at:
 *                   type: string
 *                   format: date-time
 */

router.get('/detail/:laundryId', (req, res) => {
    const { laundryId } = req.params;

    // Mock data lookup by ID
    const laundryEntry = 0;

    if (!laundryEntry) {
        return res.status(404).json({ error: 'Laundry entry not found' });
    }

    res.json(laundryEntry);
});
export default router;
