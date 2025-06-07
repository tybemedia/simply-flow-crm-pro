import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Play, Pause, Clock, Calendar, User, AlertTriangle, CheckCircle2, Building, Settings } from 'lucide-react';
import TaskEditDialog from './TaskEditDialog';
import { getEmployeeNames } from '../data/employees';

// Define Task type directly in the component
export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
  columnId: string; // Mapped from column_id
  assignedTo: string; // Mapped from assigned_to
  customer: string | null;
  deadline: string;
  estimatedHours: number; // Mapped from estimated_hours
  trackedTime: number; // Mapped from tracked_time
  isTimerRunning: boolean; // Mapped from is_timer_running
  timerStart: number | null; // Mapped from timer_start
  // DB fields
  column_id?: string;
  assigned_to?: string;
  estimated_hours?: number;
  tracked_time?: number;
  is_timer_running?: boolean;
  timer_start?: number | null;
}

const TaskManager = () => {
  const [columns, setColumns] = useState([
    { id: 'general', title: 'Allgemein', color: 'bg-gray-500' },
    { id: 'webdesign', title: 'Webdesign', color: 'bg-blue-500' },
    { id: 'media', title: 'Medien', color: 'bg-purple-500' },
    { id: 'ideas', title: 'Projektideen', color: 'bg-green-500' }
  ]);

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        // Map snake_case from DB to camelCase for frontend
        const mappedData = data.map(task => ({
          ...task,
          columnId: task.column_id,
          assignedTo: task.assigned_to,
          estimatedHours: task.estimated_hours,
          trackedTime: task.tracked_time,
          isTimerRunning: task.is_timer_running,
          timerStart: task.timer_start
        }));
        setTasks(mappedData);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  const [currentTimes, setCurrentTimes] = useState({});
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [employees, setEmployees] = useState<string[]>([]);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    columnId: "general",
    priority: "Mittel",
    assignedTo: "",
    customer: null,
    deadline: "",
    estimatedHours: 0
  });

  useEffect(() => {
    getEmployeeNames().then(setEmployees);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCurrentTimes = {};
      
      tasks.forEach(task => {
        if (task.isTimerRunning && task.timerStart) {
          const additionalTime = (now - task.timerStart) / (1000 * 60 * 60);
          newCurrentTimes[task.id] = task.trackedTime + additionalTime;
        } else {
          newCurrentTimes[task.id] = task.trackedTime;
        }
      });
      
      setCurrentTimes(newCurrentTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Hoch": return "bg-red-500";
      case "Mittel": return "bg-yellow-500";
      case "Niedrig": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const toggleTimer = async (taskId: number) => {
    let taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
  
    const now = Date.now();
    let updatedFields;
  
    if (taskToUpdate.isTimerRunning) {
      const additionalTime = (now - (taskToUpdate.timerStart || now)) / (1000 * 60 * 60);
      updatedFields = {
        is_timer_running: false,
        timer_start: null,
        tracked_time: (taskToUpdate.trackedTime || 0) + additionalTime
      };
    } else {
      updatedFields = {
        is_timer_running: true,
        timer_start: now
      };
    }
  
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) throw new Error('Failed to update timer state.');
  
      const returnedTask = await response.json();
      const mappedTask = {
        ...returnedTask,
        columnId: returnedTask.column_id,
        assignedTo: returnedTask.assigned_to,
        estimatedHours: returnedTask.estimated_hours,
        trackedTime: returnedTask.tracked_time,
        isTimerRunning: returnedTask.is_timer_running,
        timerStart: returnedTask.timer_start,
      };
  
      setTasks(tasks.map(task => (task.id === taskId ? mappedTask : task)));
    } catch (error) {
      console.error("Error toggling timer:", error);
    }
  };

  const addColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn = {
        id: `column_${Date.now()}`,
        title: newColumnTitle.trim(),
        color: 'bg-indigo-500'
      };
      setColumns([...columns, newColumn]);
      setNewColumnTitle("");
    }
  };

  const getTasksForColumn = (columnId: string) => {
    return tasks.filter(task => task.columnId === columnId);
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const handleTaskClick = (task, event) => {
    // Check if the click was on the start/stop button
    if (event.target.closest('button.timer-toggle')) {
      return;
    }
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleTaskSave = async (updatedTask) => {
    try {
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          column_id: updatedTask.columnId,
          assigned_to: updatedTask.assignedTo,
          customer: updatedTask.customer,
          deadline: updatedTask.deadline,
          estimated_hours: updatedTask.estimatedHours,
        }),
      });
      if (!response.ok) throw new Error('Failed to update task.');
      
      const returnedTask = await response.json();
      const mappedTask = {
          ...returnedTask,
          columnId: returnedTask.column_id,
          assignedTo: returnedTask.assigned_to,
          estimatedHours: returnedTask.estimated_hours,
          trackedTime: returnedTask.tracked_time,
          isTimerRunning: returnedTask.is_timer_running,
          timerStart: returnedTask.timer_start,
      };

      setTasks(tasks.map(task => 
        task.id === mappedTask.id ? mappedTask : task
      ));
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.columnId !== targetColumnId) {
      try {
        const response = await fetch(`/api/tasks/${draggedTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ column_id: targetColumnId }),
        });
        if (!response.ok) throw new Error('Failed to update task column.');
        
        const returnedTask = await response.json();
        const mappedTask = {
          ...returnedTask,
          columnId: returnedTask.column_id,
          assignedTo: returnedTask.assigned_to,
          estimatedHours: returnedTask.estimated_hours,
          trackedTime: returnedTask.tracked_time,
          isTimerRunning: returnedTask.is_timer_running,
          timerStart: returnedTask.timer_start,
        };

        setTasks(tasks.map(task => 
          task.id === draggedTask.id 
            ? mappedTask
            : task
        ));
      } catch (error) {
        console.error("Error updating task column:", error);
      }
    }
    setDraggedTask(null);
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.deadline || !newTask.assignedTo) {
      alert("Bitte füllen Sie alle erforderlichen Felder aus (Titel, Zugewiesen an, Deadline).");
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          column_id: newTask.columnId,
          assigned_to: newTask.assignedTo,
          customer: newTask.customer,
          deadline: newTask.deadline,
          estimated_hours: newTask.estimatedHours,
        }),
      });
      if (!response.ok) throw new Error('Failed to create task.');

      const createdTask = await response.json();
      const mappedTask = {
        ...createdTask,
        columnId: createdTask.column_id,
        assignedTo: createdTask.assigned_to,
        estimatedHours: createdTask.estimated_hours,
        trackedTime: createdTask.tracked_time,
        isTimerRunning: createdTask.is_timer_running,
        timerStart: createdTask.timer_start,
      };

      setTasks(prevTasks => [...prevTasks, mappedTask]);
      setIsNewTaskDialogOpen(false);
      // Reset form
      setNewTask({
        title: "",
        description: "",
        columnId: "general",
        priority: "Mittel",
        assignedTo: "",
        customer: null,
        deadline: "",
        estimatedHours: 0
      });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task.');

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Aufgaben</h2>
          <p className="text-gray-600">Kanban-Board für Ihr Aufgabenmanagement</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Spalte hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Spalte hinzufügen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="columnTitle">Spalten-Titel</Label>
                  <Input
                    id="columnTitle"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="z.B. Marketing, Development..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Abbrechen</Button>
                  <Button onClick={addColumn}>Spalte hinzufügen</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neue Aufgabe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neue Aufgabe hinzufügen</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Aufgaben Titel</Label>
                  <Input id="title" placeholder="z.B. Konzept erstellen" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea id="description" placeholder="Aufgaben Beschreibung..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="column">Spalte</Label>
                  <Select value={newTask.columnId} onValueChange={value => setNewTask({...newTask, columnId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Spalte auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(column => (
                        <SelectItem key={column.id} value={column.id}>{column.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priorität</Label>
                  <Select value={newTask.priority} onValueChange={value => setNewTask({...newTask, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priorität auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoch">Hoch</SelectItem>
                      <SelectItem value="Mittel">Mittel</SelectItem>
                      <SelectItem value="Niedrig">Niedrig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedTo">Zugewiesen an</Label>
                  <Select value={newTask.assignedTo} onValueChange={value => setNewTask({...newTask, assignedTo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mitarbeiter auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customer">Kunde (optional)</Label>
                  <Select onValueChange={value => setNewTask({...newTask, customer: value === 'none' ? null : value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kunde auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Kein Kunde</SelectItem>
                      <SelectItem value="TechCorp GmbH">TechCorp GmbH</SelectItem>
                      <SelectItem value="Design Studio Plus">Design Studio Plus</SelectItem>
                      <SelectItem value="Retail Solutions AG">Retail Solutions AG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Geschätzte Stunden</Label>
                  <Input id="estimatedHours" type="number" placeholder="0" value={newTask.estimatedHours} onChange={e => setNewTask({...newTask, estimatedHours: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>Abbrechen</Button>
                <Button onClick={handleAddTask}>Aufgabe hinzufügen</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => {
          const columnTasks = getTasksForColumn(column.id);
          
          return (
            <div 
              key={column.id} 
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <Card className="h-full">
                <CardHeader className={`${column.color} text-white rounded-t-lg`}>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {column.title}
                    <Badge variant="secondary" className="bg-white text-gray-800">
                      {columnTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4 min-h-96">
                  {columnTasks.map((task) => {
                    const currentTime = currentTimes[task.id] || task.trackedTime;
                    const progress = task.estimatedHours > 0 ? (currentTime / task.estimatedHours) * 100 : 0;
                    
                    return (
                      <Card 
                        key={task.id} 
                        className={`hover:shadow-md transition-shadow cursor-pointer ${isOverdue(task.deadline) ? "border-red-300" : ""}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={(e) => handleTaskClick(task, e)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-sm">{task.title}</h4>
                              <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                                {task.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                            
                            {task.customer && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Building className="w-3 h-3" />
                                <span className="text-blue-600 hover:underline cursor-pointer">
                                  {task.customer}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{task.assignedTo}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{task.deadline}</span>
                                {isOverdue(task.deadline) && (
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Zeit: {formatTime(currentTime)} / {formatTime(task.estimatedHours)}</span>
                                <span>{Math.round(progress)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className={`h-1 rounded-full ${progress > 100 ? "bg-red-500" : "bg-blue-500"}`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              {task.isTimerRunning ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleTimer(task.id)}
                                  className="timer-toggle text-red-600 hover:text-red-700 text-xs h-8"
                                >
                                  <Pause className="w-3 h-3 mr-1" />
                                  Stopp
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleTimer(task.id)}
                                  className="timer-toggle text-green-600 hover:text-green-700 text-xs h-8"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Start
                                </Button>
                              )}
                              
                              {task.isTimerRunning && (
                                <div className="flex items-center space-x-1 text-xs text-green-600">
                                  <Clock className="w-3 h-3" />
                                  <span>Läuft</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <TaskEditDialog
        task={selectedTask}
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSave={handleTaskSave}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default TaskManager;
