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

    console.log('Creating "contacts" table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        position VARCHAR(255),
        type VARCHAR(50),
        description TEXT,
        tags JSONB
      );
    `);
    console.log('"contacts" table created successfully.');

    // Add company_id column to contacts if it doesn't exist
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='contacts' AND column_name='company_id';
    `;
    const { rows } = await client.query(checkColumnQuery);
    if (rows.length === 0) {
      console.log('Adding "company_id" to "contacts" table...');
      await client.query(`ALTER TABLE contacts ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;`);
      console.log('"company_id" column added.');
    }

    // Drop the old company column if it exists
    const checkOldColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='contacts' AND column_name='company';
    `;
    const oldColumnResult = await client.query(checkOldColumnQuery);
    if (oldColumnResult.rows.length > 0) {
        console.log('Dropping old "company" column from "contacts" table...');
        await client.query('ALTER TABLE contacts DROP COLUMN company;');
        console.log('"company" column dropped.');
    }

    console.log('Creating "contact_comments" table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_comments (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        author VARCHAR(255),
        text TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('"contact_comments" table created successfully.');

    console.log('Creating "companies" table...');
    await client.query(`
        CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            industry VARCHAR(255),
            status VARCHAR(50),
            address TEXT,
            notes TEXT
        );
    `);
    console.log('"companies" table created successfully.');

    console.log('Creating "deals" table...');
    await client.query(`
        CREATE TABLE IF NOT EXISTS deals (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            value NUMERIC(12, 2) NOT NULL,
            phase VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL,
            close_date DATE NOT NULL,
            description TEXT,
            assigned_to VARCHAR(255) NOT NULL,
            salesperson VARCHAR(255),
            commission_percentage INTEGER DEFAULT 0,
            probability INTEGER,
            updated_at DATE,
            expiration_date DATE
        );
    `);
    console.log('"deals" table created successfully.');

  } catch (err) {
    console.error('Error setting up the database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase(); 