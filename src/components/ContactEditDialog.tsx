
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building, Mail, Phone, MessageSquare, Send, Activity } from 'lucide-react';
import ActivityTracker from './ActivityTracker';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  position: string;
  type: string;
  tags: string[];
  description?: string;
  comments?: Comment[];
  activities?: any[];
}

interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

interface ContactEditDialogProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

const ContactEditDialog = ({ contact, isOpen, onClose, onSave }: ContactEditDialogProps) => {
  const [editedContact, setEditedContact] = useState<Contact | null>(null);
  const [newComment, setNewComment] = useState("");

  React.useEffect(() => {
    if (contact) {
      setEditedContact({
        ...contact,
        description: contact.description || "",
        comments: contact.comments || [],
        activities: contact.activities || []
      });
    }
  }, [contact]);

  const handleSave = () => {
    if (editedContact) {
      onSave(editedContact);
      onClose();
    }
  };

  const addComment = () => {
    if (newComment.trim() && editedContact) {
      const comment: Comment = {
        id: Date.now(),
        author: "Aktueller User",
        text: newComment.trim(),
        timestamp: new Date().toISOString()
      };
      
      setEditedContact({
        ...editedContact,
        comments: [...(editedContact.comments || []), comment]
      });
      setNewComment("");
    }
  };

  const addActivity = (activityData: any) => {
    if (editedContact) {
      const activity = {
        id: Date.now(),
        ...activityData
      };
      
      setEditedContact({
        ...editedContact,
        activities: [...(editedContact.activities || []), activity]
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Kunde": return "bg-blue-500";
      case "Dienstleister": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  if (!editedContact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>{editedContact.name}</span>
            <Badge className={`${getTypeColor(editedContact.type)} text-white`}>
              {editedContact.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details & Kommentare</TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Aktivitäten
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Linke Spalte - Hauptdaten */}
              <div className="col-span-2 space-y-4">
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={editedContact.description}
                    onChange={(e) => setEditedContact({...editedContact, description: e.target.value})}
                    placeholder="Beschreibung des Kontakts..."
                    rows={4}
                  />
                </div>

                {/* Kommentare Sektion */}
                <div>
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Kommentare ({editedContact.comments?.length || 0})
                  </Label>
                  
                  <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                    {editedContact.comments?.map((comment) => (
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

              {/* Rechte Spalte - Kontaktinformationen */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-gray-900">Kontaktinformationen</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {editedContact.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{editedContact.phone}</span>
                    </div>

                    {editedContact.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {editedContact.company}
                        </span>
                      </div>
                    )}

                    <div className="text-sm">
                      <span className="text-gray-600">Position:</span>
                      <span className="ml-2 font-medium">{editedContact.position}</span>
                    </div>
                  </div>

                  {editedContact.tags.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {editedContact.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <ActivityTracker 
              contactId={editedContact.id}
              activities={editedContact.activities || []}
              onAddActivity={addActivity}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
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

export default ContactEditDialog;
