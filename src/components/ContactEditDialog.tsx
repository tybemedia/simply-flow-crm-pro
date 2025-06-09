import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building, Mail, Phone, MessageSquare, Send, Activity, Trash2 } from 'lucide-react';
import ActivityTracker from './ActivityTracker';

interface Comment {
  id: number;
  contact_id?: number;
  author: string;
  text: string;
  timestamp: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  position: string;
  type: string;
  description?: string;
  tags: string[];
  comments?: Comment[];
}

interface ContactEditDialogProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  onAddComment: (contactId: number, commentText: string) => void;
  onDelete: (contactId: number) => void;
}

const ContactEditDialog = ({ contact, isOpen, onClose, onSave, onAddComment, onDelete }: ContactEditDialogProps) => {
  const [editedContact, setEditedContact] = useState<Contact | null>(null);
  const [newComment, setNewComment] = useState("");

  React.useEffect(() => {
    if (contact) {
      setEditedContact({
        ...contact,
        description: contact.description || "",
        comments: contact.comments || [],
      });
    }
  }, [contact]);

  const handleSave = () => {
    if (editedContact) {
      onSave(editedContact);
      onClose();
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && editedContact) {
      onAddComment(editedContact.id, newComment.trim());
      setNewComment("");
    }
  };

  const handleDelete = () => {
    if (editedContact) {
      onDelete(editedContact.id);
      onClose();
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
                    <Button onClick={handleAddComment} size="sm" className="self-end">
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
            <div className="text-center text-gray-500 py-8">Activity tracking is not yet implemented.</div>
          </TabsContent>
        </Tabs>

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

export default ContactEditDialog;
