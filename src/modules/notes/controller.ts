import pool from "../../database/postgres";
import { Note } from "./types";

/**
 * Retrieve all notes from the database.
 * @returns {Promise<Note[]>} - A promise that resolves to an array of notes.
 */
export async function GetNote(): Promise<Note[]> {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM note");
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * Add a new note to the database.
 * @param note - The note data to add. Excludes 'id' as it's auto-generated.
 * @returns {Promise<Note>} - A promise that resolves to the newly created note.
 */
export async function addNote(noteParams: Omit<Note, 'id'>): Promise<Note> {
  const client = await pool.connect();
  try {
    const { notes } = noteParams;
    const query = `
      INSERT INTO note (notes)
      VALUES ($1) RETURNING *;
    `;
    const values = [notes];
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Update an existing note in the database.
 * @param id - The ID of the note to update.
 * @param note - The updated note data. Excludes 'id' as it's the identifier for the update.
 * @returns {Promise<Note>} - A promise that resolves to the updated note.
 */
export async function updateNote(id: string, noteParams: Omit<Note, 'id'>): Promise<Note> {
  const client = await pool.connect();
  try {
    const { notes } = noteParams;
    const query = `
      UPDATE note
      SET notes = $1
      WHERE id = $2 RETURNING *;
    `;
    const values = [notes, id];
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}
