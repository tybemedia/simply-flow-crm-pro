export interface Task {
  id: number;
  title: string;
  description: string;
  priority: "Hoch" | "Mittel" | "Niedrig";
  columnId: string;
  assignedTo: string;
  customer: string | null;
  deadline: string;
  estimatedHours: number;
  trackedTime: number;
  isTimerRunning: boolean;
  timerStart: number | null;
  status: "completed" | "in_progress" | "not_started";
  comments?: Comment[];
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

// This array will later be replaced with data from a database
export const tasks: Task[] = [
  {
    id: 1,
    title: "Webseite Mockups erstellen",
    description: "Erste Entwürfe für die TechCorp Webseite erstellen",
    priority: "Hoch",
    columnId: "webdesign",
    assignedTo: "Timo Beyer",
    customer: "TechCorp GmbH",
    deadline: "2024-01-25",
    estimatedHours: 8,
    trackedTime: 9,
    isTimerRunning: false,
    timerStart: null,
    status: "in_progress"
  },
  {
    id: 2,
    title: "Video Konzept entwickeln",
    description: "Konzept für Produktvideo erstellen",
    priority: "Mittel",
    columnId: "media",
    assignedTo: "Joshua Baron",
    customer: "Design Studio Plus",
    deadline: "2024-01-22",
    estimatedHours: 4,
    trackedTime: 0,
    isTimerRunning: false,
    timerStart: null,
    status: "not_started"
  },
  {
    id: 3,
    title: "E-Commerce Integration testen",
    description: "Payment Gateway und Checkout-Prozess testen",
    priority: "Hoch",
    columnId: "webdesign",
    assignedTo: "Salome Grieshammer",
    customer: "Retail Solutions AG",
    deadline: "2024-01-28",
    estimatedHours: 12,
    trackedTime: 7.2,
    isTimerRunning: true,
    timerStart: Date.now() - 1800000,
    status: "in_progress"
  },
  {
    id: 4,
    title: "Team Meeting organisieren",
    description: "Wöchentliches Team Meeting planen",
    priority: "Niedrig",
    columnId: "general",
    assignedTo: "Adrian Schulz",
    customer: null,
    deadline: "2024-01-20",
    estimatedHours: 1,
    trackedTime: 0.5,
    isTimerRunning: false,
    timerStart: null,
    status: "completed"
  },
  {
    id: 5,
    title: "Angebot schreiben",
    description: "Erste Entwürfe für die TechCorp Webseite erstellen",
    priority: "Hoch",
    columnId: "webdesign",
    assignedTo: "Timo Beyer",
    customer: "TechCorp GmbH",
    deadline: "2024-01-25",
    estimatedHours: 8,
    trackedTime: 4.5,
    isTimerRunning: false,
    timerStart: null,
    status: "in_progress"
  }
];

// Helper functions to get task data
export const getTasksByEmployee = (employeeName: string): Task[] => {
  return tasks.filter(task => task.assignedTo === employeeName);
};

export const getTasksByColumn = (columnId: string): Task[] => {
  return tasks.filter(task => task.columnId === columnId);
};

export const getTasksByStatus = (status: Task['status']): Task[] => {
  return tasks.filter(task => task.status === status);
};

export const getTasksByCustomer = (customerName: string): Task[] => {
  return tasks.filter(task => task.customer === customerName);
};

export const getTotalTrackedHours = (employeeName: string): number => {
  return tasks
    .filter(task => task.assignedTo === employeeName)
    .reduce((sum, task) => sum + task.trackedTime, 0);
};

export const getCurrentMonthTrackedHours = (employeeName: string): number => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return tasks
    .filter(task => task.assignedTo === employeeName)
    .reduce((sum, task) => {
      let hours = task.trackedTime;
      if (task.isTimerRunning && task.timerStart) {
        const additionalTime = (Date.now() - task.timerStart) / (1000 * 60 * 60);
        hours += additionalTime;
      }
      return sum + hours;
    }, 0);
};

// Function to add a new task
export const addTask = (task: Omit<Task, 'id'>): Task => {
  const newTask = {
    ...task,
    id: Date.now()
  };
  tasks.push(newTask);
  return newTask;
};

// Function to update a task
export const updateTask = (taskId: number, updates: Partial<Task>): Task | undefined => {
  const index = tasks.findIndex(task => task.id === taskId);
  if (index === -1) return undefined;
  
  tasks[index] = {
    ...tasks[index],
    ...updates
  };
  return tasks[index];
};

// Function to delete a task
export const deleteTask = (taskId: number): boolean => {
  const index = tasks.findIndex(task => task.id === taskId);
  if (index === -1) return false;
  
  tasks.splice(index, 1);
  return true;
}; 