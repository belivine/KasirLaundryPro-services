import pool from "../../database/postgres";
import { Service, Duration } from "./types";

/**
 * Retrieve all services with their associated durations from the database.
 * @returns {Promise<Service[]>} - A promise that resolves to an array of services with durations.
 */
export async function getServices(): Promise<Service[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT service.id AS id,
             service.name AS name,
             service.satuan AS satuan,
             service_duration.id AS duration_id,
             service_duration.duration,
             duration.name AS duration_name,
             service_duration.price
      FROM service
      LEFT JOIN service_duration ON service.id = service_duration.service
      LEFT JOIN duration ON service_duration.duration = duration.id
      ORDER BY service.created_at DESC
    `;

    const result = await client.query(query);
    const servicesMap: Record<string, Service> = {};

    result.rows.forEach(row => {
      if (!servicesMap[row.id]) {
        servicesMap[row.id] = {
          id: row.id,
          name: row.name,
          satuan: row.satuan,
          durations: [],
        };
      }

      if (row.duration_id) {
        servicesMap[row.id].durations.push({
          id: row.duration_id,
          duration: row.duration,
          duration_name: row.duration_name,
          price: row.price,
        });
      }
    });

    return Object.values(servicesMap);
  } finally {
    client.release();
  }
}

/**
 * Add a new service to the database.
 * @param service - The service data to add.
 * @returns {Promise<Service>} - A promise that resolves to the newly created service.
 */
export async function addService(service: Omit<Service, 'id'>): Promise<Service> {
  const client = await pool.connect();
  try {
    const { name, satuan, durations } = service;
    const query = `
      INSERT INTO service (name, satuan)
      VALUES ($1, $2) RETURNING id;
    `;
    const values = [name, satuan];
    const result = await client.query(query, values);
    const newServiceId = result.rows[0].id;

    // Insert service durations
    const durationQueries = durations.map(duration => {
      return {
        text: `
          INSERT INTO service_duration (service, duration, price)
          VALUES ($1, $2, $3);
        `,
        values: [newServiceId, duration.duration, duration.price],
      };
    });

    for (const query of durationQueries) {
      await client.query(query.text, query.values);
    }

    return {
      id: newServiceId,
      name,
      satuan,
      durations,
    };
  } finally {
    client.release();
  }
}

/**
 * Update an existing service in the database.
 * @param id - The ID of the service to update.
 * @param service - The updated service data.
 * @returns {Promise<Service>} - A promise that resolves to the updated service.
 */
export async function updateService(id: string, service: Omit<Service, 'id'>): Promise<Service> {
  const client = await pool.connect();
  try {
    const { name, satuan, durations } = service;

    // Update the service
    const updateServiceQuery = `
      UPDATE service
      SET name = $1, satuan = $2
      WHERE id = $3 RETURNING id;
    `;
    const updateServiceValues = [name, satuan, id];
    await client.query(updateServiceQuery, updateServiceValues);

    // Remove existing durations and add new ones
    await client.query('DELETE FROM service_duration WHERE service = $1;', [id]);

    const durationQueries = durations.map(duration => {
      return {
        text: `
          INSERT INTO service_duration (service, duration, price)
          VALUES ($1, $2, $3);
        `,
        values: [id, duration.duration, duration.price],
      };
    });

    for (const query of durationQueries) {
      await client.query(query.text, query.values);
    }

    return {
      id,
      name,
      satuan,
      durations,
    };
  } finally {
    client.release();
  }
}

/**
 * Delete a service from the database.
 * @param id - The ID of the service to delete.
 */
export async function deleteService(id: string): Promise<void> {
  const client = await pool.connect();
  try {
    // Delete service durations
    await client.query('DELETE FROM service_duration WHERE service = $1;', [id]);

    // Delete the service
    await client.query('DELETE FROM service WHERE id = $1;', [id]);
  } finally {
    client.release();
  }
}
