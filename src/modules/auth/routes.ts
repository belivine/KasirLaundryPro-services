import express from "express";
import { ChangePasswordSchema, CustomJwtPayload, LoginSchema, SignUpSchema } from "./types";
import { addUser, changeUserPassword, getUserByEmail } from "./controller";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "./passportConfig";
import { getUserDetails, updateUserDetails } from "../user/controller";
import nodemailer from 'nodemailer';

const router = express.Router();
// Create a transporter object using Outlook's SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.email,
    pass: process.env.email_password,
  },
});

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
 *                   example: "Email tidak ditemukan"
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
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }

    if (user.status === "pending") {
      return res.status(400).json({ message: "Tolong lakukan verifikasi email terlebih dahulu" });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Password salah." });
    }

    const token = jwt.sign({ id: user.id }, "secret_key", { expiresIn: "1h" });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
    });

    res.status(200).json({ message: "Login berhasil.", token: token});
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server.", error: err.message });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logs out a user
 *     description: Logs out a user and invalidates their session or token
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: Successful logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout berhasil."
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Terjadi kesalahan pada server."
 */
router.post("/logout", async (req, res) => {
  try {
    // Clear the authentication cookie
    res.cookie("auth_token", "", {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
      expires: new Date(0), 
    });

    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
      }
      res.status(200).json({ message: "Logout berhasil." });
    });
  } catch (err: any) {
    res.status(500).json({ message: "Terjadi kesalahan pada server.", error: err.message });
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
      status: 'pending', // Initially set user status to 'pending'
    });

    // Generate verification token
    const verificationToken = jwt.sign({ id: newUser.id }, "verification_secret_key", {
      expiresIn: "1d",
    });

    // Send verification email
    const verificationUrl = `https://kasirlaundrypro.netlify.app/api/auth/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: 'Cuci Bayar GO <cucibayargo@outlook.com>',
      to: email,
      subject: 'Verifikasi Alamat Email Anda',
      text: `Silakan verifikasi alamat email Anda dengan mengklik tautan berikut: ${verificationUrl}`,
      html: `<p>Silakan verifikasi alamat email Anda dengan mengklik tautan berikut: <a href="${verificationUrl}">Verifikasi Email</a></p>`,
    };
    
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Daftar berhasil. Silahkan cek email anda untuk verifikasi"});
  } catch (err: any) {
    res.status(500).json({ message: "Terjadi kesalahan pada server.", error: err.message });
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
    res.status(200).json({ message: 'Password berhasil diperbarui.' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});


/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiates Google OAuth authentication
 *     description: Redirects to Google for authentication
 *     tags: [Auth]
 *     responses:
 *       '302':
 *         description: Redirects to Google for authentication
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handles Google OAuth callback
 *     description: Handles the callback from Google after authentication
 *     tags: [Auth]
 *     responses:
 *       '302':
 *         description: Redirects to the frontend application with an authentication token
 *       '500':
 *         description: Terjadi kesalahan server
 */
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  if (req.user) {
    const user = req.user as any;
    const token = jwt.sign({ id: user.id }, "secret_key", {
      expiresIn: "1h",
    });
    res.cookie("auth_token", token, { httpOnly: true, sameSite: 'none', secure: true});
    res.redirect("https://merchant-app-fe.vercel.app/order/ongoing?token="+token); 
  } else {
    res.status(500).json({ message: "Authentication failed" });
  }
});

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     description: Validates the email verification token and updates the user's status to 'verified'.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *       400:
 *         description: Invalid or expired verification link.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  // Check if token is a string
  if (typeof token !== 'string') {
    return res.status(400).json({ message: "Token verifikasi tidak sesuai." });
  }

  try {
    const jwtSecret = "verification_secret_key"; // Use the same secret as in the signup endpoint
    const decoded = jwt.verify(token, jwtSecret) as CustomJwtPayload;
    if (!decoded.id) {
      return res.status(400).json({ message: "Salah Link Verifikasi." });
    }

    const userId = decoded.id;

    const user = await getUserDetails(userId);
    if (!user || user.status === 'verified') {
      return res.status(400).json({ message: "Salah Link Verifikasi atau email sudah terverifikasi." });
    }

    // Update user status to 'verified'
    await updateUserDetails(userId, { status: 'verified' });

    res.redirect("https://merchant-app-fe.vercel.app/"); 
  } catch (err: any) {
    res.status(400).json({ message: "Link verifikasi sudah kedaluarsa.", error: err.message });
  }
});

export default router;
