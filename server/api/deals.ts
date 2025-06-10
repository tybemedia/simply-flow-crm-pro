import { pool } from '../lib/db';
import { Company } from './companies';

export type DealPhase = "Ersttermin" | "Angebot versendet" | "Verhandlung" | "Abgeschlossen" | "Verloren";
export type DealStatus = "Aktiv" | "In Kooperation" | "Erfolgreich abgeschlossen - Einmalig" | "Gekündigt";

export interface Deal {
  id: number;
  title: string;
  companyId: number;
  companyName?: string; 
  value: number;
  phase: DealPhase;
  status: DealStatus;
  closeDate: string;
  description: string;
  assignedTo: string;
  salesperson: string | null;
  commissionPercentage: number;
  probability: number;
  updatedAt: string;
  expirationDate?: string | null;
}

export const getDeals = async (companyId?: number): Promise<Deal[]> => {
  let query = `
    SELECT 
      d.*, 
      c.name as "companyName"
    FROM deals d 
    JOIN companies c ON d.company_id = c.id
  `;
  const params = [];
  if (companyId) {
    query += ' WHERE d.company_id = $1';
    params.push(companyId);
  }
  query += ' ORDER BY d.close_date ASC';

  const result = await pool.query(query, params);
  return result.rows.map(row => ({
      ...row,
      companyId: row.company_id,
      companyName: row.companyName,
      closeDate: new Date(row.close_date).toISOString().split('T')[0],
      updatedAt: new Date(row.updated_at).toISOString().split('T')[0],
      expirationDate: row.expiration_date ? new Date(row.expiration_date).toISOString().split('T')[0] : null,
  }));
};

export const createDeal = async (deal: Omit<Deal, 'id' | 'companyName'>): Promise<Deal> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validate required fields
    if (!deal.title || !deal.companyId || !deal.assignedTo) {
      throw new Error('Missing required fields: title, companyId, and assignedTo are required');
    }

    // Set default values for optional fields
    const dealToCreate = {
      ...deal,
      salesperson: deal.salesperson || null,
      commissionPercentage: deal.commissionPercentage || 0,
      probability: deal.probability || 0,
      status: deal.status || 'Aktiv',
      expirationDate: deal.expirationDate || null,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    console.log('Deal to create in createDeal:', dealToCreate);

    const result = await client.query(
      `INSERT INTO deals (
        title, company_id, value, phase, status, close_date, description, 
        assigned_to, salesperson, commission_percentage, probability, 
        updated_at, expiration_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *`,
      [
        dealToCreate.title,
        dealToCreate.companyId,
        dealToCreate.value,
        dealToCreate.phase,
        dealToCreate.status,
        dealToCreate.closeDate,
        dealToCreate.description,
        dealToCreate.assignedTo,
        dealToCreate.salesperson,
        dealToCreate.commissionPercentage,
        dealToCreate.probability,
        dealToCreate.updatedAt,
        dealToCreate.expirationDate
      ]
    );

    await client.query('COMMIT');

    const newDeal = result.rows[0];
    return {
      ...newDeal,
      companyId: newDeal.company_id,
      closeDate: new Date(newDeal.close_date).toISOString().split('T')[0],
      updatedAt: new Date(newDeal.updated_at).toISOString().split('T')[0],
      expirationDate: newDeal.expiration_date ? new Date(newDeal.expiration_date).toISOString().split('T')[0] : null,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating deal:', error);
    throw {
      message: 'Failed to create deal',
      details: {
        message: error.message,
        code: error.code,
        detail: error.detail
      }
    };
  } finally {
    client.release();
  }
};

export const updateDeal = async (id: number, deal: Partial<Omit<Deal, 'id' | 'companyName'>>): Promise<Deal> => {
  const client = await pool.connect();
  try {
    console.log('Starting deal update for ID:', id);
    console.log('Update data:', deal);
    
    await client.query('BEGIN');

    // Build the SET clause for the update with proper type casting
    const updateFields = Object.entries(deal)
      .filter(([key]) => key !== 'id' && key !== 'companyName')
      .map(([key, value], index) => {
        // Convert camelCase to snake_case for database columns
        const dbColumn = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        
        // Add type casting based on the field type
        let typeCast = '';
        switch (key) {
          case 'value':
          case 'probability':
          case 'commissionPercentage':
            typeCast = '::integer';
            break;
          case 'closeDate':
          case 'updatedAt':
          case 'expirationDate':
            typeCast = '::date';
            break;
          case 'phase':
            typeCast = '::deal_phase';
            break;
          case 'status':
            typeCast = '::deal_status';
            break;
        }
        
        return `"${dbColumn}" = $${index + 2}${typeCast}`;
      });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const query = `
      UPDATE deals 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *,
        (SELECT name FROM companies WHERE id = company_id) as "companyName"
    `;

    const values = [id, ...Object.values(deal).filter(value => value !== undefined)];
    console.log('Update query:', query);
    console.log('Update values:', values);

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error(`Deal with ID ${id} not found`);
    }

    await client.query('COMMIT');

    const updatedDeal = result.rows[0];
    return {
      ...updatedDeal,
      companyId: updatedDeal.company_id,
      companyName: updatedDeal.companyName,
      closeDate: new Date(updatedDeal.close_date).toISOString().split('T')[0],
      updatedAt: new Date(updatedDeal.updated_at).toISOString().split('T')[0],
      expirationDate: updatedDeal.expiration_date ? new Date(updatedDeal.expiration_date).toISOString().split('T')[0] : null,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating deal:', error);
    throw error;
  } finally {
    client.release();
  }
};

function snakeCase(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export const deleteDeal = async (id: number): Promise<void> => {
    await pool.query('DELETE FROM deals WHERE id = $1', [id]);
} 