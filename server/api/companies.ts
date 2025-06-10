import { pool } from '../lib/db';

export interface Company {
    id: number;
    name: string;
    industry: string;
    status: string;
    address: string;
    notes: string;
    assignedTo: string;
    description: string;
    contacts: number[];
    deals: number[];
}

export const getCompanies = async (): Promise<Company[]> => {
    try {
        console.log('Attempting to fetch companies...');
        const result = await pool.query(`
            SELECT 
                c.id,
                c.name,
                c.industry,
                c.status,
                c.address,
                c.notes,
                c.assigned_to as "assignedTo",
                c.description,
                COALESCE(
                    json_agg(DISTINCT cc.contact_id) FILTER (WHERE cc.contact_id IS NOT NULL),
                    '[]'
                ) as contacts,
                COALESCE(
                    json_agg(DISTINCT cd.deal_id) FILTER (WHERE cd.deal_id IS NOT NULL),
                    '[]'
                ) as deals
            FROM companies c
            LEFT JOIN company_contacts cc ON c.id = cc.company_id
            LEFT JOIN company_deals cd ON c.id = cd.company_id
            GROUP BY c.id, c.name, c.industry, c.status, c.address, c.notes, c.assigned_to, c.description
            ORDER BY c.name ASC
        `);
        
        console.log('Companies fetched successfully:', result.rows.length);
        console.log('First company data:', result.rows[0]);
        
        // Transform the data to ensure all required fields are present
        const companies = result.rows.map(company => ({
            ...company,
            contacts: company.contacts || [],
            deals: company.deals || [],
            assignedTo: company.assignedTo || '',
            description: company.description || '',
            notes: company.notes || '',
            address: company.address || ''
        }));
        
        return companies;
    } catch (error: any) {
        console.error('Error in getCompanies:', error);
        console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            detail: error?.detail,
            hint: error?.hint,
            position: error?.position,
            where: error?.where,
            stack: error?.stack
        });
        throw error;
    }
};

export const createCompany = async (company: Omit<Company, 'id'>): Promise<Company> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert company
        const companyResult = await client.query(
            `INSERT INTO companies (
                name, 
                industry, 
                status, 
                address, 
                notes, 
                assigned_to, 
                description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING 
                id,
                name,
                industry,
                status,
                address,
                notes,
                assigned_to as "assignedTo",
                description`,
            [
                company.name,
                company.industry,
                company.status,
                company.address,
                company.notes,
                company.assignedTo,
                company.description
            ]
        );
        const newCompany = companyResult.rows[0];

        // Insert company contacts
        if (company.contacts && company.contacts.length > 0) {
            const contactValues = company.contacts.map(contactId => 
                `(${newCompany.id}, ${contactId})`
            ).join(',');
            await client.query(
                `INSERT INTO company_contacts (company_id, contact_id) VALUES ${contactValues}`
            );
        }

        // Insert company deals
        if (company.deals && company.deals.length > 0) {
            const dealValues = company.deals.map(dealId => 
                `(${newCompany.id}, ${dealId})`
            ).join(',');
            await client.query(
                `INSERT INTO company_deals (company_id, deal_id) VALUES ${dealValues}`
            );
        }

        await client.query('COMMIT');

        // Return the complete company object with relationships
        return {
            ...newCompany,
            contacts: company.contacts || [],
            deals: company.deals || []
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating company:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const updateCompany = async (id: number, company: Partial<Omit<Company, 'id'>>): Promise<Company> => {
    const client = await pool.connect();
    try {
        console.log('Starting company update for ID:', id);
        console.log('Update data:', company);
        
        await client.query('BEGIN');

        // Build the SET clause for the update
        const updateFields = Object.entries(company)
            .filter(([key]) => key !== 'contacts' && key !== 'deals')
            .map(([key, value]) => {
                // Convert camelCase to snake_case for database columns
                const dbColumn = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                return `"${dbColumn}" = $${Object.keys(company).indexOf(key) + 2}`;
            });

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        const setClause = updateFields.join(', ');
        const values = Object.entries(company)
            .filter(([key]) => key !== 'contacts' && key !== 'deals')
            .map(([, value]) => value);

        console.log('Update query:', `UPDATE companies SET ${setClause} WHERE id = $1 RETURNING *`);
        console.log('Update values:', [id, ...values]);

        const companyResult = await client.query(
            `UPDATE companies SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );

        if (companyResult.rows.length === 0) {
            throw new Error(`Company with ID ${id} not found`);
        }

        const updatedCompany = companyResult.rows[0];
        console.log('Company updated successfully:', updatedCompany);

        // Update contacts if provided
        if (company.contacts !== undefined) {
            console.log('Updating contacts for company:', id);
            await client.query('DELETE FROM company_contacts WHERE company_id = $1', [id]);
            if (company.contacts.length > 0) {
                const contactValues = company.contacts.map(contactId => 
                    `(${id}, ${contactId})`
                ).join(',');
                await client.query(
                    `INSERT INTO company_contacts (company_id, contact_id) VALUES ${contactValues}`
                );
            }
        }

        // Update deals if provided
        if (company.deals !== undefined) {
            console.log('Updating deals for company:', id);
            await client.query('DELETE FROM company_deals WHERE company_id = $1', [id]);
            if (company.deals.length > 0) {
                const dealValues = company.deals.map(dealId => 
                    `(${id}, ${dealId})`
                ).join(',');
                await client.query(
                    `INSERT INTO company_deals (company_id, deal_id) VALUES ${dealValues}`
                );
            }
        }

        await client.query('COMMIT');
        console.log('Transaction committed successfully');

        // Fetch the complete updated company with relationships
        const result = await getCompanies();
        const finalCompany = result.find(c => c.id === id);
        
        if (!finalCompany) {
            throw new Error('Failed to fetch updated company data');
        }

        return finalCompany;
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error updating company:', error);
        console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            detail: error?.detail,
            hint: error?.hint,
            position: error?.position,
            where: error?.where,
            stack: error?.stack
        });
        throw error;
    } finally {
        client.release();
    }
}; 