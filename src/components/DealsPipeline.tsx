import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, Calendar, User, Building, Target, Edit, Trash2 } from 'lucide-react';
import { getEmployeeNames } from "../data/employees";
import { Deal, DealPhase, getDealsByPhase, getDealsByEmployee, getTotalDealValue, deals } from "../data/deals";

type DealStatus = "Aktiv" | "In Kooperation" | "Erfolgreich abgeschlossen - Einmalig" | "Gekündigt";

interface NewDealForm {
  title: string;
  customer: string;
  value: number;
  probability: number;
  phase: DealPhase;
  assignedTo: string;
  salesperson: string | null;
  commissionPercentage: number;
  closeDate: string;
  status: DealStatus;
  expirationDate: string | null;
  description: string;
}

const initialNewDeal: NewDealForm = {
  title: "",
  customer: "",
  value: 0,
  probability: 0,
  phase: "Ersttermin",
  assignedTo: "",
  salesperson: null,
  commissionPercentage: 0,
  closeDate: "",
  status: "Aktiv",
  expirationDate: null,
  description: ""
};

const phases: DealPhase[] = ["Ersttermin", "Angebot versendet", "Verhandlung", "Abgeschlossen"];
const statuses: DealStatus[] = ["Aktiv", "In Kooperation", "Erfolgreich abgeschlossen - Einmalig", "Gekündigt"];
const employees = getEmployeeNames();

const DealsPipeline = () => {
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [newDeal, setNewDeal] = useState<NewDealForm>(initialNewDeal);

  const handleAddDeal = () => {
    const deal: Deal = {
      id: Date.now(),
      title: newDeal.title,
      customer: newDeal.customer,
      value: parseInt(newDeal.value) || 0,
      probability: parseInt(newDeal.probability) || 0,
      phase: newDeal.phase,
      assignedTo: newDeal.assignedTo,
      salesperson: newDeal.salesperson || null,
      commissionPercentage: parseInt(newDeal.commissionPercentage) || 0,
      closeDate: newDeal.closeDate,
      status: newDeal.status,
      expirationDate: newDeal.expirationDate || null,
      description: newDeal.description,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    deals.push(deal);
    setNewDeal(initialNewDeal);
    setIsNewDealOpen(false);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
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

  const getTotalValueByPhase = (phase: DealPhase) => {
    return getDealsByPhase(phase).reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateCommission = (value: number, percentage: number) => {
    return (value * percentage) / 100;
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
    const commissionPercentage = parseInt(e.target.value) || 0;
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
                <Input 
                  id="customer" 
                  placeholder="Firmenname"
                  value={newDeal.customer}
                  onChange={(e) => setNewDeal({...newDeal, customer: e.target.value})}
                />
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
                  value={newDeal.salesperson} 
                  onValueChange={(value) => setNewDeal({...newDeal, salesperson: value})}
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
                  value={newDeal.expirationDate}
                  onChange={(e) => setNewDeal({...newDeal, expirationDate: e.target.value})}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {phases.map((phase) => {
          const phaseDeals = getDealsByPhase(phase);
          
          return (
            <div key={phase} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{phase}</h3>
                <Badge variant="secondary">{phaseDeals.length}</Badge>
              </div>
              
              <div className="space-y-3">
                {phaseDeals.map((deal) => (
                  <Card 
                    key={deal.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDealClick(deal)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{deal.title}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            <span className="text-blue-600 hover:underline cursor-pointer">
                              {deal.customer}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Wert:
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(deal.value)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span>Zuständig:</span>
                          <span className="font-medium">{deal.assignedTo}</span>
                        </div>

                        {deal.salesperson && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span>Vertrieb:</span>
                              <span className="font-medium text-purple-600">{deal.salesperson}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Provision:</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(calculateCommission(deal.value, deal.commissionPercentage))} ({deal.commissionPercentage}%)
                              </span>
                            </div>
                          </>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Abschluss:
                          </span>
                          <span>{deal.closeDate}</span>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-xs text-gray-500 line-clamp-2">{deal.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Details Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {selectedDeal?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Deal Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Wert:</span> {formatCurrency(selectedDeal.value)}</div>
                    <div><span className="font-medium">Phase:</span> 
                      <Badge className={`ml-2 ${getPhaseColor(selectedDeal.phase)} text-white`}>
                        {selectedDeal.phase}
                      </Badge>
                    </div>
                    <div><span className="font-medium">Zuständig:</span> {selectedDeal.assignedTo}</div>
                    {selectedDeal.salesperson && (
                      <div><span className="font-medium">Vertrieb:</span> {selectedDeal.salesperson}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Kunde</h4>
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">{selectedDeal.customer}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealsPipeline;
