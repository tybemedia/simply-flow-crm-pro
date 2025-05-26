
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Mail, Download, Eye, DollarSign, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

const InvoiceManager = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      number: "2024-001",
      customer: "TechCorp GmbH",
      amount: 45000,
      issueDate: "2024-01-15",
      dueDate: "2024-02-14",
      status: "Gesendet",
      paidDate: null,
      deal: "Webseite Redesign",
      items: [
        { description: "UI/UX Design", quantity: 40, rate: 80, total: 3200 },
        { description: "Frontend Entwicklung", quantity: 60, rate: 75, total: 4500 },
        { description: "Backend Entwicklung", quantity: 80, rate: 85, total: 6800 }
      ]
    },
    {
      id: 2,
      number: "2024-002",
      customer: "Design Studio Plus",
      amount: 25000,
      issueDate: "2024-01-18",
      dueDate: "2024-02-17",
      status: "Bezahlt",
      paidDate: "2024-01-25",
      deal: "Brand Identity",
      items: [
        { description: "Logo Design", quantity: 20, rate: 90, total: 1800 },
        { description: "Brand Guidelines", quantity: 15, rate: 80, total: 1200 },
        { description: "Marketing Materials", quantity: 25, rate: 70, total: 1750 }
      ]
    },
    {
      id: 3,
      number: "2024-003",
      customer: "Retail Solutions AG",
      amount: 89400,
      issueDate: "2024-01-20",
      dueDate: "2024-02-19",
      status: "Überfällig",
      paidDate: null,
      deal: "E-Commerce Platform",
      items: [
        { description: "Platform Entwicklung", quantity: 120, rate: 85, total: 10200 },
        { description: "Payment Integration", quantity: 40, rate: 95, total: 3800 },
        { description: "Testing & QA", quantity: 30, rate: 70, total: 2100 }
      ]
    },
    {
      id: 4,
      number: "2024-004",
      customer: "StartUp XYZ",
      amount: 15600,
      issueDate: "2024-01-22",
      dueDate: "2024-02-21",
      status: "Entwurf",
      paidDate: null,
      deal: "Mobile App MVP",
      items: [
        { description: "App Design", quantity: 30, rate: 75, total: 2250 },
        { description: "App Entwicklung", quantity: 50, rate: 80, total: 4000 },
        { description: "App Store Setup", quantity: 10, rate: 60, total: 600 }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Entwurf": return "bg-gray-500";
      case "Gesendet": return "bg-blue-500";
      case "Bezahlt": return "bg-green-500";
      case "Überfällig": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Bezahlt": return CheckCircle2;
      case "Überfällig": return AlertTriangle;
      default: return FileText;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateTotals = () => {
    const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paid = invoices
      .filter(invoice => invoice.status === "Bezahlt")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const outstanding = invoices
      .filter(invoice => invoice.status !== "Bezahlt" && invoice.status !== "Entwurf")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdue = invoices
      .filter(invoice => invoice.status === "Überfällig")
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    return { total, paid, outstanding, overdue };
  };

  const totals = calculateTotals();

  const updateInvoiceStatus = (invoiceId: number, newStatus: string) => {
    setInvoices(invoices.map(invoice => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          status: newStatus,
          paidDate: newStatus === "Bezahlt" ? new Date().toISOString().split('T')[0] : null
        };
      }
      return invoice;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Rechnungen</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Rechnungen und Zahlungen</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neue Rechnung
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neue Rechnung erstellen</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="deal">Zugehöriger Deal</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Deal auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Webseite Redesign</SelectItem>
                    <SelectItem value="brand">Brand Identity</SelectItem>
                    <SelectItem value="ecom">E-Commerce Platform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="issueDate">Rechnungsdatum</Label>
                <Input id="issueDate" type="date" />
              </div>
              <div>
                <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
                <Input id="dueDate" type="date" />
              </div>
            </div>
            
            {/* Invoice Items */}
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Rechnungspositionen</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600">
                  <div className="col-span-5">Beschreibung</div>
                  <div className="col-span-2">Menge/Std.</div>
                  <div className="col-span-2">Stundensatz</div>
                  <div className="col-span-2">Gesamt</div>
                  <div className="col-span-1">Aktion</div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <Input className="col-span-5" placeholder="Leistungsbeschreibung" />
                  <Input className="col-span-2" type="number" placeholder="0" />
                  <Input className="col-span-2" type="number" placeholder="0.00" />
                  <Input className="col-span-2" placeholder="0.00" disabled />
                  <Button variant="outline" size="sm" className="col-span-1">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline">Abbrechen</Button>
              <Button>Rechnung erstellen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bezahlt</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offen</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.outstanding)}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Überfällig</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.overdue)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.map((invoice) => {
          const StatusIcon = getStatusIcon(invoice.status);
          const isOverdue = invoice.status === "Überfällig";
          
          return (
            <Card key={invoice.id} className={`hover:shadow-lg transition-shadow ${isOverdue ? "border-red-300" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <StatusIcon className={`w-5 h-5 ${isOverdue ? "text-red-600" : "text-gray-600"}`} />
                      <h3 className="font-semibold text-lg text-gray-900">
                        Rechnung #{invoice.number}
                      </h3>
                      <Badge className={`${getStatusColor(invoice.status)} text-white`}>
                        {invoice.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Kunde:</span>
                        <div className="font-medium">{invoice.customer}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Deal:</span>
                        <div className="font-medium">{invoice.deal}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Betrag:</span>
                        <div className="font-semibold text-green-600">{formatCurrency(invoice.amount)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Fällig:</span>
                        <div className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                          {invoice.dueDate}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Erstellt:</span>
                        <span className="ml-1">{invoice.issueDate}</span>
                      </div>
                      {invoice.paidDate && (
                        <div>
                          <span className="text-gray-500">Bezahlt:</span>
                          <span className="ml-1 text-green-600">{invoice.paidDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Invoice Items Preview */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-2 text-sm">Positionen:</h5>
                      <div className="space-y-1 text-sm">
                        {invoice.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.description}</span>
                            <span className="font-medium">{formatCurrency(item.total)}</span>
                          </div>
                        ))}
                        {invoice.items.length > 3 && (
                          <div className="text-gray-500 text-xs">
                            +{invoice.items.length - 3} weitere Positionen
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ansehen
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Rechnung #{invoice.number}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Invoice Header */}
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-2">Rechnungsdetails</h4>
                                <div className="space-y-1 text-sm">
                                  <div><span className="font-medium">Nummer:</span> {invoice.number}</div>
                                  <div><span className="font-medium">Datum:</span> {invoice.issueDate}</div>
                                  <div><span className="font-medium">Fällig:</span> {invoice.dueDate}</div>
                                  <div><span className="font-medium">Status:</span> 
                                    <Badge className={`ml-2 ${getStatusColor(invoice.status)} text-white`}>
                                      {invoice.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Kunde</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="font-medium">{invoice.customer}</div>
                                  <div>Deal: {invoice.deal}</div>
                                </div>
                              </div>
                            </div>

                            {/* Invoice Items */}
                            <div>
                              <h4 className="font-semibold mb-4">Rechnungspositionen</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full border">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="text-left p-3 border">Beschreibung</th>
                                      <th className="text-right p-3 border">Menge</th>
                                      <th className="text-right p-3 border">Stundensatz</th>
                                      <th className="text-right p-3 border">Gesamt</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {invoice.items.map((item, index) => (
                                      <tr key={index}>
                                        <td className="p-3 border">{item.description}</td>
                                        <td className="text-right p-3 border">{item.quantity}</td>
                                        <td className="text-right p-3 border">{formatCurrency(item.rate)}</td>
                                        <td className="text-right p-3 border font-medium">{formatCurrency(item.total)}</td>
                                      </tr>
                                    ))}
                                    <tr className="bg-gray-50">
                                      <td colSpan={3} className="text-right p-3 border font-semibold">Gesamtsumme:</td>
                                      <td className="text-right p-3 border font-bold text-lg">{formatCurrency(invoice.amount)}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-1" />
                        Senden
                      </Button>
                    </div>

                    {/* Status Update Buttons */}
                    <div className="flex space-x-2">
                      {invoice.status === "Entwurf" && (
                        <Button
                          size="sm"
                          onClick={() => updateInvoiceStatus(invoice.id, "Gesendet")}
                          className="text-xs"
                        >
                          Versenden
                        </Button>
                      )}
                      {(invoice.status === "Gesendet" || invoice.status === "Überfällig") && (
                        <Button
                          size="sm"
                          onClick={() => updateInvoiceStatus(invoice.id, "Bezahlt")}
                          className="text-xs bg-green-600 hover:bg-green-700"
                        >
                          Als bezahlt markieren
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default InvoiceManager;
