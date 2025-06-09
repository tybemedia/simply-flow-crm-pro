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
  const { title, companyId, value, phase, status, closeDate, description, assignedTo, salesperson, commissionPercentage, probability, updatedAt, expirationDate } = deal;
  const result = await pool.query(
    `INSERT INTO deals (title, company_id, value, phase, status, close_date, description, assigned_to, salesperson, commission_percentage, probability, updated_at, expiration_date) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [title, companyId, value, phase, status, closeDate, description, assignedTo, salesperson, commissionPercentage, probability, updatedAt, expirationDate]
  );
  const newDeal = result.rows[0];
   return {
      ...newDeal,
      companyId: newDeal.company_id,
      closeDate: new Date(newDeal.close_date).toISOString().split('T')[0],
      updatedAt: new Date(newDeal.updated_at).toISOString().split('T')[0],
      expirationDate: newDeal.expiration_date ? new Date(newDeal.expiration_date).toISOString().split('T')[0] : null,
  };
};

export const updateDeal = async (id: number, deal: Partial<Omit<Deal, 'id' | 'companyName'>>): Promise<Deal> => {
    const setClause = Object.keys(deal)
        .map((key, index) => `"${snakeCase(key)}" = $${index + 2}`)
        .join(', ');
    const values = Object.values(deal);

    const query = `UPDATE deals SET ${setClause} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id, ...values]);
    const updatedDeal = result.rows[0];
     return {
        ...updatedDeal,
        companyId: updatedDeal.company_id,
        closeDate: new Date(updatedDeal.close_date).toISOString().split('T')[0],
        updatedAt: new Date(updatedDeal.updated_at).toISOString().split('T')[0],
        expirationDate: updatedDeal.expiration_date ? new Date(updatedDeal.expiration_date).toISOString().split('T')[0] : null,
    };
}

function snakeCase(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export const deleteDeal = async (id: number): Promise<void> => {
    await pool.query('DELETE FROM deals WHERE id = $1', [id]);
} 