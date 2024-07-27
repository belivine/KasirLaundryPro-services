import express from "express";
import { noteSchema } from "./types";
import { addNote, GetNote, updateNote } from "./controller";

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
 *           example: "Note created successfully"
 *         data:
 *           $ref: '#/components/schemas/Note'
 */

/**
 * @swagger
 * /note:
 *   get:
 *     summary: Get all notes
 *     description: Retrieve a list of all notes
 *     tags: [Note]
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 */
router.get("/", async (req, res) => {
  try {
    const data = await GetNote();
    res.json(data);
  } catch (error) {
    const err = error as Error; // Type assertion
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /note:
 *   post:
 *     summary: Create a new note
 *     description: Create a new note record
 *     tags: [Note]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteRequestBody'
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteResponse'
 *       400:
 *         description: Bad request, invalid input
 */
router.post("/", (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      errors: [
        {
          type: "body",
          msg: "Request body is missing or invalid",
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
  addNote({ notes })
    .then((newCustomer) =>
      res.status(201).json({
        status: "success",
        message: "Note created successfully",
        data: newCustomer,
      })
    )
    .catch((error) => {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    });
});

/**
 * @swagger
 * /note/{id}:
 *   put:
 *     summary: Update a note
 *     description: Update an existing note record
 *     tags: [Note]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *          type: string
 *         description: ID of the note to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteRequestBody'
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteResponse'
 *       400:
 *         description: Bad request, invalid input
 */
router.put("/:id", (req, res) => {
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

  const { id } = req.params;
  const { notes } = req.body;

  updateNote(id, { notes })
    .then((updatedCustomer) =>
      res.status(200).json({
        status: "success",
        message: "Note updated successfully",
        data: updatedCustomer,
      })
    )
    .catch((error) => {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    });
});

export default router;
