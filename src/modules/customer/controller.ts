import pool from '../../database/postgres';
import supabase from '../../database/supabase';

export async function GetCustomers(){
    const { data, error } = await supabase
        .from('customer')
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function GetCustomersPG() {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM customer');
      return res.rows;
    } finally {
      client.release();
    }
  }