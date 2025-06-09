import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Eye, Users, Target, DollarSign, Calendar, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import { getEmployeeNames } from '../data/employees';
import { Deal, DealPhase } from '../../server/api/deals';
import { Contact } from '../../server/api/contacts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Company {
    id: number;
    name: string;
    industry: string;
    status: string;
    address: string;
    notes: string;
}

type NewDealForm = Omit<Deal, 'id' | 'updatedAt' | 'companyName'>;

const initialNewDeal: NewDealForm = {
  title: "",
  companyId: 0,
  value: 0,
  probability: 0,
  phase: "Ersttermin",
  assignedTo: "",
  salesperson: "",
  commissionPercentage: 0,
  closeDate: "",
  status: "Aktiv",
  expirationDate: "",
  description: ""
};

type NewContactForm = Omit<Contact, 'id' | 'companyName'>;
const initialNewContact: NewContactForm = {
    name: '',
    email: '',
    phone: '',
    companyId: 0,
    position: '',
    type: 'Primary',
    description: '',
    tags: []
};

const ProjectList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Company[]>([]);
  const [selectedProject, setSelectedProject] = useState<Company | null>(null);
  const [projectDeals, setProjectDeals] = useState<Deal[]>([]);
  const [projectContacts, setProjectContacts] = useState<Contact[]>([]);

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [employees, setEmployees] = useState<string[]>([]);
  
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editedProject, setEditedProject] = useState<Company | null>(null);

  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [newDeal, setNewDeal] = useState<NewDealForm>(initialNewDeal);

  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [newContact, setNewContact] = useState<NewContactForm>(initialNewContact);

  const [newProject, setNewProject] = useState({
    name: "",
    industry: "",
    status: "Lead",
    address: "",
    notes: ""
  });

  const fetchCompanies = async () => {
    try {
        const response = await fetch('/api/companies');
        if(!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        setProjects(data);
    } catch(error) {
        console.error(error);
    }
  };

  useEffect(() => {
    const fetchEmployeeNames = async () => {
      const names = await getEmployeeNames();
      setEmployees(names);
    };
    
    fetchEmployeeNames();
    fetchCompanies();
  }, []);

  const fetchProjectDetails = useCallback(async (projectId: number) => {
    // Fetch Deals
    try {
        const response = await fetch(`/api/deals?companyId=${projectId}`);
        if(!response.ok) throw new Error('Failed to fetch deals');
        const dealsData = await response.json();
        setProjectDeals(dealsData);
    } catch(error) {
        console.error(error);
    }
    // Fetch Contacts
     try {
        const response = await fetch(`/api/contacts?companyId=${projectId}`);
        if(!response.ok) throw new Error('Failed to fetch contacts');
        const contactsData = await response.json();
        setProjectContacts(contactsData);
    } catch(error) {
        console.error(error);
    }
  }, []);

  useEffect(() => {
    if (selectedProject) {
        fetchProjectDetails(selectedProject.id);
    }
  }, [selectedProject, fetchProjectDetails]);

  const handleCreateProject = async () => {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (!response.ok) throw new Error('Failed to create project.');
      await fetchCompanies();
      setIsNewProjectOpen(false);
      setNewProject({ name: "", industry: "", status: "Lead", address: "", notes: "" });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleEditClick = (project: Company) => {
    setEditingProjectId(project.id);
    setEditedProject(project);
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditedProject(null);
  };

  const handleSaveEdit = async () => {
    if (!editedProject) return;
    try {
        const response = await fetch(`/api/companies/${editedProject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editedProject),
        });
        if (!response.ok) throw new Error('Failed to update project.');
        await fetchCompanies();
        setEditingProjectId(null);
        setEditedProject(null);
    } catch (error) {
        console.error("Error updating project:", error);
    }
  };

  const handleOpenNewDeal = (projectId: number) => {
    setNewDeal({ ...initialNewDeal, companyId: projectId });
    setIsNewDealOpen(true);
  };

  const handleCreateDeal = async () => {
    const dealToCreate = {
      ...newDeal,
      salesperson: newDeal.salesperson || null,
      expirationDate: newDeal.expirationDate || null,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealToCreate),
      });

      if (!response.ok) throw new Error('Failed to create deal');
      
      // Refresh details for the currently selected project
      if (selectedProject) {
          fetchProjectDetails(selectedProject.id);
      }
      setIsNewDealOpen(false);
    } catch (error) {
      console.error("Error creating deal:", error);
    }
  };

  const handleOpenNewContact = (projectId: number) => {
    setNewContact({ ...initialNewContact, companyId: projectId });
    setIsNewContactOpen(true);
  };

  const handleCreateContact = async () => {
    try {
        const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContact),
        });
        if (!response.ok) throw new Error('Failed to create contact');
        if (selectedProject) {
            fetchProjectDetails(selectedProject.id);
        }
        setIsNewContactOpen(false);
    } catch (error) {
        console.error("Error creating contact:", error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.industry.toLowerCase().includes(searchTerm.toLowerCase())
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
      case "Verloren": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Projekte</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Projekte und Kunden</p>
        </div>
        <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neues Projekt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neues Projekt hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="company">Projektname</Label>
                <Input id="company" placeholder="Projektname" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="industry">Branche</Label>
                <Input id="industry" placeholder="z.B. IT-Services" value={newProject.industry} onChange={(e) => setNewProject({...newProject, industry: e.target.value})} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="Straße, PLZ Ort" value={newProject.address} onChange={(e) => setNewProject({...newProject, address: e.target.value})} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea id="notes" placeholder="Zusätzliche Informationen..." value={newProject.notes} onChange={(e) => setNewProject({...newProject, notes: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newProject.status} onValueChange={(value: string) => setNewProject({...newProject, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Aktiv">Aktiv</SelectItem>
                    <SelectItem value="Inaktiv">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>Abbrechen</Button>
              <Button onClick={handleCreateProject}>Projekt hinzufügen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Projekte suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow flex flex-col">
             {editingProjectId === project.id && editedProject ? (
                <CardContent className="p-4 space-y-2 flex-grow">
                     <Input value={editedProject.name} onChange={e => setEditedProject({...editedProject, name: e.target.value})} placeholder="Projektname" className="text-lg font-bold"/>
                     <Input value={editedProject.industry} onChange={e => setEditedProject({...editedProject, industry: e.target.value})} placeholder="Branche"/>
                     <Textarea value={editedProject.notes} onChange={e => setEditedProject({...editedProject, notes: e.target.value})} placeholder="Notizen" />
                      <Select value={editedProject.status} onValueChange={(value: string) => setEditedProject({...editedProject, status: value})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Aktiv">Aktiv</SelectItem>
                            <SelectItem value="Inaktiv">Inaktiv</SelectItem>
                        </SelectContent>
                      </Select>
                </CardContent>
            ) : (
                <>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                            <CardTitle className="text-xl font-bold text-gray-800">{project.name}</CardTitle>
                            <p className="text-sm text-gray-500">{project.industry}</p>
                            </div>
                            <Badge className={`${getStatusColor(project.status)} text-white`}>{project.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Deals:</span>
                            {/* This will be incorrect until details are fetched, but is a good indicator */}
                            <span className="font-medium">{projectDeals.filter(d => d.companyId === project.id).length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Gesamtwert:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(projectDeals.filter(d => d.companyId === project.id).reduce((acc, deal) => acc + deal.value, 0))}</span>
                            </div>
                        </div>
                    </CardContent>
                </>
            )}

            <div className="border-t p-4 flex justify-between items-center">
                {editingProjectId === project.id ? (
                    <div className="flex gap-2">
                        <Button onClick={handleSaveEdit} size="sm"><Save className="w-4 h-4 mr-2" /> Speichern</Button>
                        <Button variant="ghost" onClick={handleCancelEdit} size="sm"><X className="w-4 h-4 mr-2" /> Abbrechen</Button>
                    </div>
                ) : (
                    <Button onClick={() => handleEditClick(project)} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" /> Bearbeiten
                    </Button>
                )}
                 <Button 
                    onClick={() => setSelectedProject(project)} 
                    variant="default"
                    size="sm"
                    >
                    <Eye className="w-4 h-4 mr-2" /> Details
                </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      {selectedProject && (
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
              <DialogContent className="max-w-4xl">
                  <DialogHeader>
                      <DialogTitle>{selectedProject.name}</DialogTitle>
                      <DialogDescription>{selectedProject.address}</DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="deals" className="pt-4">
                      <TabsList>
                          <TabsTrigger value="deals">Deals ({projectDeals.length})</TabsTrigger>
                          <TabsTrigger value="contacts">Kontakte ({projectContacts.length})</TabsTrigger>
                          <TabsTrigger value="notes">Notizen</TabsTrigger>
                      </TabsList>
                      <TabsContent value="deals">
                          <div className="flex justify-end mb-4">
                                <Button size="sm" onClick={() => handleOpenNewDeal(selectedProject.id)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Neuer Deal
                                </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[50vh] overflow-y-auto p-1">
                            {projectDeals.map((deal) => (
                              <Card key={deal.id}>
                                <CardHeader>
                                  <CardTitle className="text-lg">{deal.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-sm font-semibold p-2 rounded-md ${getPhaseColor(deal.phase)} text-white text-center`}>
                                        {deal.phase}
                                    </div>
                                    <div className="text-lg font-bold mt-2 text-center">{formatCurrency(deal.value)}</div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                      </TabsContent>
                      <TabsContent value="contacts">
                        <div className="flex justify-end mb-4">
                            <Button size="sm" onClick={() => handleOpenNewContact(selectedProject.id)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Neuer Kontakt
                            </Button>
                        </div>
                        <div className="space-y-2 mt-4 max-h-[50vh] overflow-y-auto p-1">
                            {projectContacts.map(contact => (
                                <Card key={contact.id}>
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{contact.name}</p>
                                            <p className="text-sm text-gray-500">{contact.position}</p>
                                        </div>
                                        <div className="text-sm">
                                            <p>{contact.email}</p>
                                            <p>{contact.phone}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="notes">
                        <p className="text-gray-600 p-4">{selectedProject.notes}</p>
                      </TabsContent>
                  </Tabs>
              </DialogContent>
          </Dialog>
      )}
      
      <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Neuen Deal für {selectedProject?.name} erstellen</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                    <Label>Titel</Label>
                    <Input value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} />
                </div>
                 <div>
                    <Label>Wert (€)</Label>
                    <Input type="number" value={newDeal.value} onChange={e => setNewDeal({...newDeal, value: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                    <Label>Phase</Label>
                    <Select value={newDeal.phase} onValueChange={(v: DealPhase) => setNewDeal({...newDeal, phase: v})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Ersttermin">Ersttermin</SelectItem>
                            <SelectItem value="Angebot versendet">Angebot versendet</SelectItem>
                            <SelectItem value="Verhandlung">Verhandlung</SelectItem>
                            <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
                            <SelectItem value="Verloren">Verloren</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Zuständig</Label>
                    <Select value={newDeal.assignedTo} onValueChange={v => setNewDeal({...newDeal, assignedTo: v})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {employees.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="col-span-2">
                    <Label>Beschreibung</Label>
                    <Textarea value={newDeal.description} onChange={e => setNewDeal({...newDeal, description: e.target.value})} />
                </div>
                <div>
                    <Label>Abschlussdatum</Label>
                    <Input type="date" value={newDeal.closeDate} onChange={e => setNewDeal({...newDeal, closeDate: e.target.value})} />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewDealOpen(false)}>Abbrechen</Button>
                <Button onClick={handleCreateDeal}>Deal Erstellen</Button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Neuen Kontakt für {selectedProject?.name} erstellen</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                    <Label>Name</Label>
                    <Input value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
                </div>
                <div>
                    <Label>Position</Label>
                    <Input value={newContact.position} onChange={e => setNewContact({...newContact, position: e.target.value})} />
                </div>
                 <div>
                    <Label>Email</Label>
                    <Input type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
                </div>
                 <div>
                    <Label>Telefon</Label>
                    <Input value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
                </div>
            </div>
             <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewContactOpen(false)}>Abbrechen</Button>
                <Button onClick={handleCreateContact}>Kontakt Erstellen</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectList;
