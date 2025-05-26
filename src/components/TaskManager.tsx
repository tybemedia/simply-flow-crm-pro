
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Play, Pause, Square, Clock, Calendar, User, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

const TaskManager = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Webseite Mockups erstellen",
      description: "Erste Entwürfe für die TechCorp Webseite erstellen",
      priority: "Hoch",
      status: "In Bearbeitung",
      assignedTo: "Anna Schmidt",
      customer: "TechCorp GmbH",
      deadline: "2024-01-25",
      estimatedHours: 8,
      trackedTime: 3.5,
      isTimerRunning: false,
      timerStart: null
    },
    {
      id: 2,
      title: "Kundentermin vorbereiten",
      description: "Präsentation für Design Studio Plus vorbereiten",
      priority: "Mittel",
      status: "Zu erledigen",
      assignedTo: "Sarah Weber",
      customer: "Design Studio Plus",
      deadline: "2024-01-22",
      estimatedHours: 2,
      trackedTime: 0,
      isTimerRunning: false,
      timerStart: null
    },
    {
      id: 3,
      title: "E-Commerce Integration testen",
      description: "Payment Gateway und Checkout-Prozess testen",
      priority: "Hoch",
      status: "In Bearbeitung",
      assignedTo: "Thomas Müller",
      customer: "Retail Solutions AG",
      deadline: "2024-01-28",
      estimatedHours: 12,
      trackedTime: 7.2,
      isTimerRunning: true,
      timerStart: Date.now() - 1800000 // 30 Minuten ago
    },
    {
      id: 4,
      title: "Logo Konzepte entwickeln",
      description: "3 verschiedene Logo-Varianten für neuen Kunden",
      priority: "Niedrig",
      status: "Abgeschlossen",
      assignedTo: "Michael König",
      customer: "StartUp XYZ",
      deadline: "2024-01-20",
      estimatedHours: 6,
      trackedTime: 5.8,
      isTimerRunning: false,
      timerStart: null
    }
  ]);

  const [currentTimes, setCurrentTimes] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCurrentTimes = {};
      
      tasks.forEach(task => {
        if (task.isTimerRunning && task.timerStart) {
          const additionalTime = (now - task.timerStart) / (1000 * 60 * 60); // in hours
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Zu erledigen": return "bg-gray-500";
      case "In Bearbeitung": return "bg-blue-500";
      case "Abgeschlossen": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Zu erledigen": return Circle;
      case "In Bearbeitung": return Clock;
      case "Abgeschlossen": return CheckCircle2;
      default: return Circle;
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const toggleTimer = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (task.isTimerRunning) {
          // Stop timer and update tracked time
          const now = Date.now();
          const additionalTime = (now - task.timerStart) / (1000 * 60 * 60);
          return {
            ...task,
            isTimerRunning: false,
            timerStart: null,
            trackedTime: task.trackedTime + additionalTime
          };
        } else {
          // Start timer
          return {
            ...task,
            isTimerRunning: true,
            timerStart: Date.now(),
            status: task.status === "Zu erledigen" ? "In Bearbeitung" : task.status
          };
        }
      }
      return task;
    }));
  };

  const updateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Aufgaben</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Aufgaben und Projekte</p>
        </div>
        <Dialog>
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
                <Input id="title" placeholder="z.B. Konzept erstellen" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" placeholder="Aufgaben Beschreibung..." />
              </div>
              <div>
                <Label htmlFor="priority">Priorität</Label>
                <Select>
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Anna Schmidt">Anna Schmidt</SelectItem>
                    <SelectItem value="Thomas Müller">Thomas Müller</SelectItem>
                    <SelectItem value="Sarah Weber">Sarah Weber</SelectItem>
                    <SelectItem value="Michael König">Michael König</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="customer">Kunde</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TechCorp GmbH">TechCorp GmbH</SelectItem>
                    <SelectItem value="Design Studio Plus">Design Studio Plus</SelectItem>
                    <SelectItem value="Retail Solutions AG">Retail Solutions AG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" />
              </div>
              <div>
                <Label htmlFor="estimatedHours">Geschätzte Stunden</Label>
                <Input id="estimatedHours" type="number" placeholder="0" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">Abbrechen</Button>
              <Button>Aufgabe hinzufügen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{getTasksByStatus("Zu erledigen").length}</div>
            <div className="text-sm text-gray-600">Zu erledigen</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{getTasksByStatus("In Bearbeitung").length}</div>
            <div className="text-sm text-gray-600">In Bearbeitung</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{getTasksByStatus("Abgeschlossen").length}</div>
            <div className="text-sm text-gray-600">Abgeschlossen</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const StatusIcon = getStatusIcon(task.status);
          const currentTime = currentTimes[task.id] || task.trackedTime;
          const progress = task.estimatedHours > 0 ? (currentTime / task.estimatedHours) * 100 : 0;
          
          return (
            <Card key={task.id} className={`hover:shadow-lg transition-shadow ${isOverdue(task.deadline) && task.status !== "Abgeschlossen" ? "border-red-300" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <StatusIcon className={`w-5 h-5 ${task.status === "Abgeschlossen" ? "text-green-600" : "text-gray-600"}`} />
                      <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
                      <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                        {task.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(task.status)} text-white`}>
                        {task.status}
                      </Badge>
                      {isOverdue(task.deadline) && task.status !== "Abgeschlossen" && (
                        <Badge className="bg-red-500 text-white flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Überfällig
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{task.deadline}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Kunde: </span>
                        <span className="font-medium">{task.customer}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Zeit: </span>
                        <span className="font-medium">
                          {formatTime(currentTime)} / {formatTime(task.estimatedHours)}
                        </span>
                      </div>
                    </div>

                    {/* Time Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Zeitfortschritt</span>
                        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={`h-2 ${progress > 100 ? "bg-red-100" : ""}`}
                      />
                      {progress > 100 && (
                        <div className="text-xs text-red-600 mt-1">
                          Geschätzte Zeit überschritten
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {/* Timer Controls */}
                    <div className="flex items-center space-x-2">
                      {task.isTimerRunning ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTimer(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Stopp
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTimer(task.id)}
                          className="text-green-600 hover:text-green-700"
                          disabled={task.status === "Abgeschlossen"}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>

                    {/* Status Controls */}
                    <div className="flex space-x-2">
                      {task.status !== "Abgeschlossen" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, "Abgeschlossen")}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Abschließen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TaskManager;
