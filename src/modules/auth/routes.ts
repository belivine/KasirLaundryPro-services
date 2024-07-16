import express from 'express';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           description: User's password
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email address
 *         oauth:
 *           type: boolean
 *           description: Whether the user is authenticated via OAuth
 *         token:
 *           type: string
 *           description: Authentication token for the user
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *         logo:
 *           type: string
 *           description: URL to the user's logo or profile picture
 *         address:
 *           type: string
 *           description: User's address
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the user was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the user was last updated
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in a user
 *     description: Logs in a user with credentials
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized, invalid credentials
 */
router.post('/login', (req, res) => {
  res.send('Login route');
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Signs up a new user
 *     description: Creates a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               phone_number:
 *                 type: string
 *                 description: User's phone number
 *               name:
 *                 type: string
 *                 description: User's name
 *             required:
 *               - email
 *               - phone_number
 *               - name
 *     responses:
 *       '201':
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad request, invalid input
 */
router.post('/signup', (req, res) => {
  res.send('Signup route');
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Changes the user's password
 *     description: Allows a user to change their password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               old_password:
 *                 type: string
 *                 description: User's current password
 *               new_password:
 *                 type: string
 *                 description: User's new password
 *             required:
 *               - old_password
 *               - new_password
 *     responses:
 *       '200':
 *         description: Password successfully changed
 *       '400':
 *         description: Bad request, invalid input
 *       '401':
 *         description: Unauthorized, invalid credentials
 */
router.post('/change-password', (req, res) => {
  res.send('Change password route');
});

export default router;
