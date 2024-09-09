import pool from "../../database/postgres";
import { Service } from "./types";

/**
* Retrieve all services with their IDs and names from the database.
* @returns {Promise<{ id: number, name: string }[]>} - A promise that resolves to an array of services with their IDs and names.
*/
export async function getServices(filter: string | null, merchantId?: string, durationId?: string | null): Promise<{ id: number, name: string, price?: number }[]> {
  const client = await pool.connect();
  try {
    // Adjust the SELECT clause depending on the presence of durationId
    const selectClause = durationId ? "service.id, service.name, service_duration.price" : "service.id, service.name";
    // Adjust the JOIN clause to conditionally include the service_duration
    const joinClause = durationId ? "LEFT JOIN service_duration ON service.id = service_duration.service" : "";

    const query = `
      SELECT ${selectClause}
      FROM service
      ${joinClause}
      WHERE ($1::text IS NULL OR service.name ILIKE '%' || $1 || '%') 
        AND service.merchant_id = $2
        ${durationId ? "AND service_duration.duration::text = $3" : ""}
      ORDER BY service.created_at DESC
    `;

    const params = durationId ? [filter, merchantId, durationId] : [filter, merchantId];
    const result = await client.query(query, params);

    return result.rows;
  } finally {
    client.release();
  }
}


/**
 * Retrieve a service by its ID, along with its associated durations, from the database.
 * @param {number} serviceId - The ID of the service to retrieve.
 * @returns {Promise<Service | null>} - A promise that resolves to the service with durations or null if not found.
 */
export async function getServiceById(serviceId: string): Promise<Service | null> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT service.id AS id,
             service.name AS name,
             service.unit AS unit,
             service_duration.id AS duration_id,
             service_duration.duration,
             duration.name AS duration_name,
             service_duration.price
      FROM service
      LEFT JOIN service_duration ON service.id = service_duration.service
      LEFT JOIN duration ON service_duration.duration = duration.id
      WHERE service.id = $1
      ORDER BY service.created_at DESC
    `;

    const result = await client.query(query, [serviceId]);
    if (result.rows.length === 0) {
      return null; // Service not found
    }

    const service: Service = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      unit: result.rows[0].unit,
      durations: [],
    };

    result.rows.forEach(row => {
      if (row.duration_id) {
        service.durations.push({
          id: row.duration_id,
          duration: row.duration,
          duration_name: row.duration_name,
          price: row.price,
        });
      }
    });

    return service;
  } finally {
    client.release();
  }
}

/**
 * Add a new service to the database.
 * @param service - The service data to add.
 * @returns {Promise<Service>} - A promise that resolves to the newly created service.
 */
export async function addService(service: Omit<Service, 'id'>, merchant_id?: string): Promise<Service> {
  const client = await pool.connect();
  try {
    const { name, unit, durations } = service;
    const query = `
      INSERT INTO service (name, unit, merchant_id)
      VALUES ($1, $2, $3) RETURNING id;
    `;
    const values = [name, unit, merchant_id];
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
      unit,
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
    const { name, unit, durations } = service;

    // Update the service
    const updateServiceQuery = `
      UPDATE service
      SET name = $1, unit = $2
      WHERE id = $3 RETURNING id;
    `;
    const updateServiceValues = [name, unit, id];
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
      unit,
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
