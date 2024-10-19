import express from "express";
import { ChangePasswordSchema, CustomJwtPayload, LoginSchema, SignUpSchema, SignUpTokenInput, SignUpTokenSchema } from "./types";
import { addUser, addUserSignUpToken, changeUserPassword, getUserByEmail, updateUserSignupStatus, validateToken } from "./controller";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "./passportConfig";
import { getUserDetails, updateUserDetails } from "../user/controller";
import * as dotenv from 'dotenv';
import crypto from 'crypto';
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const router = express.Router();

// Load environment variables from .env file
dotenv.config();

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY; // Set your Brevo API key here

const sendEmailRegistration = async (registrationEmail: string, verificationToken: string) => {
  const verificationUrl = `https://kasirlaundrypro.netlify.app/api/auth/verify-email?token=${verificationToken}`;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    sender: { name: 'Cucibayargo', email: 'laundryapps225@gmail.com' },
    to: [{ email: registrationEmail }],
    subject: 'Verifikasi Alamat Email Anda',
    textContent: `Silakan verifikasi alamat email Anda dengan mengklik tautan berikut: ${verificationUrl}`,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #f4f4f4; padding: 40px 0;">
            <tr>
              <td>
                <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="text-align: center;">
                      <img src="https://merchant-app-fe.vercel.app/assets/logo-B3sUIac6.png" alt="Cucibayargo" style="width: 150px; margin-bottom: 20px;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; padding: 20px;">
                      <h1 style="color: #333333;">Verifikasi Alamat Email Anda</h1>
                      <p style="font-size: 16px; color: #555555;">Silakan verifikasi alamat email Anda dengan mengklik tautan di bawah ini.</p>
                      <a href="${verificationUrl}" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block; margin-top: 20px;">Verifikasi Email</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px; text-align: center; color: #999999; font-size: 12px;">
                      Jika Anda tidak mendaftarkan email ini, abaikan email ini.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`,
  };

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Verification email sent successfully:', response);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

const sendSignUpLink = async (
  registrationEmail: string,
  params: string | string[][] | Record<string, string> | URLSearchParams | undefined
) => {
  const queryParams = new URLSearchParams(params).toString();
  const verificationUrl = `https://merchant-app-fe.vercel.app/register?${queryParams}`;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    sender: { name: 'Cucibayargo', email: 'laundryapps225@gmail.com' },
    to: [{ email: registrationEmail }],
    subject: 'Link Pendaftaran Cucibayargo',
    textContent: `Silakan klik link untuk melakukan pendaftaran: ${verificationUrl}`,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #f4f4f4; padding: 40px 0;">
            <tr>
              <td>
                <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="text-align: center;">
                      <img src="https://merchant-app-fe.vercel.app/assets/logo-B3sUIac6.png" alt="Cucibayargo" style="width: 150px; margin-bottom: 20px;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; padding: 20px;">
                      <h1 style="color: #333333;">Selamat Datang di Cucibayargo!</h1>
                      <p style="font-size: 16px; color: #555555;">Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk melanjutkan pendaftaran Anda.</p>
                      <a href="${verificationUrl}" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block; margin-top: 20px;">Daftar Sekarang</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px; text-align: center; color: #999999; font-size: 12px;">
                      Jika Anda tidak mendaftar di Cucibayargo, abaikan email ini.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`,
  };

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Verification email sent successfully:', response);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

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

    const token = jwt.sign({ id: user.id }, "secret_key", { expiresIn: "2d" });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
    });

    res.status(200).json({ message: "Login berhasil."});
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server." });
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
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
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
 *               token:
 *                 type: string
 *                 description: Unique Signup Token
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

  const { name, email, password, phone_number, token} = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan." });
    }

    // Step 2: Validate the token by checking if it matches the one in the database
    const isValidToken = await validateToken(email, token);
    if (!isValidToken) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await addUser({
      name,
      email,
      password: hashedPassword,
      phone_number,
      status: 'pending', // Initially set user status to 'pending'
    });


    // Step 4: Update users_signup table with the status and user_id
    await updateUserSignupStatus(email, token, newUser.id);


    // Generate verification token
    const verificationToken = jwt.sign({ id: newUser.id }, "verification_secret_key", {
      expiresIn: "1d",
    });

    // Send verification email
    sendEmailRegistration(email, verificationToken);

    res.status(201).json({ message: "Daftar berhasil. Silahkan cek email anda untuk verifikasi"});
  } catch (err: any) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

/**
 * @swagger
 * /auth/signup/token:
 *   post:
 *     summary: Generate a signup link and send to the user's email
 *     description: Validates the user's input and checks if the email is already in use. If valid, creates a signup link and sends it to the user's email.
 *     tags: [Auth]  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone_number
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's full name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: johndoe@example.com
 *               phone_number:
 *                 type: string
 *                 description: The user's phone number
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: Signup link has been created and sent to the user's email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Link pendaftaran telah dibuat. Silahkan cek email anda untuk melanjutkan.
 *       400:
 *         description: Invalid input or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email sudah digunakan.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Terjadi kesalahan pada server.
 */
router.post("/signup/token",  async (req, res) => {
  const { error } = SignUpTokenSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, phone_number } = req.body;
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan." });
    }

    // Generate a unique token using SHA256 hash
    const signupToken = crypto.createHash('sha256').update(email + Date.now().toString()).digest('hex');

    const userDetail = { name, email, phone_number, token: signupToken };

    // Save the signup token and user details in the database
    await addUserSignUpToken(userDetail);

    // Send the signup email with the generated token
    await sendSignUpLink(email, { token: signupToken, email, phone_number, name });

    res.status(201).json({ message: "Link pendaftaran telah dibuat. Silahkan cek email anda untuk melanjutkan."});
  } catch (err: any) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
})


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
      expiresIn: "2d",
    });
    res.cookie("auth_token", token, { httpOnly: true, sameSite: 'none', secure: true});
    res.redirect("https://merchant-app-fe.vercel.app/login-google"); 
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
    res.status(400).json({ message: "Link verifikasi sudah kedaluarsa." });
  }
});

export default router;
