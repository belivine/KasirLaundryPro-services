import express, { Request, Response } from "express";
import { insertRow } from './controller';
import { emailSupportSchema } from "./types";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Email Support
 *   description: Email Support APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailRequestBody:
 *       type: object
 *       required:
 *           - title
 *           - message
 *       properties:
 *         title:
 *           type: string
 *           description: Email title
 *           example: "Need some help"
 *         message:
 *           type: string
 *           description: Email message body
 *           example: "Aplikasi ini sangat sangat bagus"
 *     EmailResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Email support submitted successfully."
 */

/**
 * @swagger
 * /email-support:
 *   post:
 *     summary: Send an Email
 *     description: Send a new email support
 *     tags: [Email Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequestBody'
 *     responses:
 *       201:
 *         description: Email sended successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailResponse'
 *       400:
 *         description: Bad request, invalid input
 */


router.post("/", (req: Request, res: Response) => {
    const { error, value } = emailSupportSchema.validate(req.body, { abortEarly: false });

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

    const { title, message } = req.body;

    // Example data to insert
    const rowData = [title, message, "Pending"];

    // Insert the row
    insertRow(rowData).catch((error) => {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    });
    res.status(200).json({
        status: "success",
        message: "Email support submitted successfully.",
      })
});

export default router;