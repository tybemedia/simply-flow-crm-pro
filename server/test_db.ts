import { pool } from './lib/db';

async function testDatabase() {
    try {
        console.log('Testing database connection...');
        const client = await pool.connect();
        
        console.log('Connection successful, checking companies table structure...');
        const tableInfo = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'companies'
        `);
        console.log('Companies table structure:', tableInfo.rows);
        
        console.log('\nTesting companies data...');
        const result = await client.query('SELECT * FROM companies');
        console.log('Companies found:', result.rows);
        
        client.release();
    } catch (error) {
        console.error('Database test failed:', error);
    } finally {
        await pool.end();
    }
}

testDatabase(); 