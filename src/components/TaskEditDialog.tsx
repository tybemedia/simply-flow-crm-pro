import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building, Calendar, Clock, MessageSquare, Send, Trash2 } from 'lucide-react';
import { getEmployeeNames } from '../data/employees';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  columnId: string;
  assignedTo: string;
  customer: string | null;
  deadline: string;
  estimatedHours: number;
  trackedTime: number;
  comments?: Comment[];
}

interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const TaskEditDialog = ({ task, isOpen, onClose, onSave, onDelete }: TaskEditDialogProps) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState("");
  const [employees, setEmployees] = useState<string[]>([]);

  React.useEffect(() => {
    getEmployeeNames().then(setEmployees);
  }, []);

  React.useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        comments: task.comments || []
      });
    }
  }, [task]);

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      onClose();
    }
  };

  const handleDelete = () => {
    if (editedTask) {
      onDelete(editedTask.id);
      onClose();
    }
  };

  const addComment = () => {
    if (newComment.trim() && editedTask) {
      const comment: Comment = {
        id: Date.now(),
        author: "Aktueller User", // In echtem System: aktueller User
        text: newComment.trim(),
        timestamp: new Date().toISOString()
      };
      
      setEditedTask({
        ...editedTask,
        comments: [...(editedTask.comments || []), comment]
      });
      setNewComment("");
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (!editedTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Aufgabe bearbeiten</span>
            <Badge className="bg-blue-500 text-white">{editedTask.priority}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Linke Spalte - Hauptdaten */}
          <div className="col-span-2 space-y-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={editedTask.description}
                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                rows={4}
              />
            </div>

            {/* Kommentare Sektion */}
            <div>
              <Label className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Kommentare ({editedTask.comments?.length || 0})
              </Label>
              
              <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                {editedTask.comments?.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span className="font-medium">{comment.author}</span>
                      <span>{new Date(comment.timestamp).toLocaleString('de-DE')}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                )) || <p className="text-gray-500 text-sm">Keine Kommentare vorhanden</p>}
              </div>

              <div className="mt-3 flex gap-2">
                <Textarea
                  placeholder="Kommentar hinzufügen..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={addComment} size="sm" className="self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Rechte Spalte - Metadaten */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="space-y-2">
                <Label htmlFor="assignedTo" className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Zugewiesen an:</span>
                </Label>
                <Select
                  value={editedTask.assignedTo}
                  onValueChange={(value) => setEditedTask({...editedTask, assignedTo: value})}
                >
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

              {editedTask.customer && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Kunde:</span>
                  <span className="font-medium text-blue-600 cursor-pointer hover:underline">
                    {editedTask.customer}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="deadline" className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Deadline:</span>
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={editedTask.deadline}
                  onChange={(e) => setEditedTask({...editedTask, deadline: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Zeit:</span>
                <span className="font-medium">
                  {formatTime(editedTask.trackedTime)} / {formatTime(editedTask.estimatedHours)}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Fortschritt</span>
                  <span>{Math.round((editedTask.trackedTime / editedTask.estimatedHours) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((editedTask.trackedTime / editedTask.estimatedHours) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button variant="destructive" onClick={handleDelete} className="mr-auto">
            <Trash2 className="w-4 h-4 mr-2" />
            Löschen
          </Button>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
