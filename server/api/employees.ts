import { pool } from '../lib/db';

export interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  department: string;
  status: 'active' | 'inactive';
  monthlyHours: number;
}

export const getEmployees = async (): Promise<Employee[]> => {
  const result = await pool.query(`
    SELECT 
      id, 
      name, 
      position, 
      email, 
      phone, 
      department, 
      status, 
      "monthlyHours"
    FROM employees
  `);

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    position: row.position,
    email: row.email,
    phone: row.phone,
    department: row.department,
    status: row.status,
    monthlyHours: row.monthlyHours,
  }));
};
