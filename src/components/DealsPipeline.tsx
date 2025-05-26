import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Calendar, User, Building, Target, Edit, Trash2 } from 'lucide-react';

const DealsPipeline = () => {
  const [deals, setDeals] = useState([
    {
      id: 1,
      title: "Webseite Redesign",
      customer: "TechCorp GmbH",
      value: 45000,
      probability: 80,
      phase: "Angebot versendet",
      assignedTo: "Anna Schmidt",
      salesperson: "Michael König",
      commissionPercentage: 5,
      closeDate: "2024-02-15",
      status: "Aktiv",
      expirationDate: null,
      description: "Komplettes Redesign der Unternehmenswebseite mit moderner Technologie"
    },
    {
      id: 2,
      title: "E-Commerce Platform",
      customer: "Retail Solutions AG",
      value: 89400,
      probability: 90,
      phase: "Verhandlung",
      assignedTo: "Thomas Müller",
      salesperson: "Anna Schmidt",
      commissionPercentage: 8,
      closeDate: "2024-02-28",
      status: "In Kooperation",
      expirationDate: "2025-02-28",
      description: "Entwicklung einer maßgeschneiderten E-Commerce Lösung"
    },
    {
      id: 3,
      title: "Brand Identity",
      customer: "Design Studio Plus",
      value: 25000,
      probability: 60,
      phase: "Ersttermin",
      assignedTo: "Sarah Weber",
      salesperson: null,
      commissionPercentage: 0,
      closeDate: "2024-03-10",
      status: "Aktiv",
      expirationDate: null,
      description: "Entwicklung einer neuen Markenidentität und Logodesign"
    }
  ]);

  const phases = ["Ersttermin", "Angebot versendet", "Verhandlung", "Abgeschlossen"];
  const statuses = ["Aktiv", "In Kooperation", "Erfolgreich abgeschlossen - Einmalig", "Gekündigt"];
  
  const getPhaseColor = (phase: string) => {
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

  const getDealsByPhase = (phase: string) => {
    return deals.filter(deal => deal.phase === phase);
  };

  const getTotalValueByPhase = (phase: string) => {
    return getDealsByPhase(phase).reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const moveDeal = (dealId: number, newPhase: string) => {
    setDeals(deals.map(deal => 
      deal.id === dealId ? { ...deal, phase: newPhase } : deal
    ));
  };

  const calculateCommission = (dealValue, commissionPercentage) => {
    return (dealValue * commissionPercentage) / 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Aktiv": return "bg-blue-500";
      case "In Kooperation": return "bg-green-500";
      case "Erfolgreich abgeschlossen - Einmalig": return "bg-purple-500";
      case "Gekündigt": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Deals Pipeline</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Verkaufschancen</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neuer Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen Deal hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Deal Titel</Label>
                <Input id="title" placeholder="z.B. Webseite Redesign" />
              </div>
              <div>
                <Label htmlFor="customer">Kunde</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="techcorp">TechCorp GmbH</SelectItem>
                    <SelectItem value="design">Design Studio Plus</SelectItem>
                    <SelectItem value="retail">Retail Solutions AG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Deal Wert (€)</Label>
                <Input id="value" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="probability">Wahrscheinlichkeit (%)</Label>
                <Input id="probability" type="number" placeholder="50" />
              </div>
              <div>
                <Label htmlFor="phase">Phase</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Phase auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map(phase => (
                      <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedTo">Zugewiesen an</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anna">Anna Schmidt</SelectItem>
                    <SelectItem value="thomas">Thomas Müller</SelectItem>
                    <SelectItem value="sarah">Sarah Weber</SelectItem>
                    <SelectItem value="michael">Michael König</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="closeDate">Abschlussdatum</Label>
                <Input id="closeDate" type="date" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" placeholder="Deal Beschreibung..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">Abbrechen</Button>
              <Button>Deal hinzufügen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {phases.map((phase) => {
          const phaseDeals = getDealsByPhase(phase);
          const totalValue = getTotalValueByPhase(phase);
          
          return (
            <Card key={phase} className="text-center">
              <CardContent className="p-4">
                <div className={`w-3 h-3 rounded-full ${getPhaseColor(phase)} mx-auto mb-2`}></div>
                <h3 className="font-semibold text-sm">{phase}</h3>
                <div className="text-2xl font-bold text-gray-900">{phaseDeals.length}</div>
                <div className="text-sm text-gray-600">{formatCurrency(totalValue)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Columns */}
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
                  <Card key={deal.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                        
                        <div className="space-y-2">
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
                            <span>Status:</span>
                            <Badge className={`${getStatusColor(deal.status)} text-white text-xs`}>
                              {deal.status}
                            </Badge>
                          </div>

                          {deal.expirationDate && (
                            <div className="flex items-center justify-between text-sm">
                              <span>Läuft aus:</span>
                              <span className="text-orange-600 font-medium">{deal.expirationDate}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Wahrscheinlichkeit:</span>
                            <span className={`font-semibold ${getProbabilityColor(deal.probability)}`}>
                              {deal.probability}%
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Zuständig:
                            </span>
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

                        <div className="flex space-x-1">
                          {phases.filter(p => p !== deal.phase).map((targetPhase) => (
                            <Button
                              key={targetPhase}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-auto"
                              onClick={() => moveDeal(deal.id, targetPhase)}
                            >
                              → {targetPhase}
                            </Button>
                          ))}
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealsPipeline;
