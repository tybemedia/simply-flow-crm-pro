import { pool } from '../lib/db';

export interface Column {
  id: string;
  title: string;
  color: string;
  icon: string;
}

export const getColumns = async (): Promise<Column[]> => {
  const result = await pool.query('SELECT * FROM columns ORDER BY title ASC');
  return result.rows;
};

export const createColumn = async (column: Column): Promise<Column> => {
  const { id, title, color, icon } = column;
  const result = await pool.query(
    'INSERT INTO columns (id, title, color, icon) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, title, color, icon]
  );
  return result.rows[0];
};

export const updateColumn = async (id: string, column: Partial<Column>): Promise<Column> => {
  const { title, color, icon } = column;
  const result = await pool.query(
    'UPDATE columns SET title = $1, color = $2, icon = $3 WHERE id = $4 RETURNING *',
    [title, color, icon, id]
  );
  return result.rows[0];
}; 