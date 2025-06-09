import { pool } from './lib/db';

async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('Seeding "companies" table...');
    
    const companies = [
      {
        name: "TechCorp GmbH",
        industry: "IT-Services",
        status: "Aktiv",
        address: "Musterstraße 123, 12345 Berlin",
        notes: "Wichtiger Kunde mit hohem Potenzial für weitere Projekte"
      },
      {
        name: "FashionStore AG",
        industry: "Retail",
        status: "Lead",
        address: "Kreativstraße 45, 80331 München",
        notes: "Interessiert an Webdesign-Paket"
      },
      {
        name: "StartupXYZ",
        industry: "Software",
        status: "Aktiv",
        address: "Handelsplatz 1, 60313 Frankfurt",
        notes: "Großkunde mit mehreren laufenden Projekten"
      }
    ];

    for (const company of companies) {
        // Check if company already exists
        const check = await client.query('SELECT id FROM companies WHERE name = $1', [company.name]);
        if (check.rows.length === 0) {
            await client.query(
                `INSERT INTO companies (name, industry, status, address, notes) VALUES ($1, $2, $3, $4, $5)`,
                [company.name, company.industry, company.status, company.address, company.notes]
            );
        }
    }
    
    console.log('"companies" table seeded successfully.');

  } catch (err) {
    console.error('Error seeding the database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase(); 