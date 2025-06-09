import { pool } from '../lib/db';

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyId: number | null;
  companyName?: string;
  position: string;
  type: string;
  description?: string;
  tags: string[];
}

export interface ContactComment {
    id: number;
    contact_id: number;
    author: string;
    text: string;
    timestamp: string;
}

export const getContacts = async (companyId?: number): Promise<Contact[]> => {
  let query = `
    SELECT c.*, co.name as "companyName" 
    FROM contacts c 
    LEFT JOIN companies co ON c.company_id = co.id
  `;
  const params = [];
  if (companyId) {
    query += ' WHERE c.company_id = $1';
    params.push(companyId);
  }
  query += ' ORDER BY c.name ASC';
  const result = await pool.query(query, params);
  return result.rows.map(row => ({
    ...row,
    companyId: row.company_id,
    companyName: row.companyName
  }));
};

export const createContact = async (contact: Omit<Contact, 'id' | 'companyName'>): Promise<Contact> => {
    const { name, email, phone, companyId, position, type, description, tags } = contact;
    const result = await pool.query(
        'INSERT INTO contacts (name, email, phone, company_id, position, type, description, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [name, email, phone, companyId, position, type, description, JSON.stringify(tags || [])]
    );
    return result.rows[0];
};

export const updateContact = async (id: number, contact: Partial<Omit<Contact, 'id' | 'companyName'>>): Promise<Contact> => {
    const fields = Object.keys(contact).filter(k => k !== 'companyName') as (keyof typeof contact)[];
    const values = fields.map(key => {
        const value = contact[key];
        if(key === 'tags') {
            return JSON.stringify(value);
        }
        return value;
    });
    const setClause = fields
      .map((field, index) => `"${snakeCase(field)}" = $${index + 2}`)
      .join(', ');

    if (fields.length === 0) {
        const result = await pool.query('SELECT * FROM contacts WHERE id = $1', [id]);
        return result.rows[0];
    }

    const query = `UPDATE contacts SET ${setClause} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
};

function snakeCase(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export const deleteContact = async (id: number): Promise<void> => {
    await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
};


// Comments
export const getCommentsForContact = async (contactId: number): Promise<ContactComment[]> => {
    const result = await pool.query('SELECT * FROM contact_comments WHERE contact_id = $1 ORDER BY timestamp ASC', [contactId]);
    return result.rows;
}

export const addCommentToContact = async (contactId: number, comment: Omit<ContactComment, 'id' | 'contact_id' | 'timestamp'>): Promise<ContactComment> => {
    const { author, text } = comment;
    const result = await pool.query(
        'INSERT INTO contact_comments (contact_id, author, text) VALUES ($1, $2, $3) RETURNING *',
        [contactId, author, text]
    );
    return result.rows[0];
} 