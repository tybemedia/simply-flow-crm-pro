import { pool } from '../lib/db';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
  column_id: string;
  assigned_to: string;
  customer: string | null;
  deadline: string;
  estimated_hours: number;
  tracked_time: number;
  // comments are handled separately
}

export const getTasks = async (): Promise<Task[]> => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
  return result.rows;
};

export const createTask = async (task: Omit<Task, 'id' | 'tracked_time'>): Promise<Task> => {
  const { title, description, priority, column_id, assigned_to, customer, deadline, estimated_hours } = task;
  const result = await pool.query(
    'INSERT INTO tasks (title, description, priority, column_id, assigned_to, customer, deadline, estimated_hours) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [title, description, priority, column_id, assigned_to, customer, deadline, estimated_hours]
  );
  return result.rows[0];
};

export const updateTask = async (id: number, task: Partial<Task>): Promise<Task> => {
    const fields = Object.keys(task).filter(key => key !== 'id') as (keyof Task)[];
    const values = fields.map(key => task[key]);
    const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');

    if (fields.length === 0) {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
        return result.rows[0];
    }

    const query = `UPDATE tasks SET ${setClause} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
};

export const deleteTask = async (id: number): Promise<void> => {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
}; 