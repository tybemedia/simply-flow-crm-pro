import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from '@/data/tasks';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TimeTrackingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  tasks: Task[];
}

const TimeTrackingPopup: React.FC<TimeTrackingPopupProps> = ({
  isOpen,
  onClose,
  employeeName,
  tasks,
}) => {
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd.MM.yyyy', { locale: de });
  };

  const formatHours = (hours: number) => {
    return `${Math.round(hours * 10) / 10}h`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Zeiterfassung: {employeeName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatHours(task.trackedTime)}
                    </div>
                    <div className="text-xs text-gray-500">
                      von {formatHours(task.estimatedHours)} geplant
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-600">
                    Deadline: {formatDate(task.deadline)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: {
                      task.status === 'completed' ? 'Abgeschlossen' :
                      task.status === 'in_progress' ? 'In Bearbeitung' :
                      'Nicht begonnen'
                    }
                  </div>
                </div>
                {task.comments && task.comments.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Kommentare:</h4>
                    <div className="space-y-2">
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-gray-500">
                              {format(new Date(comment.timestamp), 'dd.MM.yyyy HH:mm', { locale: de })}
                            </span>
                          </div>
                          <p className="text-gray-600">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeTrackingPopup; 