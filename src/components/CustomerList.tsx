
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Mail, Phone, Building, MapPin, Edit, Eye, Users } from 'lucide-react';

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = [
    {
      id: 1,
      company: "TechCorp GmbH",
      industry: "IT-Services",
      status: "Aktiv",
      contacts: [
        { name: "Max Mustermann", role: "CEO", email: "max@techcorp.de", phone: "+49 123 456789" },
        { name: "Anna Schmidt", role: "Marketing", email: "anna@techcorp.de", phone: "+49 123 456790" }
      ],
      address: "Musterstraße 123, 12345 Berlin",
      deals: 3,
      totalValue: "€89,400",
      lastContact: "2024-01-15",
      notes: "Wichtiger Kunde mit hohem Potenzial für weitere Projekte"
    },
    {
      id: 2,
      company: "Design Studio Plus",
      industry: "Design",
      status: "Lead",
      contacts: [
        { name: "Sarah Weber", role: "Geschäftsführerin", email: "sarah@designplus.de", phone: "+49 987 654321" }
      ],
      address: "Kreativstraße 45, 80331 München",
      deals: 1,
      totalValue: "€25,000",
      lastContact: "2024-01-12",
      notes: "Interessiert an Webdesign-Paket"
    },
    {
      id: 3,
      company: "Retail Solutions AG",
      industry: "Einzelhandel",
      status: "Aktiv",
      contacts: [
        { name: "Thomas Müller", role: "IT-Leiter", email: "thomas@retail.de", phone: "+49 555 123456" },
        { name: "Lisa Klein", role: "Projektmanagerin", email: "lisa@retail.de", phone: "+49 555 123457" }
      ],
      address: "Handelsplatz 1, 60313 Frankfurt",
      deals: 2,
      totalValue: "€156,300",
      lastContact: "2024-01-18",
      notes: "Großkunde mit mehreren laufenden Projekten"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktiv': return 'bg-green-500';
      case 'Lead': return 'bg-yellow-500';
      case 'Inaktiv': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Kunden</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Kunden und Kontakte</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neuer Kunde
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen Kunden hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Unternehmen</Label>
                <Input id="company" placeholder="Firmenname" />
              </div>
              <div>
                <Label htmlFor="industry">Branche</Label>
                <Input id="industry" placeholder="z.B. IT-Services" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="Straße, PLZ Ort" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea id="notes" placeholder="Zusätzliche Informationen..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">Abbrechen</Button>
              <Button>Kunde hinzufügen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Kunden suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{customer.company}</CardTitle>
                  <p className="text-sm text-gray-600">{customer.industry}</p>
                </div>
                <Badge className={`${getStatusColor(customer.status)} text-white`}>
                  {customer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{customer.address}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kontakte:</span>
                  <span className="font-medium">{customer.contacts.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Deals:</span>
                  <span className="font-medium">{customer.deals}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Gesamtwert:</span>
                  <span className="font-semibold text-green-600">{customer.totalValue}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm text-gray-600 mb-2">Hauptkontakt:</div>
                <div className="space-y-1">
                  <div className="font-medium">{customer.contacts[0].name}</div>
                  <div className="text-sm text-gray-600">{customer.contacts[0].role}</div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-3 h-3" />
                    <span>{customer.contacts[0].email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-3 h-3" />
                    <span>{customer.contacts[0].phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        {customer.company}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedCustomer && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Firmeninformationen</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">Branche:</span> {customer.industry}</div>
                              <div><span className="font-medium">Status:</span> 
                                <Badge className={`ml-2 ${getStatusColor(customer.status)} text-white`}>
                                  {customer.status}
                                </Badge>
                              </div>
                              <div><span className="font-medium">Adresse:</span> {customer.address}</div>
                              <div><span className="font-medium">Letzter Kontakt:</span> {customer.lastContact}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Business Übersicht</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">Aktive Deals:</span> {customer.deals}</div>
                              <div><span className="font-medium">Gesamtwert:</span> 
                                <span className="ml-2 font-semibold text-green-600">{customer.totalValue}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Kontakte ({customer.contacts.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {customer.contacts.map((contact, index) => (
                              <Card key={index} className="p-4">
                                <div className="space-y-2">
                                  <div className="font-medium">{contact.name}</div>
                                  <div className="text-sm text-gray-600">{contact.role}</div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Mail className="w-3 h-3" />
                                    <span>{contact.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Phone className="w-3 h-3" />
                                    <span>{contact.phone}</span>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Notizen</h4>
                          <div className="bg-gray-50 p-4 rounded-lg text-sm">
                            {customer.notes}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Bearbeiten
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;
