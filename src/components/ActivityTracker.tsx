
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Phone, Mail, Calendar, MessageSquare, Clock } from 'lucide-react';

interface Activity {
  id: number;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description: string;
  date: string;
  duration?: number;
  author: string;
}

interface ActivityTrackerProps {
  contactId?: number;
  companyId?: number;
  activities: Activity[];
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
}

const ActivityTracker = ({ contactId, companyId, activities, onAddActivity }: ActivityTrackerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'call' as const,
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    duration: 0,
    author: 'Aktueller User'
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'note': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-500';
      case 'email': return 'bg-green-500';
      case 'meeting': return 'bg-purple-500';
      case 'note': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Anruf';
      case 'email': return 'E-Mail';
      case 'meeting': return 'Termin';
      case 'note': return 'Notiz';
      default: return 'Aktivität';
    }
  };

  const handleAddActivity = () => {
    onAddActivity({
      ...newActivity,
      duration: newActivity.type === 'call' || newActivity.type === 'meeting' ? newActivity.duration : undefined
    });
    setNewActivity({
      type: 'call',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      duration: 0,
      author: 'Aktueller User'
    });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Aktivitäten ({activities.length})</h4>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neue Aktivität
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neue Aktivität hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Typ</Label>
                <Select value={newActivity.type} onValueChange={(value: any) => setNewActivity({...newActivity, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Anruf</SelectItem>
                    <SelectItem value="email">E-Mail</SelectItem>
                    <SelectItem value="meeting">Termin</SelectItem>
                    <SelectItem value="note">Notiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input 
                  id="title"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  placeholder="z.B. Preisverhandlung"
                />
              </div>
              <div>
                <Label htmlFor="date">Datum</Label>
                <Input 
                  id="date"
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                />
              </div>
              {(newActivity.type === 'call' || newActivity.type === 'meeting') && (
                <div>
                  <Label htmlFor="duration">Dauer (Minuten)</Label>
                  <Input 
                    id="duration"
                    type="number"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity({...newActivity, duration: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea 
                  id="description"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  placeholder="Details zur Aktivität..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleAddActivity}>Hinzufügen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Keine Aktivitäten vorhanden</p>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)} text-white`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {getActivityLabel(activity.type)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  {activity.duration && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{activity.duration} Minuten</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-700">{activity.description}</p>
                  <div className="text-xs text-gray-500">von {activity.author}</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityTracker;
