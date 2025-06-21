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
        type VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('"contacts" table created successfully.');

    console.log('Creating "companies" table...');
    await client.query(`
      DROP TABLE IF EXISTS companies CASCADE;
      CREATE TABLE companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(255),
        status VARCHAR(50),
        address TEXT,
        notes TEXT,
        assigned_to VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('"companies" table created successfully.');

    console.log('Creating "deals" table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        value DECIMAL(10,2),
        status VARCHAR(50),
        assigned_to VARCHAR(255),
        close_date DATE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('"deals" table created successfully.');

    console.log('Creating "company_contacts" junction table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS company_contacts (
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        PRIMARY KEY (company_id, contact_id)
      );
    `);
    console.log('"company_contacts" table created successfully.');

    console.log('Creating "company_deals" junction table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS company_deals (
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
        PRIMARY KEY (company_id, deal_id)
      );
    `);
    console.log('"company_deals" table created successfully.');

    console.log('Creating "columns" table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS columns (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        color VARCHAR(50) NOT NULL,
        icon VARCHAR(100) NOT NULL
      );
    `);
    console.log('"columns" table created successfully.');

    // Add indexes for better performance
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_company_contacts_company_id ON company_contacts(company_id);
      CREATE INDEX IF NOT EXISTS idx_company_contacts_contact_id ON company_contacts(contact_id);
      CREATE INDEX IF NOT EXISTS idx_company_deals_company_id ON company_deals(company_id);
      CREATE INDEX IF NOT EXISTS idx_company_deals_deal_id ON company_deals(deal_id);
    `);
    console.log('Indexes created successfully.');

  } catch (err) {
    console.error('Error setting up the database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase(); 