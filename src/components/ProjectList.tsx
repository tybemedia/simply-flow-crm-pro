import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Eye, Users, Target, DollarSign, Calendar, ChevronUp, ChevronDown, Save, X, Mail, Phone } from 'lucide-react';
import { getEmployeeNames } from '../data/employees';
import { Contact } from '../../server/api/contacts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface Company {
    id: number;
    name: string;
    industry: string;
    status: string;
    address: string;
    notes: string;
    assignedTo: string;
    description: string;
    contacts: number[];
    deals: number[];
}

interface Deal {
    id: number;
    title: string;
    value: number;
    phase: string;
    companyId: number;
    companyName: string;
    salesperson: string;
    expirationDate: string;
    notes?: string;
    updatedAt: string;
    probability: number;
    assignedTo: string;
    closeDate: string;
    description: string;
    commissionPercentage: number;
    status: string;
}

type DealPhase = 'Lead' | 'Verhandlung' | 'Abschluss' | 'Abgeschlossen' | 'Verloren';

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
    notes: "",
    assignedTo: "",
    description: "",
    contacts: [],
    deals: []
  });

  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);

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

  useEffect(() => {
    const fetchAllDealsAndContacts = async () => {
        try {
            const [dealsResponse, contactsResponse] = await Promise.all([
                fetch('/api/deals'),
                fetch('/api/contacts')
            ]);
            const deals = await dealsResponse.json();
            const contacts = await contactsResponse.json();
            setAllDeals(deals);
            setAllContacts(contacts);
        } catch (error) {
            console.error('Error fetching deals and contacts:', error);
        }
    };

    fetchAllDealsAndContacts();
  }, []);

  const fetchProjectDetails = useCallback(async (projectId: number) => {
    // Fetch Deals
    try {
        const response = await fetch('/api/deals?companyId=' + projectId);
        if(!response.ok) throw new Error('Failed to fetch deals');
        const dealsData = await response.json();
        setProjectDeals(dealsData);
    } catch(error) {
        console.error(error);
    }
    // Fetch Contacts
     try {
        const response = await fetch('/api/contacts?companyId=' + projectId);
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
      setNewProject({ name: "", industry: "", status: "Lead", address: "", notes: "", assignedTo: "", description: "", contacts: [], deals: [] });
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
        const response = await fetch('/api/companies/' + editedProject.id, {
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
              <DialogTitle>Neues Projekt erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie ein neues Projekt und fügen Sie Details wie Branche, Status und zugewiesene Mitarbeiter hinzu.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Projektname</Label>
                        <Input
                            id="name"
                            value={newProject.name}
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="industry">Branche</Label>
                        <Input
                            id="industry"
                            value={newProject.industry}
                            onChange={(e) => setNewProject({ ...newProject, industry: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="assignedTo">Zugewiesen an</Label>
                    <Select
                        value={newProject.assignedTo}
                        onValueChange={(value) => setNewProject({ ...newProject, assignedTo: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Mitarbeiter auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((employee) => (
                                <SelectItem key={employee} value={employee}>
                                    {employee}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Projektbeschreibung</Label>
                    <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        rows={3}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                        id="address"
                        value={newProject.address}
                        onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Notizen</Label>
                    <Textarea
                        id="notes"
                        value={newProject.notes}
                        onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                        rows={3}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Deals</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                        {allDeals.map((deal) => (
                            <div key={deal.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`deal-${deal.id}`}
                                    checked={newProject.deals.includes(deal.id)}
                                    onCheckedChange={(checked) => {
                                        const updatedDeals = checked
                                            ? [...newProject.deals, deal.id]
                                            : newProject.deals.filter(id => id !== deal.id);
                                        setNewProject({ ...newProject, deals: updatedDeals });
                                    }}
                                />
                                <Label htmlFor={`deal-${deal.id}`} className="text-sm">
                                    {deal.title} ({deal.value}€)
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Kontakte</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                        {allContacts.map((contact) => (
                            <div key={contact.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`contact-${contact.id}`}
                                    checked={newProject.contacts.includes(contact.id)}
                                    onCheckedChange={(checked) => {
                                        const updatedContacts = checked
                                            ? [...newProject.contacts, contact.id]
                                            : newProject.contacts.filter(id => id !== contact.id);
                                        setNewProject({ ...newProject, contacts: updatedContacts });
                                    }}
                                />
                                <Label htmlFor={`contact-${contact.id}`} className="text-sm">
                                    {contact.name} ({contact.type})
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={newProject.status}
                        onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                    >
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
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>
                    Abbrechen
                </Button>
                <Button onClick={handleCreateProject}>Speichern</Button>
            </DialogFooter>
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
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.industry}</p>
                </div>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>
              
              {project.assignedTo && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Zugewiesen an: {project.assignedTo}</span>
                </div>
              )}
              
              {project.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>{projectDeals.filter(deal => deal.companyId === project.id).length} Deals</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{projectContacts.filter(contact => contact.companyId === project.id).length} Kontakte</span>
              </div>
            </CardContent>
            
            <div className="border-t p-4 flex justify-between items-center bg-gray-50">
              {editingProjectId === project.id && editedProject ? (
                <div className="space-y-4 p-4 border rounded-lg bg-white">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`edit-name-${project.id}`}>Projektname</Label>
                            <Input
                                id={`edit-name-${project.id}`}
                                value={editedProject.name}
                                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`edit-industry-${project.id}`}>Branche</Label>
                            <Input
                                id={`edit-industry-${project.id}`}
                                value={editedProject.industry}
                                onChange={(e) => setEditedProject({ ...editedProject, industry: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`edit-assignedTo-${project.id}`}>Zugewiesen an</Label>
                        <Select
                            value={editedProject.assignedTo}
                            onValueChange={(value) => setEditedProject({ ...editedProject, assignedTo: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Mitarbeiter auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee} value={employee}>
                                        {employee}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`edit-description-${project.id}`}>Projektbeschreibung</Label>
                        <Textarea
                            id={`edit-description-${project.id}`}
                            value={editedProject.description}
                            onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`edit-address-${project.id}`}>Adresse</Label>
                        <Input
                            id={`edit-address-${project.id}`}
                            value={editedProject.address}
                            onChange={(e) => setEditedProject({ ...editedProject, address: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`edit-notes-${project.id}`}>Notizen</Label>
                        <Textarea
                            id={`edit-notes-${project.id}`}
                            value={editedProject.notes}
                            onChange={(e) => setEditedProject({ ...editedProject, notes: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Deals</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                            {allDeals.map((deal) => (
                                <div key={deal.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`edit-deal-${project.id}-${deal.id}`}
                                        checked={editedProject.deals.includes(deal.id)}
                                        onCheckedChange={(checked) => {
                                            const updatedDeals = checked
                                                ? [...editedProject.deals, deal.id]
                                                : editedProject.deals.filter(id => id !== deal.id);
                                            setEditedProject({ ...editedProject, deals: updatedDeals });
                                        }}
                                    />
                                    <Label htmlFor={`edit-deal-${project.id}-${deal.id}`} className="text-sm">
                                        {deal.title} ({deal.value}€)
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Kontakte</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                            {allContacts.map((contact) => (
                                <div key={contact.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`edit-contact-${project.id}-${contact.id}`}
                                        checked={editedProject.contacts.includes(contact.id)}
                                        onCheckedChange={(checked) => {
                                            const updatedContacts = checked
                                                ? [...editedProject.contacts, contact.id]
                                                : editedProject.contacts.filter(id => id !== contact.id);
                                            setEditedProject({ ...editedProject, contacts: updatedContacts });
                                        }}
                                    />
                                    <Label htmlFor={`edit-contact-${project.id}-${contact.id}`} className="text-sm">
                                        {contact.name} ({contact.type})
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`edit-status-${project.id}`}>Status</Label>
                        <Select
                            value={editedProject.status}
                            onValueChange={(value) => setEditedProject({ ...editedProject, status: value })}
                        >
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
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setEditingProjectId(null)}>
                            Abbrechen
                        </Button>
                        <Button onClick={() => handleSaveEdit()}>Speichern</Button>
                    </div>
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
                className="bg-blue-600 hover:bg-blue-700"
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
                      <div className="flex justify-between items-start">
                          <div>
                              <DialogTitle className="text-2xl font-bold">{selectedProject.name}</DialogTitle>
                              <DialogDescription className="text-base mt-2">
                                  {selectedProject.industry} • {selectedProject.address}
                              </DialogDescription>
                          </div>
                          <Badge className={`${getStatusColor(selectedProject.status)} text-white text-sm px-3 py-1`}>
                              {selectedProject.status}
                          </Badge>
                      </div>
                      {selectedProject.assignedTo && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>Zugewiesen an: {selectedProject.assignedTo}</span>
                          </div>
                      )}
                  </DialogHeader>
                  
                  <Tabs defaultValue="overview" className="pt-4">
                      <TabsList className="grid grid-cols-4 mb-4">
                          <TabsTrigger value="overview">Übersicht</TabsTrigger>
                          <TabsTrigger value="deals">Deals ({projectDeals.length})</TabsTrigger>
                          <TabsTrigger value="contacts">Kontakte ({projectContacts.length})</TabsTrigger>
                          <TabsTrigger value="notes">Notizen</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-4">
                          {selectedProject.description && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                  <h3 className="font-semibold mb-2">Projektbeschreibung</h3>
                                  <p className="text-gray-600 whitespace-pre-wrap">{selectedProject.description}</p>
                              </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                          <Target className="w-5 h-5" />
                                          Deals Übersicht
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="space-y-2">
                                          <div className="flex justify-between">
                                              <span className="text-gray-600">Anzahl Deals:</span>
                                              <span className="font-semibold">{projectDeals.length}</span>
                                          </div>
                                          <div className="flex justify-between">
                                              <span className="text-gray-600">Gesamtwert:</span>
                                              <span className="font-semibold text-green-600">
                                                  {formatCurrency(projectDeals.reduce((acc, deal) => acc + deal.value, 0))}
                                              </span>
                                          </div>
                                      </div>
                                  </CardContent>
                              </Card>
                              
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                          <Users className="w-5 h-5" />
                                          Kontakte Übersicht
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="space-y-2">
                                          <div className="flex justify-between">
                                              <span className="text-gray-600">Anzahl Kontakte:</span>
                                              <span className="font-semibold">{projectContacts.length}</span>
                                          </div>
                                          <div className="flex justify-between">
                                              <span className="text-gray-600">Primäre Kontakte:</span>
                                              <span className="font-semibold">
                                                  {projectContacts.filter(c => c.type === 'Primary').length}
                                              </span>
                                          </div>
                                      </div>
                                  </CardContent>
                              </Card>
                          </div>
                      </TabsContent>
                      
                      <TabsContent value="deals">
                          <div className="flex justify-end mb-4">
                              <Button size="sm" onClick={() => handleOpenNewDeal(selectedProject.id)}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Neuer Deal
                              </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[50vh] overflow-y-auto p-1">
                              {projectDeals.map((deal) => (
                                  <Card key={deal.id} className="hover:shadow-md transition-shadow">
                                      <CardHeader>
                                          <div className="flex justify-between items-start">
                                              <CardTitle className="text-lg">{deal.title}</CardTitle>
                                              <Badge className={`${getPhaseColor(deal.phase)} text-white`}>
                                                  {deal.phase}
                                              </Badge>
                                          </div>
                                      </CardHeader>
                                      <CardContent>
                                          <div className="space-y-2">
                                              <div className="flex justify-between items-center">
                                                  <span className="text-gray-600">Wert:</span>
                                                  <span className="text-lg font-bold text-green-600">
                                                      {formatCurrency(deal.value)}
                                                  </span>
                                              </div>
                                              {deal.assignedTo && (
                                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                                      <Users className="w-4 h-4" />
                                                      <span>{deal.assignedTo}</span>
                                                  </div>
                                              )}
                                              {deal.closeDate && (
                                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                                      <Calendar className="w-4 h-4" />
                                                      <span>Abschluss: {new Date(deal.closeDate).toLocaleDateString()}</span>
                                                  </div>
                                              )}
                                          </div>
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
                                  <Card key={contact.id} className="hover:shadow-md transition-shadow">
                                      <CardContent className="p-4">
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <h3 className="font-semibold text-lg">{contact.name}</h3>
                                                  <p className="text-sm text-gray-500">{contact.position}</p>
                                                  <div className="mt-2 space-y-1">
                                                      <p className="text-sm text-gray-600 flex items-center gap-2">
                                                          <Mail className="w-4 h-4" />
                                                          {contact.email}
                                                      </p>
                                                      <p className="text-sm text-gray-600 flex items-center gap-2">
                                                          <Phone className="w-4 h-4" />
                                                          {contact.phone}
                                                      </p>
                                                  </div>
                                              </div>
                                              <Badge variant="outline">{contact.type}</Badge>
                                          </div>
                                      </CardContent>
                                  </Card>
                              ))}
                          </div>
                      </TabsContent>
                      
                      <TabsContent value="notes">
                          <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-600 whitespace-pre-wrap">{selectedProject.notes}</p>
                          </div>
                      </TabsContent>
                  </Tabs>
              </DialogContent>
          </Dialog>
      )}
      
      <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Neuen Deal für {selectedProject?.name} erstellen</DialogTitle>
                <DialogDescription>
                    Erstellen Sie einen neuen Deal und fügen Sie Details wie Wert, Phase und Zuständigkeit hinzu.
                </DialogDescription>
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
                <DialogDescription>
                    Erstellen Sie einen neuen Kontakt und fügen Sie Kontaktdaten wie Name, Position und Kontaktinformationen hinzu.
                </DialogDescription>
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
