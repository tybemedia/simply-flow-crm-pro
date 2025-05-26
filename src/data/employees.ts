export interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  department: string;
  status: 'active' | 'inactive';
  monthlyHours: number; // Monthly target hours
}

// This array will later be replaced with data from a database
export const employees: Employee[] = [
  {
    id: 1,
    name: "Timo Beyer",
    position: "Managing Partner",
    email: "anna.schmidt@techcorp.de",
    phone: "+49 123 456789",
    department: "Marketing",
    status: "active",
    monthlyHours: 40
  },
  {
    id: 2,
    name: "Joshua Baron",
    position: "Managing Partner",
    email: "thomas@videoworks.de",
    phone: "+49 987 654321",
    department: "Produktion",
    status: "active",
    monthlyHours: 40
  },
  {
    id: 3,
    name: "Salome Grieshammer",
    position: "Creative Director",
    email: "sarah@designplus.de",
    phone: "+49 555 123456",
    department: "Design",
    status: "active",
    monthlyHours: 40
  },
  {
    id: 4,
    name: "Adrian Schulz",
    position: "Fotograf",
    email: "info@michaelfoto.de",
    phone: "+49 666 789012",
    department: "Produktion",
    status: "active",
    monthlyHours: 40
  }
];

// Helper functions to get employee data
export const getEmployeeNames = () => employees.map(emp => emp.name);

export const getEmployeeById = (id: number) => employees.find(emp => emp.id === id);

export const getEmployeeByName = (name: string) => employees.find(emp => emp.name === name);

export const getActiveEmployees = () => employees.filter(emp => emp.status === 'active');

export const getEmployeesByDepartment = (department: string) => 
  employees.filter(emp => emp.department === department);

// Performance metrics interface
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

// Helper function to calculate employee performance
export const calculateEmployeePerformance = (employee: Employee, deals: any[], tasks: any[]): EmployeePerformance => {
  const employeeDeals = deals.filter(deal => 
    deal.assignedTo === employee.name
  );
  
  const employeeTasks = tasks.filter(task => 
    task.assignedTo === employee.name
  );

  const totalRevenue = employeeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const completedTasks = employeeTasks.filter(task => task.status === 'completed').length;
  const totalTasks = employeeTasks.length;
  
  // Calculate total worked hours from tasks
  const workedHours = employeeTasks.reduce((sum, task) => sum + (task.trackedTime || 0), 0);
  
  // Calculate performance score (0-100)
  const performanceScore = Math.min(100, Math.round(
    (employeeDeals.length * 20) + // 20 points per deal
    (completedTasks / Math.max(totalTasks, 1) * 40) + // 40 points for task completion
    (totalRevenue > 0 ? 40 : 0) // 40 points for having revenue
  ));

  return {
    id: employee.id,
    name: employee.name,
    deals: employeeDeals.length,
    revenue: totalRevenue,
    tasks: totalTasks,
    performance: performanceScore,
    workedHours: workedHours,
    monthlyHours: employee.monthlyHours
  };
};

// Helper function to get all employee performances
export const getAllEmployeePerformances = (deals: any[], tasks: any[]): EmployeePerformance[] => {
  return employees.map(employee => calculateEmployeePerformance(employee, deals, tasks));
}; 