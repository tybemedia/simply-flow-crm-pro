import { pool } from './lib/db';

const companies = [
    { name: "Webdesign Inc.", industry: "Webdesign", status: "Aktiv", address: "Musterstraße 1, 12345 Musterstadt", notes: "Langjähriger Kunde, Fokus auf SEO." },
    { name: "IT-Solutions AG", industry: "IT-Dienstleistungen", status: "Aktiv", address: "Technikweg 5, 54321 Technikhausen", notes: "Großes Unternehmen, mehrere Projekte." },
    { name: "Marketing GmbH", industry: "Marketing", status: "Lead", address: "Kreativ-Allee 10, 10115 Berlin", notes: "Neuer Lead, hohes Potenzial." },
    { name: "Data Analytics Corp", industry: "Datenanalyse", status: "Inaktiv", address: "Datenweg 7, 98765 Datenburg", notes: "Projekt abgeschlossen, aktuell kein Bedarf." },
    { name: "Software-Schmiede", industry: "Softwareentwicklung", status: "Aktiv", address: "Code-Straße 42, 22334 Hamburg", notes: "Entwicklung einer neuen App." }
];

const deals = [
    {
      id: 1,
      title: "Website Relaunch",
      company: "Webdesign Inc.",
      value: 7500,
      phase: "Angebot versendet" as const,
      status: "Aktiv" as const,
      closeDate: "2024-08-15",
      description: "Kompletter Relaunch der Unternehmenswebsite inklusive SEO-Optimierung.",
      assignedTo: "Max Mustermann",
      salesperson: "Anna Schmidt",
      commissionPercentage: 5,
      probability: 60,
      updatedAt: "2024-05-20",
    },
    {
      id: 2,
      title: "Social Media Kampagne",
      company: "Marketing GmbH",
      value: 3200,
      phase: "Verhandlung" as const,
      status: "Aktiv" as const,
      closeDate: "2024-07-30",
      description: "Q3-Kampagne zur Steigerung der Markenbekanntheit auf Instagram und Facebook.",
      assignedTo: "Erika Mustermann",
      salesperson: null,
      commissionPercentage: 0,
      probability: 75,
      updatedAt: "2024-05-18",
    },
    {
      id: 3,
      title: "CRM-Implementierung",
      company: "IT-Solutions AG",
      value: 15000,
      phase: "Abgeschlossen" as const,
      status: "Erfolgreich abgeschlossen - Einmalig" as const,
      closeDate: "2024-04-10",
      description: "Einführung und Anpassung eines neuen CRM-Systems.",
      assignedTo: "Max Mustermann",
      salesperson: "Anna Schmidt",
      commissionPercentage: 7,
      probability: 100,
      updatedAt: "2024-04-10",
    },
    {
      id: 4,
      title: "SEO-Beratung",
      company: "Webdesign Inc.",
      value: 2500,
      phase: "Ersttermin" as const,
      status: "In Kooperation" as const,
      closeDate: "2024-09-01",
      description: "Monatliche SEO-Beratung zur Verbesserung des organischen Rankings.",
      assignedTo: "Erika Mustermann",
      salesperson: "Anna Schmidt",
      commissionPercentage: 10,
      probability: 40,
      updatedAt: "2024-05-15",
      expirationDate: "2025-05-15",
    },
];

async function seedDatabase() {
  const client = await pool.connect();
  try {
    // Seed Companies
    console.log('Seeding companies...');
    await client.query('TRUNCATE TABLE companies RESTART IDENTITY CASCADE;');
    for (const company of companies) {
        await client.query(
            'INSERT INTO companies (name, industry, status, address, notes) VALUES ($1, $2, $3, $4, $5)',
            [company.name, company.industry, company.status, company.address, company.notes]
        );
    }
    console.log('Companies seeded successfully.');

    // Fetch the newly created companies to get their IDs
    console.log('Fetching companies...');
    const createdCompaniesResult = await client.query('SELECT id, name FROM companies');
    const companyMap = new Map(createdCompaniesResult.rows.map(c => [c.name, c.id]));

    // Seed Deals
    console.log('Seeding deals...');
    // The TRUNCATE on companies should have cascaded, but we do it explicitly just in case
    await client.query('TRUNCATE TABLE deals RESTART IDENTITY CASCADE;'); 

    for (const deal of deals) {
      const companyId = companyMap.get(deal.company);
      if (!companyId) {
        console.warn(`Could not find company ID for "${deal.company}". Skipping deal "${deal.title}".`);
        continue;
      }

      await client.query(
        `INSERT INTO deals (title, company_id, value, phase, status, close_date, description, assigned_to, salesperson, commission_percentage, probability, updated_at, expiration_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          deal.title,
          companyId,
          deal.value,
          deal.phase,
          deal.status,
          deal.closeDate,
          deal.description,
          deal.assignedTo,
          deal.salesperson,
          deal.commissionPercentage,
          deal.probability,
          deal.updatedAt,
          deal.expirationDate || null
        ]
      );
    }
    console.log('Deals seeded successfully.');

  } catch (err) {
    console.error('Error seeding the database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase(); 