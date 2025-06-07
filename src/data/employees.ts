import { Deal } from './deals';
import { Task } from './tasks';

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
  const response = await fetch('/api/employees');
  if (!response.ok) {
    throw new Error('Failed to fetch employees');
  }
  return response.json();
};

// Helper: Nur Namen
export const getEmployeeNames = async (): Promise<string[]> => {
  const employees = await getEmployees();
  return employees.map(emp => emp.name).filter(name => name && name.trim() !== '');
};

// Helper: Einzelne Mitarbeiter
export const getEmployeeById = async (id: number): Promise<Employee | undefined> => {
  const employees = await getEmployees();
  return employees.find(emp => emp.id === id);
};

export const getEmployeeByName = async (name: string): Promise<Employee | undefined> => {
  const employees = await getEmployees();
  return employees.find(emp => emp.name === name);
};

// Helper: Filter
export const getActiveEmployees = async (): Promise<Employee[]> => {
  const employees = await getEmployees();
  return employees.filter(emp => emp.status === 'active');
};

export const getEmployeesByDepartment = async (department: string): Promise<Employee[]> => {
  const employees = await getEmployees();
  return employees.filter(emp => emp.department === department);
};

// Performance-Metriken
export interface EmployeePerformance {
  id: number;
  name: string;
  deals: number;
  revenue: number;
  tasks: number;
  performance: number;
  workedHours: number;
  monthlyHours: number;
}

export const calculateEmployeePerformance = (
  employee: Employee,
  deals: Deal[],
  tasks: Task[]
): EmployeePerformance => {
  const employeeDeals = deals.filter(deal => deal.assignedTo === employee.name);
  const employeeTasks = tasks.filter(task => task.assignedTo === employee.name);

  const totalRevenue = employeeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const completedTasks = employeeTasks.filter(task => task.status === 'completed').length;
  const totalTasks = employeeTasks.length;

  const workedHours = employeeTasks.reduce((sum, task) => sum + (task.trackedTime || 0), 0);

  const performanceScore = Math.min(
    100,
    Math.round(
      (employeeDeals.length * 20) +
      ((completedTasks / Math.max(totalTasks, 1)) * 40) +
      (totalRevenue > 0 ? 40 : 0)
    )
  );

  return {
    id: employee.id,
    name: employee.name,
    deals: employeeDeals.length,
    revenue: totalRevenue,
    tasks: totalTasks,
    performance: performanceScore,
    workedHours,
    monthlyHours: employee.monthlyHours,
  };
};

export const getAllEmployeePerformances = async (
  deals: Deal[],
  tasks: Task[]
): Promise<EmployeePerformance[]> => {
  const employees = await getEmployees();
  return employees.map(employee =>
    calculateEmployeePerformance(employee, deals, tasks)
  );
};
