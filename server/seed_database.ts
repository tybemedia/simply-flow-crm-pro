import { pool } from './lib/db';

async function seedDatabase() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert sample companies
        await client.query(`
            INSERT INTO companies (name, industry, status, address, notes, assigned_to, description)
            VALUES 
                ('Webdesign Inc.', 'Webdesign', 'Aktiv', 'Musterstraße 1, 12345 Musterstadt', 'Langjähriger Kunde, Fokus auf SEO.', 'Max Mustermann', 'Webdesign und SEO Agentur'),
                ('IT-Solutions AG', 'IT-Dienstleistungen', 'Aktiv', 'Technikweg 5, 54321 Technikhausen', 'Großes Unternehmen, mehrere Projekte.', 'Anna Schmidt', 'IT-Beratung und Implementierung'),
                ('Marketing GmbH', 'Marketing', 'Lead', 'Kreativ-Allee 10, 10115 Berlin', 'Neuer Lead, hohes Potenzial.', 'Tom Weber', 'Digitale Marketing Agentur'),
                ('Software-Schmiede', 'Softwareentwicklung', 'Aktiv', 'Code-Straße 42, 22334 Hamburg', 'Entwicklung einer neuen App.', 'Lisa Müller', 'Softwareentwicklung und Consulting'),
                ('Data Analytics Corp', 'Datenanalyse', 'Aktiv', 'Datenweg 7, 98765 Datenburg', 'Projekt abgeschlossen, aktuell kein Bedarf.', 'Peter Schmidt', 'Datenanalyse und Business Intelligence')
        `);

        await client.query('COMMIT');
        console.log('Sample data inserted successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

seedDatabase(); 