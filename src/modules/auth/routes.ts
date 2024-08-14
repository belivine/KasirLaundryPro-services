import express from "express";
import { ChangePasswordSchema, LoginSchema, SignUpSchema } from "./types";
import { addUser, changeUserPassword, getUserByEmail } from "./controller";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
 *         id:
 *           type: string
 *           description: User's unique identifier
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login berhasil."
 *       '401':
 *         description: Unauthorized, invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email tidak ditemukan."
 */
router.post("/login", async (req, res) => {
  const { error } = LoginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Password salah." });
    }

    const token = jwt.sign({ id: user.id }, "secret_key", { expiresIn: "1h" });
    res.cookie("auth_token", token, { httpOnly: true });
    res.status(200).json({ message: "Login berhasil." });
  } catch (err:any) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server.", error: err.message });
  }
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
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - email
 *               - phone_number
 *               - name
 *               - password
 *     responses:
 *       '201':
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Signup berhasil."
 *       '400':
 *         description: Bad request, invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sudah digunakan."
 */
router.post("/signup", async (req, res) => {
  const { error } = SignUpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, password, phone_number } = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await addUser({
      name,
      email,
      password: hashedPassword,
      phone_number,
    });

    const token = jwt.sign({ id: newUser.id }, "secret_key", {
      expiresIn: "1h",
    });
    res.cookie("auth_token", token, { httpOnly: true });
    res.status(201).json({ message: "Signup berhasil." });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server.", error: err.message });
  }
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
 *               email:
 *                 type: string
 *                 description: User's email address
 *               currentPassword:
 *                 type: string
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 description: User's new password
 *             required:
 *               - email
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       '200':
 *         description: Password successfully changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully."
 *       '400':
 *         description: Bad request, invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Current password is incorrect."
 *       '401':
 *         description: Unauthorized, invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Current password is incorrect."
 */
router.post("/change-password", async (req, res) => {
  const { error } = ChangePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, currentPassword, newPassword } = req.body;

  try {
    await changeUserPassword(email, currentPassword, newPassword);
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
