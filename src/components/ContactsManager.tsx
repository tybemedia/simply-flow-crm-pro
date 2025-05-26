import React, { useState } from 'react';
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

const ContactsManager = () => {
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "Anna Schmidt",
      email: "anna.schmidt@techcorp.de",
      phone: "+49 123 456789",
      company: "TechCorp GmbH",
      position: "Marketing Manager",
      type: "Kunde",
      tags: ["Webdesign", "Marketing"]
    },
    {
      id: 2,
      name: "Thomas Videograf",
      email: "thomas@videoworks.de",
      phone: "+49 987 654321",
      company: null,
      position: "Videograf",
      type: "Dienstleister",
      tags: ["Video", "Produktion"]
    },
    {
      id: 3,
      name: "Sarah Weber",
      email: "sarah@designplus.de",
      phone: "+49 555 123456",
      company: "Design Studio Plus",
      position: "Creative Director",
      type: "Kunde",
      tags: ["Design", "Branding"]
    },
    {
      id: 4,
      name: "Michael Fotograf",
      email: "info@michaelfoto.de",
      phone: "+49 666 789012",
      company: null,
      position: "Fotograf",
      type: "Dienstleister",
      tags: ["Fotografie", "Events"]
    },
    {
      id: 5,
      name: "Lisa Müller",
      email: "lisa.mueller@retail.ag",
      phone: "+49 777 345678",
      company: "Retail Solutions AG",
      position: "Geschäftsführerin",
      type: "Kunde",
      tags: ["E-Commerce", "Strategie"]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Alle");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

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

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setIsContactDialogOpen(true);
  };

  const handleContactSave = (updatedContact) => {
    setContacts(contacts.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    ));
    setSelectedContact(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Kontakte</h2>
          <p className="text-gray-600">Verwalten Sie alle Ihre Kontakte und Dienstleister</p>
        </div>
        <Dialog>
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
                <Input id="name" placeholder="Vor- und Nachname" />
              </div>
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" placeholder="email@beispiel.de" />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" placeholder="+49 123 456789" />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="z.B. Marketing Manager" />
              </div>
              <div>
                <Label htmlFor="company">Unternehmen (optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Unternehmen auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Unternehmen</SelectItem>
                    <SelectItem value="TechCorp GmbH">TechCorp GmbH</SelectItem>
                    <SelectItem value="Design Studio Plus">Design Studio Plus</SelectItem>
                    <SelectItem value="Retail Solutions AG">Retail Solutions AG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Typ</Label>
                <Select>
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
              <Button variant="outline">Abbrechen</Button>
              <Button>Kontakt hinzufügen</Button>
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
        onSave={handleContactSave}
      />
    </div>
  );
};

export default ContactsManager;
