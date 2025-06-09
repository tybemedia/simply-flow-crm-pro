import { pool } from '../lib/db';

export interface Company {
    id: number;
    name: string;
    industry: string;
    status: string;
    address: string;
    notes: string;
}

export const getCompanies = async (): Promise<Company[]> => {
    const result = await pool.query('SELECT * FROM companies ORDER BY name ASC');
    return result.rows;
};

export const createCompany = async (company: Omit<Company, 'id'>): Promise<Company> => {
    const { name, industry, status, address, notes } = company;
    const result = await pool.query(
        'INSERT INTO companies (name, industry, status, address, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, industry, status, address, notes]
    );
    return result.rows[0];
};

export const updateCompany = async (id: number, company: Omit<Company, 'id'>): Promise<Company> => {
    const { name, industry, status, address, notes } = company;
    const result = await pool.query(
        'UPDATE companies SET name = $1, industry = $2, status = $3, address = $4, notes = $5 WHERE id = $6 RETURNING *',
        [name, industry, status, address, notes, id]
    );
    return result.rows[0];
}; 