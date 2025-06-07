import { pool } from './lib/db';

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('Creating "tasks" table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(50),
        column_id VARCHAR(100),
        assigned_to VARCHAR(255),
        customer VARCHAR(255),
        deadline DATE,
        estimated_hours REAL,
        tracked_time REAL DEFAULT 0,
        is_timer_running BOOLEAN DEFAULT FALSE,
        timer_start BIGINT
      );
    `);
    console.log('"tasks" table created successfully.');

  } catch (err) {
    console.error('Error setting up the database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase(); 