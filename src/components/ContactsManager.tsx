import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Mail, Phone, Building, User, Search } from 'lucide-react';
import ContactEditDialog from './ContactEditDialog';

export interface Comment {
  id: number;
  contact_id?: number;
  author: string;
  text: string;
  timestamp: string;
}

export interface Contact {
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

interface Company {
  id: number;
  name: string;
}

const ContactsManager = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Alle");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: null,
    position: "",
    type: "Kunde",
    tags: []
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchContacts();
    fetchCompanies();
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "Alle" || contact.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Kunde": return "bg-blue-500";
      case "Dienstleister": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const handleContactClick = async (contact: Contact) => {
    try {
      const response = await fetch(`/api/contacts/${contact.id}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments.');
      const comments = await response.json();
      setSelectedContact({ ...contact, comments });
      setIsContactDialogOpen(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSaveContact = async (contactToSave: Contact) => {
    try {
      // If it's a new contact (no id), create it
      if (!contactToSave.id) {
        const response = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactToSave),
        });
        if (!response.ok) throw new Error('Failed to create contact.');
        const createdContact = await response.json();
        setContacts(prev => [...prev, createdContact]);
        setIsNewContactDialogOpen(false);
        // Reset form
        setNewContact({
          name: "", email: "", phone: "", company: null, position: "", type: "Kunde", tags: []
        });
      } else {
        // Otherwise, update existing contact
        const { comments, ...contactData } = contactToSave;
        const response = await fetch(`/api/contacts/${contactToSave.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData),
        });
        if (!response.ok) throw new Error('Failed to update contact.');
        const updatedContact = await response.json();
        setContacts(contacts.map(c => c.id === updatedContact.id ? { ...c, ...updatedContact } : c));
        setSelectedContact(null);
        setIsContactDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  const handleAddComment = async (contactId: number, commentText: string) => {
    try {
        const response = await fetch(`/api/contacts/${contactId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author: 'Aktueller User', text: commentText }),
        });
        if (!response.ok) throw new Error('Failed to add comment.');
        const newComment = await response.json();

        // Update the selected contact's comments
        if (selectedContact && selectedContact.id === contactId) {
            setSelectedContact({
                ...selectedContact,
                comments: [...(selectedContact.comments || []), newComment]
            });
        }
    } catch (error) {
        console.error("Error adding comment:", error);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete contact.');
      setContacts(contacts.filter(c => c.id !== contactId));
      setIsContactDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Kontakte</h2>
          <p className="text-gray-600">Verwalten Sie alle Ihre Kontakte und Dienstleister</p>
        </div>
        <Dialog open={isNewContactDialogOpen} onOpenChange={setIsNewContactDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neuer Kontakt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen Kontakt hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Vor- und Nachname" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" placeholder="email@beispiel.de" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})}/>
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" placeholder="+49 123 456789" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})}/>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="z.B. Marketing Manager" value={newContact.position} onChange={e => setNewContact({...newContact, position: e.target.value})}/>
              </div>
              <div>
                <Label htmlFor="company">Unternehmen (optional)</Label>
                <Select onValueChange={value => setNewContact({...newContact, company: value === 'none' ? null : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unternehmen auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Unternehmen</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.name}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Typ</Label>
                <Select value={newContact.type} onValueChange={(value: any) => setNewContact({...newContact, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kontakt-Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kunde">Kunde</SelectItem>
                    <SelectItem value="Dienstleister">Dienstleister</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsNewContactDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={() => handleSaveContact(newContact as any)}>Kontakt hinzufügen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter und Suche */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Kontakte durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alle">Alle Kontakte</SelectItem>
            <SelectItem value="Kunde">Nur Kunden</SelectItem>
            <SelectItem value="Dienstleister">Nur Dienstleister</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{contacts.filter(c => c.type === "Kunde").length}</div>
            <div className="text-sm text-gray-600">Kunden</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{contacts.filter(c => c.type === "Dienstleister").length}</div>
            <div className="text-sm text-gray-600">Dienstleister</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{contacts.filter(c => !c.company).length}</div>
            <div className="text-sm text-gray-600">Ohne Unternehmen</div>
          </CardContent>
        </Card>
      </div>

      {/* Kontakte Tabelle */}
      <Card>
        <CardHeader>
          <CardTitle>Kontakte ({filteredContacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unternehmen</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleContactClick(contact)}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.company ? (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-blue-600 hover:underline">{contact.company}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Kein Unternehmen</span>
                    )}
                  </TableCell>
                  <TableCell>{contact.position}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getTypeColor(contact.type)} text-white`}>
                      {contact.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleContactClick(contact); }}>
                        Bearbeiten
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ContactEditDialog
        contact={selectedContact}
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        onSave={handleSaveContact}
        onAddComment={handleAddComment}
        onDelete={handleDeleteContact}
      />
    </div>
  );
};

export default ContactsManager;
