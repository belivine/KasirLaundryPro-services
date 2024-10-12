import express from "express";
import { noteSchema } from "./types";
import { addNote, GetNote, updateNote } from "./controller";
import { AuthenticatedRequest } from "src/middlewares";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Note
 *   description: Notes management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         notes:
 *           type: string
 *           description: The note content
 *           example: "This is a note."
 *     NoteRequestBody:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         notes:
 *           type: string
 *           description: The note content
 *           example: "This is a note."
 *     NoteResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Catatan berhasil dibuat"
 *         data:
 *           $ref: '#/components/schemas/Note'
 */

/**
 * @swagger
 * /note:
 *   get:
 *     summary: Get a single note
 *     description: Retrieve a single note
 *     tags: [Note]
 *     responses:
 *       200:
 *         description: Successful retrieval of a single note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 */
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const data = await GetNote(req.userId); // Ensure GetNote() returns a single note object
    if (Array.isArray(data)) {
      // If GetNote() returns an array, handle it appropriately, e.g., return the first item
      res.json(data[0] || null);
    } else {
      res.json(data);
    }
  } catch (error) {
    const err = error as Error; // Type assertion
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /note:
 *   put:
 *     summary: Create or update a note
 *     description: Create a new note if none exists, or update the latest note if one is found
 *     tags: [Note]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteRequestBody'
 *     responses:
 *       200:
 *         description: Note created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteResponse'
 *       400:
 *         description: Bad request, invalid input
 */
router.put("/", async (req: AuthenticatedRequest, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      errors: [
        {
          type: "body",
          msg: "Isi permintaan hilang atau tidak valid",
        },
      ],
    });
  }

  const { error, value } = noteSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      errors: error.details.map((err) => ({
        type: "field",
        msg: err.message,
        path: err.path[0],
        location: "body",
      })),
    });
  }

  const { notes } = req.body;

  try {
    // Attempt to get the latest note
    const latestNote = await GetNote(req.userId);

    if (latestNote) {
      // Update the latest note
      const updatedNote = await updateNote(latestNote.id, { notes });
      res.status(200).json({
        status: "success",
        message: "Catatan berhasil diubah",
        data: updatedNote,
      });
    } else {
      // Create a new note
      await addNote({ notes }, req.userId);
      res.status(201).json({
        status: "success",
        message: "Catatan berhasil dibuat"
      });
    }
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
});

export default router;
