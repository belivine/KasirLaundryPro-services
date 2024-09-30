import pool from "../../database/postgres";
import { Duration, DurationType } from "./types";

/**
 * Retrieve all durations from the database.
 * @returns {Promise<Duration[]>} - A promise that resolves to an array of durations.
 */
export async function getDurations(filter: string | null,hasService?: boolean, merchant_id?: string): Promise<Duration[]> {
  const client = await pool.connect();
  try {
    let query = `
      SELECT duration.* FROM duration 
      LEFT JOIN service_duration ON duration.id = service_duration.duration
      WHERE (($1::text IS NULL OR duration.name ILIKE '%' || $1 || '%')
      OR ($1::text IS NULL OR duration.duration::text ILIKE '%' || $1 || '%')
      OR ($1::text IS NULL OR duration.type::text ILIKE '%' || $1 || '%'))
      AND merchant_id = $2
    `
    
    if (hasService) {
      query += `
        AND service_duration.id IS NOT NULL
      `
    }

    query += "GROUP BY duration.id ORDER BY duration.created_at DESC"
    const res = await client.query(query, [filter, merchant_id]);
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * Retrieve a specific duration by its ID.
 * @param id - The ID of the duration to retrieve.
 * @returns {Promise<Duration | null>} - A promise that resolves to the duration if found, or null if not found.
 */
export async function getDurationById(id: string): Promise<Duration | null> {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM duration WHERE id = $1", [id]);
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Add a new duration to the database.
 * @param duration - The duration data to add. Excludes 'id' as it's auto-generated.
 * @returns {Promise<Duration>} - A promise that resolves to the newly created duration.
 */
export async function addDuration(duration: Omit<Duration, 'id'>, merchant_id?: string): Promise<Duration> {
  const client = await pool.connect();
  try {
    const { name, duration: value, type } = duration;
    const query = `
      INSERT INTO duration (name, duration, type, merchant_id)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [name, value, type, merchant_id];
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Update an existing duration in the database.
 * @param id - The ID of the duration to update.
 * @param duration - The updated duration data. Excludes 'id' as it's the identifier for the update.
 * @returns {Promise<Duration>} - A promise that resolves to the updated duration.
 */
export async function updateDuration(id: string, duration: Omit<Duration, 'id'>): Promise<Duration> {
  const client = await pool.connect();
  try {
    const { name, duration: value, type } = duration;
    const query = `
      UPDATE duration
      SET name = $1, duration = $2, type = $3
      WHERE id = $4 RETURNING *;
    `;
    const values = [name, value, type, id];
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Delete a duration from the database by its ID.
 * @param id - The ID of the duration to delete.
 * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
 */
export async function deleteDuration(id: string): Promise<void> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM service_duration WHERE duration = $1
    `;
    const services = await client.query(query, [id]);

    if (services.rowCount !== null && services.rowCount > 0) {
      throw new Error("Duration is used by a service");
    } else {
      await client.query("DELETE FROM duration WHERE id = $1", [id]);
    }
  } finally {
    client.release();
  }
}
