import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, Calendar, User, Building, Target, Edit, Trash2 } from 'lucide-react';
import { getEmployeeNames } from "../data/employees";
import { Deal, DealPhase } from "../../server/api/deals";
import { Company } from "../../server/api/companies";

type DealStatus = "Aktiv" | "In Kooperation" | "Erfolgreich abgeschlossen - Einmalig" | "Gekündigt";

type NewDealForm = Omit<Deal, 'id' | 'updatedAt' | 'companyName'>;

const initialNewDeal: NewDealForm = {
  title: "",
  companyId: 0,
  value: 0,
  probability: 0,
  phase: "Ersttermin",
  assignedTo: "",
  salesperson: null,
  commissionPercentage: 0,
  closeDate: new Date().toISOString().split('T')[0],
  status: "Aktiv",
  expirationDate: null,
  description: ""
};

const phases: DealPhase[] = ["Ersttermin", "Angebot versendet", "Verhandlung", "Abgeschlossen", "Verloren"];
const statuses: DealStatus[] = ["Aktiv", "In Kooperation", "Erfolgreich abgeschlossen - Einmalig", "Gekündigt"];

const DealsPipeline = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [editedDeal, setEditedDeal] = useState<Partial<Deal> | null>(null);
  const [newDeal, setNewDeal] = useState<NewDealForm>(initialNewDeal);
  const [employees, setEmployees] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals');
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      const mappedDeals = data.map((deal: any) => ({
        ...deal,
        commissionPercentage: deal.commission_percentage,
        assignedTo: deal.assigned_to,
        closeDate: deal.close_date,
        updatedAt: deal.updated_at,
        expirationDate: deal.expiration_date,
        companyId: deal.company_id,
        companyName: deal.company_name
      }));
      setDeals(mappedDeals);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchEmployeeNames = async () => {
      const names = await getEmployeeNames();
      setEmployees(names);
    };
    fetchDeals();
    fetchCompanies();
    fetchEmployeeNames();
  }, []);

  const handleAddDeal = async () => {
    const dealToCreate = {
      ...newDeal,
      salesperson: newDeal.salesperson || null,
      expirationDate: newDeal.expirationDate || null,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealToCreate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details?.message || 'Failed to create deal');
      }
      
      await fetchDeals(); // Refresh list
      setNewDeal(initialNewDeal);
      setIsNewDealOpen(false);
    } catch (error) {
      console.error("Error creating deal:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleUpdateDeal = async () => {
    if (!editedDeal || !selectedDeal) return;

    try {
        const response = await fetch(`/api/deals/${selectedDeal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...editedDeal, updatedAt: new Date().toISOString().split('T')[0] }),
        });

        if (!response.ok) throw new Error('Failed to update deal');
        
        await fetchDeals(); // Refresh list
        setSelectedDeal(null);
        setEditedDeal(null);
        setIsEditing(false);
    } catch (error) {
        console.error("Error updating deal:", error);
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Deal löschen möchten?')) {
        try {
            const response = await fetch(`/api/deals/${dealId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete deal');
            await fetchDeals(); // Refresh list
            setSelectedDeal(null);
        } catch (error) {
            console.error("Error deleting deal:", error);
        }
    }
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditedDeal(deal);
    setIsEditing(false);
  };

  const getDealsByPhase = (phase: DealPhase) => {
    return deals.filter(deal => deal.phase === phase);
  }

  const getTotalValueByPhase = (phase: DealPhase) => {
    return getDealsByPhase(phase).reduce((sum, deal) => sum + deal.value, 0);
  };

  const getPhaseColor = (phase: DealPhase) => {
    switch (phase) {
      case "Ersttermin": return "bg-blue-500";
      case "Angebot versendet": return "bg-yellow-500";
      case "Verhandlung": return "bg-orange-500";
      case "Abgeschlossen": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateCommission = (value: number, percentage: number) => {
    if (!value || !percentage) return 0;
    return Math.round((value * percentage) / 100);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setNewDeal({ ...newDeal, value });
  };

  const handleProbabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const probability = parseInt(e.target.value) || 0;
    setNewDeal({ ...newDeal, probability });
  };

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const commissionPercentage = value === '' ? 0 : parseInt(value);
    setNewDeal({ ...newDeal, commissionPercentage });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Deals Pipeline</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Deals und Verhandlungen</p>
        </div>
        <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neuer Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen Deal erstellen</DialogTitle>
              <DialogDescription>
                Füllen Sie die folgenden Felder aus, um einen neuen Deal zu erstellen.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input 
                  id="title" 
                  placeholder="z.B. Webseite Redesign"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="customer">Kunde</Label>
                <Select
                  value={newDeal.companyId?.toString()}
                  onValueChange={(value) => setNewDeal({...newDeal, companyId: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Wert</Label>
                <Input 
                  id="value" 
                  type="number" 
                  placeholder="z.B. 5000"
                  value={newDeal.value}
                  onChange={handleValueChange}
                />
              </div>
              <div>
                <Label htmlFor="probability">Wahrscheinlichkeit (%)</Label>
                <Input 
                  id="probability" 
                  type="number" 
                  placeholder="z.B. 80"
                  value={newDeal.probability}
                  onChange={handleProbabilityChange}
                />
              </div>
              <div>
                <Label htmlFor="phase">Phase</Label>
                <Select 
                  value={newDeal.phase} 
                  onValueChange={(value: DealPhase) => setNewDeal({...newDeal, phase: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Phase auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedTo">Zuständig</Label>
                <Select 
                  value={newDeal.assignedTo} 
                  onValueChange={(value) => setNewDeal({...newDeal, assignedTo: value})}
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
              <div>
                <Label htmlFor="salesperson">Vertrieb</Label>
                <Select 
                  value={newDeal.salesperson || ""} 
                  onValueChange={(value) => setNewDeal({...newDeal, salesperson: value === "none" ? null : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vertriebler auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Vertriebler</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee} value={employee}>
                        {employee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="commissionPercentage">Provision (%)</Label>
                <Input 
                  id="commissionPercentage" 
                  type="number" 
                  placeholder="z.B. 5"
                  value={newDeal.commissionPercentage}
                  onChange={handleCommissionChange}
                  disabled={!newDeal.salesperson}
                />
              </div>
              <div>
                <Label htmlFor="closeDate">Abschlussdatum</Label>
                <Input 
                  id="closeDate" 
                  type="date"
                  value={newDeal.closeDate}
                  onChange={(e) => setNewDeal({...newDeal, closeDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newDeal.status} 
                  onValueChange={(value: DealStatus) => setNewDeal({...newDeal, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expirationDate">Ablaufdatum</Label>
                <Input 
                  id="expirationDate" 
                  type="date"
                  value={newDeal.expirationDate || ""}
                  onChange={(e) => setNewDeal({...newDeal, expirationDate: e.target.value || null})}
                  disabled={newDeal.status !== "In Kooperation"}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea 
                  id="description" 
                  placeholder="Details zum Deal..."
                  value={newDeal.description}
                  onChange={(e) => setNewDeal({...newDeal, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsNewDealOpen(false)}>Abbrechen</Button>
              <Button onClick={handleAddDeal}>Deal erstellen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {phases.map((phase) => (
          <div key={phase} className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">{phase}</h3>
              <Badge variant="secondary">{getDealsByPhase(phase).length}</Badge>
            </div>
            <div className="font-semibold text-gray-700 mb-4">
              {formatCurrency(getTotalValueByPhase(phase))}
            </div>
            <div className="space-y-4">
              {getDealsByPhase(phase).map((deal) => (
                <Card 
                  key={deal.id}
                  className="cursor-pointer hover:shadow-md"
                  onClick={() => handleDealClick(deal)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-md">{deal.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      {deal.companyName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {deal.assignedTo}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">{formatCurrency(deal.value)}</span>
                      <span className={`font-semibold ${getProbabilityColor(deal.probability)}`}>
                        {deal.probability}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedDeal && (
        <Dialog open={!!selectedDeal} onOpenChange={() => {setSelectedDeal(null); setIsEditing(false)}}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                  <Target className="w-6 h-6 mr-2" /> 
                  {isEditing ? 'Deal bearbeiten' : selectedDeal.title}
              </DialogTitle>
              <DialogDescription>
                  Details für den Deal "{selectedDeal.title}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editTitle">Titel</Label>
                    <Input 
                      id="editTitle" 
                      value={editedDeal?.title} 
                      onChange={(e) => setEditedDeal({...editedDeal, title: e.target.value})} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCompany">Kunde</Label>
                    <Select 
                      value={editedDeal?.companyId?.toString()} 
                      onValueChange={(value) => setEditedDeal({...editedDeal, companyId: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kunde auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editValue">Wert</Label>
                    <Input 
                      id="editValue" 
                      type="number" 
                      value={editedDeal?.value} 
                      onChange={(e) => setEditedDeal({...editedDeal, value: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="editProbability">Wahrscheinlichkeit (%)</Label>
                    <Input 
                      id="editProbability" 
                      type="number" 
                      value={editedDeal?.probability} 
                      onChange={(e) => setEditedDeal({...editedDeal, probability: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPhase">Phase</Label>
                    <Select 
                      value={editedDeal?.phase} 
                      onValueChange={(value: DealPhase) => setEditedDeal({...editedDeal, phase: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Phase auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map(p => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editAssignedTo">Zuständig</Label>
                    <Select 
                      value={editedDeal?.assignedTo} 
                      onValueChange={(value) => setEditedDeal({...editedDeal, assignedTo: value})}
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
                  <div>
                    <Label htmlFor="editSalesperson">Vertrieb</Label>
                    <Select 
                      value={editedDeal?.salesperson || ""} 
                      onValueChange={(value) => setEditedDeal({...editedDeal, salesperson: value === "none" ? null : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vertriebler auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Kein Vertriebler</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem key={employee} value={employee}>
                            {employee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editCommissionPercentage">Provision (%)</Label>
                    <Input 
                      id="editCommissionPercentage" 
                      type="number" 
                      value={editedDeal?.commissionPercentage} 
                      onChange={(e) => setEditedDeal({...editedDeal, commissionPercentage: parseInt(e.target.value) || 0})}
                      disabled={!editedDeal?.salesperson}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCloseDate">Abschlussdatum</Label>
                    <Input 
                      id="editCloseDate" 
                      type="date"
                      value={editedDeal?.closeDate}
                      onChange={(e) => setEditedDeal({...editedDeal, closeDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select 
                      value={editedDeal?.status} 
                      onValueChange={(value: DealStatus) => setEditedDeal({...editedDeal, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editExpirationDate">Ablaufdatum</Label>
                    <Input 
                      id="editExpirationDate" 
                      type="date"
                      value={editedDeal?.expirationDate || ""}
                      onChange={(e) => setEditedDeal({...editedDeal, expirationDate: e.target.value || null})}
                      disabled={editedDeal?.status !== "In Kooperation"}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="editDescription">Beschreibung</Label>
                    <Textarea 
                      id="editDescription" 
                      value={editedDeal?.description} 
                      onChange={(e) => setEditedDeal({...editedDeal, description: e.target.value})} 
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                          <span className="font-semibold text-gray-700">Kunde:</span> {selectedDeal.companyName}
                      </p>
                      <Badge className={`${getPhaseColor(selectedDeal.phase)} text-white`}>{selectedDeal.phase}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="font-semibold">Wert:</span> {formatCurrency(selectedDeal.value)}</div>
                    <div><span className="font-semibold">Wahrscheinlichkeit:</span> {selectedDeal.probability}%</div>
                    <div><span className="font-semibold">Zuständig:</span> {selectedDeal.assignedTo}</div>
                    <div><span className="font-semibold">Status:</span> {selectedDeal.status}</div>
                    <div><span className="font-semibold">Abschlussdatum:</span> {selectedDeal.closeDate}</div>
                    {selectedDeal.salesperson && (
                      <>
                          <div><span className="font-semibold">Vertrieb:</span> {selectedDeal.salesperson}</div>
                          <div>
                            <span className="font-semibold">Provision:</span> {
                              (() => {
                                const value = parseFloat(selectedDeal.value.toString());
                                const commission = selectedDeal.commissionPercentage;
                                const commissionAmount = (value * commission) / 100;
                                return formatCurrency(commissionAmount);
                              })()
                            } ({selectedDeal.commissionPercentage}%)
                          </div>
                      </>
                    )}
                  </div>
                  <div>
                      <h4 className="font-semibold mb-1">Beschreibung</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedDeal.description}</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                {!isEditing && (
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteDeal(selectedDeal.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Löschen
                    </Button>
                )}
              </div>
              <div className="flex gap-2">
                  {isEditing ? (
                      <>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                          <Button onClick={handleUpdateDeal}>Speichern</Button>
                      </>
                  ) : (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Bearbeiten
                      </Button>
                  )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DealsPipeline;
