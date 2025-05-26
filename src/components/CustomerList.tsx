import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Mail, Phone, Building, MapPin, Edit, Eye, Users, Target, DollarSign, Calendar } from 'lucide-react';
import { getEmployeeNames } from '../data/employees';
import { deals, getDealsByCompany, Deal, DealPhase, DealStatus } from '../data/deals';

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isEditingDeal, setIsEditingDeal] = useState(false);
  const [editedDeal, setEditedDeal] = useState<Deal | null>(null);
  const employees = getEmployeeNames();

  const customers = [
    {
      id: 1,
      company: "TechCorp GmbH",
      industry: "IT-Services",
      status: "Aktiv",
      assignedEmployees: ["Timo Beyer", "Joshua Baron"],
      contacts: [
        { name: "Max Mustermann", role: "CEO", email: "max@techcorp.de", phone: "+49 123 456789" },
        { name: "Anna Schmidt", role: "Marketing", email: "anna@techcorp.de", phone: "+49 123 456790" }
      ],
      address: "Musterstraße 123, 12345 Berlin",
      totalValue: "€89,400",
      lastContact: "2024-01-15",
      notes: "Wichtiger Kunde mit hohem Potenzial für weitere Projekte"
    },
    {
      id: 2,
      company: "FashionStore AG",
      industry: "Retail",
      status: "Lead",
      assignedEmployees: ["Salome Grieshammer"],
      contacts: [
        { name: "Thomas Weber", role: "Geschäftsführer", email: "thomas@fashionstore.de", phone: "+49 987 654321" }
      ],
      address: "Kreativstraße 45, 80331 München",
      totalValue: "€25,000",
      lastContact: "2024-01-12",
      notes: "Interessiert an Webdesign-Paket"
    },
    {
      id: 3,
      company: "StartupXYZ",
      industry: "Software",
      status: "Aktiv",
      assignedEmployees: ["Joshua Baron"],
      contacts: [
        { name: "Lisa Müller", role: "Founder", email: "lisa@startupxyz.de", phone: "+49 555 123456" }
      ],
      address: "Handelsplatz 1, 60313 Frankfurt",
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

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "Ersttermin": return "bg-blue-500";
      case "Angebot versendet": return "bg-yellow-500";
      case "Verhandlung": return "bg-orange-500";
      case "Abgeschlossen": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditedDeal(deal);
    setIsEditingDeal(false);
  };

  const handleDealSave = () => {
    if (editedDeal && selectedDeal) {
      // Update the deal in the deals array
      const index = deals.findIndex(d => d.id === selectedDeal.id);
      if (index !== -1) {
        deals[index] = {
          ...editedDeal,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      setSelectedDeal(editedDeal);
      setIsEditingDeal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Kunden</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Kunden und Kontakte</p>
        </div>
        <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
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
              <div>
                <Label htmlFor="assignedTo">Zugewiesen an</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee} value={employee || "unassigned"}>{employee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsNewCustomerOpen(false)}>Abbrechen</Button>
              <Button onClick={() => setIsNewCustomerOpen(false)}>Kunde hinzufügen</Button>
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
                  <span className="font-medium">{getDealsByCompany(customer.company).length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Gesamtwert:</span>
                  <span className="font-semibold text-green-600">{customer.totalValue}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Zuständig:</span>
                  <span className="font-medium">{customer.assignedEmployees.length}</span>
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
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                              <div><span className="font-medium">Aktive Deals:</span> {getDealsByCompany(customer.company).length}</div>
                              <div><span className="font-medium">Gesamtwert:</span> 
                                <span className="ml-2 font-semibold text-green-600">{customer.totalValue}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Zuständige Mitarbeiter ({customer.assignedEmployees.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {customer.assignedEmployees.map((employee, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50">
                                {employee}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Deals
                          </h4>
                          <div className="space-y-3">
                            {getDealsByCompany(customer.company).map((deal) => (
                              <Card 
                                key={deal.id} 
                                className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleDealClick(deal)}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="font-semibold">{deal.title}</h5>
                                        <p className="text-sm text-gray-600">
                                          {formatCurrency(deal.value)}
                                        </p>
                                      </div>
                                      <Badge className={`${getPhaseColor(deal.phase)} text-white`}>
                                        {deal.phase}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span>Zuständig:</span>
                                      <span className="font-medium">{deal.assignedTo}</span>
                                    </div>
                                    {deal.salesperson && (
                                      <div className="flex items-center justify-between text-sm">
                                        <span>Vertrieb:</span>
                                        <span className="font-medium text-purple-600">{deal.salesperson}</span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
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
                                  <div className="font-medium text-blue-600 hover:underline cursor-pointer">{contact.name}</div>
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

      {/* Deal Details Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {selectedDeal?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  variant={isEditingDeal ? "default" : "outline"}
                  onClick={() => setIsEditingDeal(!isEditingDeal)}
                >
                  {isEditingDeal ? "Bearbeitung beenden" : "Bearbeiten"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Deal Details</h4>
                    <div className="space-y-2 text-sm">
                      {isEditingDeal ? (
                        <>
                          <div>
                            <Label htmlFor="dealTitle">Titel</Label>
                            <Input
                              id="dealTitle"
                              value={editedDeal?.title}
                              onChange={(e) => setEditedDeal({...editedDeal!, title: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dealValue">Wert</Label>
                            <Input
                              id="dealValue"
                              type="number"
                              value={editedDeal?.value}
                              onChange={(e) => setEditedDeal({...editedDeal!, value: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dealProbability">Wahrscheinlichkeit (%)</Label>
                            <Input
                              id="dealProbability"
                              type="number"
                              value={editedDeal?.probability}
                              onChange={(e) => setEditedDeal({...editedDeal!, probability: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dealPhase">Phase</Label>
                            <Select
                              value={editedDeal?.phase}
                              onValueChange={(value) => setEditedDeal({...editedDeal!, phase: value as DealPhase})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["Ersttermin", "Angebot versendet", "Verhandlung", "Abgeschlossen"].map((phase) => (
                                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div><span className="font-medium">Titel:</span> {selectedDeal.title}</div>
                          <div><span className="font-medium">Wert:</span> {formatCurrency(selectedDeal.value)}</div>
                          <div><span className="font-medium">Wahrscheinlichkeit:</span> {selectedDeal.probability}%</div>
                          <div><span className="font-medium">Phase:</span> 
                            <Badge className={`ml-2 ${getPhaseColor(selectedDeal.phase)} text-white`}>
                              {selectedDeal.phase}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Zuständigkeiten</h4>
                    <div className="space-y-2 text-sm">
                      {isEditingDeal ? (
                        <>
                          <div>
                            <Label htmlFor="dealAssignedTo">Zuständig</Label>
                            <Select
                              value={editedDeal?.assignedTo}
                              onValueChange={(value) => setEditedDeal({...editedDeal!, assignedTo: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {employees.map((employee) => (
                                  <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="dealSalesperson">Vertrieb</Label>
                            <Select
                              value={editedDeal?.salesperson || "none"}
                              onValueChange={(value) => setEditedDeal({...editedDeal!, salesperson: value === "none" ? null : value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Kein Vertriebler</SelectItem>
                                {employees.map((employee) => (
                                  <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {editedDeal?.salesperson && (
                            <div>
                              <Label htmlFor="dealCommission">Provision (%)</Label>
                              <Input
                                id="dealCommission"
                                type="number"
                                value={editedDeal.commissionPercentage}
                                onChange={(e) => setEditedDeal({...editedDeal!, commissionPercentage: parseInt(e.target.value) || 0})}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div><span className="font-medium">Zuständig:</span> {selectedDeal.assignedTo}</div>
                          {selectedDeal.salesperson && (
                            <>
                              <div><span className="font-medium">Vertrieb:</span> {selectedDeal.salesperson}</div>
                              <div><span className="font-medium">Provision:</span> {selectedDeal.commissionPercentage}%</div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Zeitplan</h4>
                    <div className="space-y-2 text-sm">
                      {isEditingDeal ? (
                        <>
                          <div>
                            <Label htmlFor="dealCloseDate">Abschlussdatum</Label>
                            <Input
                              id="dealCloseDate"
                              type="date"
                              value={editedDeal?.closeDate}
                              onChange={(e) => setEditedDeal({...editedDeal!, closeDate: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dealStatus">Status</Label>
                            <Select
                              value={editedDeal?.status}
                              onValueChange={(value) => setEditedDeal({...editedDeal!, status: value as DealStatus})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["Aktiv", "In Kooperation", "Erfolgreich abgeschlossen - Einmalig", "Gekündigt"].map((status) => (
                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {editedDeal?.status === "In Kooperation" && (
                            <div>
                              <Label htmlFor="dealExpirationDate">Ablaufdatum</Label>
                              <Input
                                id="dealExpirationDate"
                                type="date"
                                value={editedDeal.expirationDate || ""}
                                onChange={(e) => setEditedDeal({...editedDeal!, expirationDate: e.target.value})}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div><span className="font-medium">Abschlussdatum:</span> {selectedDeal.closeDate}</div>
                          <div><span className="font-medium">Status:</span> {selectedDeal.status}</div>
                          {selectedDeal.expirationDate && (
                            <div><span className="font-medium">Ablaufdatum:</span> {selectedDeal.expirationDate}</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Beschreibung</h4>
                    {isEditingDeal ? (
                      <Textarea
                        value={editedDeal?.description}
                        onChange={(e) => setEditedDeal({...editedDeal!, description: e.target.value})}
                        className="min-h-[100px]"
                      />
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">{selectedDeal.description}</div>
                    )}
                  </div>
                </div>
              </div>

              {isEditingDeal && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsEditingDeal(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleDealSave}>
                    Speichern
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerList;
