import { PoolClient } from "pg";
import pool from "../../database/postgres";
import { User, UserDetail } from "../auth/types";
import supabase from "../../database/supabase";
import cron from 'node-cron';

/**
 * Update the user's profile with the logo URL.
 * @param userId - The ID of the user.
 * @param logoUrl - The URL of the user's logo.
 * @returns A promise that resolves when the profile is updated.
 */
export async function updateUserProfile(
  userId: string,
  logoUrl: string
): Promise<void> {
  const client = await pool.connect();
  try {
    const query = "UPDATE users SET logo = $1 WHERE id = $2";
    await client.query(query, [logoUrl, userId]);
  } finally {
    client.release();
  }
}

/**
 * Retrieve user details by ID.
 * @param id - The ID of the user to retrieve.
 * @returns A promise that resolves to the user details or null if not found.
 */
export async function getUserDetails(id?: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id,name,email,phone_number,logo,address FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Update user details by ID.
 * @param id - The ID of the user to update.
 * @param userData - The updated user data, including optional fields.
 * @returns A promise that resolves to the updated user or null if not found.
 */
export async function updateUserDetails(
  id: string,
  userData: Partial<User>
): Promise<UserDetail | null> {
  const client: PoolClient = await pool.connect();

  try {
    // Dynamically build the SQL query and parameters based on provided fields
    const setClauses = [];
    const params: any[] = [];
    let index = 1;

    if (userData.name) {
      setClauses.push(`name = $${index++}`);
      params.push(userData.name);
    }

    if (userData.status) {
      setClauses.push(`status = $${index++}`);
      params.push(userData.status);
    }

    if (userData.email) {
      setClauses.push(`email = $${index++}`);
      params.push(userData.email);
    }

    if (userData.phone_number) {
      setClauses.push(`phone_number = $${index++}`);
      params.push(userData.phone_number);
    }

    if (userData.address) {
      setClauses.push(`address = $${index++}`);
      params.push(userData.address);
    }

    if (userData.logo) {
      setClauses.push(`logo = $${index++}`);
      params.push(userData.logo);
    }

    // Add the ID to the parameters
    params.push(id);

    // Construct the final SQL query
    const query = `
        UPDATE users
        SET ${setClauses.join(", ")}
        WHERE id = $${index}
        RETURNING *
      `;

    // Execute the query
    const result = await client.query(query, params);

    const userDatail: UserDetail = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone_number: result.rows[0].phone_number,
      logo: result.rows[0].logo,
      address: result.rows[0].address,
    };
    return result.rows[0] ? userDatail : null;
  } finally {
    client.release();
  }
}

async function deleteTempFiles() {
  try {
    const { data, error } = await supabase.storage
      .from('logos') // Bucket name
      .list('temp', { limit: 1000 });

    if (error) {
      console.error('Error fetching temp folder files:', error.message);
      return;
    }

    if (data?.length) {
      const deletePromises = data.map((file) =>
        supabase.storage.from('logos').remove([`temp/${file.name}`])
      );
      await Promise.all(deletePromises);
      console.log('All files deleted from temp folder');
    } else {
      console.log('No files in temp folder to delete');
    }
  } catch (error) {
    console.error('Error deleting files:', error);
  }
}

// Schedule to run at 19:16 every day
cron.schedule('30 19 * * *', deleteTempFiles);
