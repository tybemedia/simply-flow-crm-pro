import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, Target, CheckSquare, TrendingUp, Calendar, Clock, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAllEmployeePerformances, EmployeePerformance } from '../data/employees';
import { getPipelineStats } from '../data/deals';
import { tasks, getCurrentMonthTrackedHours, getTasksByEmployee } from '../data/tasks';
import TimeTrackingPopup from './TimeTrackingPopup';
import { Deal as ServerDeal } from '../../server/api/deals';
import { Deal as ClientDeal } from '../data/deals';
import { Task } from '../data/tasks';

const Dashboard = () => {
  const [teamPerformance, setTeamPerformance] = useState<EmployeePerformance[]>([]);
  const [pipelineStats, setPipelineStats] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [deals, setDeals] = useState<ClientDeal[]>([]);
  const [revenueData, setRevenueData] = useState<{ total: number, byEmployee: Record<string, { revenue: number, commission: number }> }>({ 
    total: 0, 
    byEmployee: {} 
  });

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals');
        if (!response.ok) throw new Error('Failed to fetch deals');
        const data = await response.json();
        const clientDeals: ClientDeal[] = data.map((deal: any) => ({
          ...deal,
          assignedTo: deal.assigned_to ?? '',
          salesperson: deal.salesperson ?? null,
          customer: deal.companyName || '',
          createdAt: deal.updated_at,
          phase: deal.phase === "Verloren" ? "Abgeschlossen" : deal.phase,
          expirationDate: deal.expiration_date || null,
          commissionPercentage: deal.commission_percentage || 0,
          value: parseFloat(deal.value.toString())
        }));
        setDeals(clientDeals);
      } catch (error) {
        console.error('Error fetching deals:', error);
      }
    };

    fetchDeals();
  }, []);

  useEffect(() => {
    const fetchPerformance = async () => {
      const performances = await getAllEmployeePerformances(deals, tasks);
      setTeamPerformance(performances);
    };
    fetchPerformance();
    setPipelineStats(getPipelineStats());
    
    // Calculate revenue and commissions
    const employeeRevenue: Record<string, { revenue: number, commission: number }> = {};
    
    console.log('Starting revenue calculation with deals:', deals);
    
    deals.forEach(deal => {
      console.log('Processing deal:', {
        title: deal.title,
        value: deal.value,
        assignedTo: deal.assignedTo,
        salesperson: deal.salesperson,
        commissionPercentage: deal.commissionPercentage
      });

      // Initialize if not exists
      if (!employeeRevenue[deal.assignedTo]) {
        employeeRevenue[deal.assignedTo] = { revenue: 0, commission: 0 };
      }
      if (deal.salesperson && !employeeRevenue[deal.salesperson]) {
        employeeRevenue[deal.salesperson] = { revenue: 0, commission: 0 };
      }

      // Add full value to assigned person's revenue
      employeeRevenue[deal.assignedTo].revenue += deal.value;
      console.log(`Added ${deal.value} to ${deal.assignedTo}'s revenue. New total:`, employeeRevenue[deal.assignedTo].revenue);

      // Handle commission
      if (deal.salesperson && deal.commissionPercentage > 0) {
        const commissionAmount = (deal.value * deal.commissionPercentage) / 100;
        // Add commission to salesperson's provision
        employeeRevenue[deal.salesperson].commission += commissionAmount;
        // Subtract commission from assigned person's revenue
        employeeRevenue[deal.assignedTo].revenue -= commissionAmount;
        console.log(`Added ${commissionAmount} commission to ${deal.salesperson}. New total:`, employeeRevenue[deal.salesperson].commission);
        console.log(`Subtracted ${commissionAmount} from ${deal.assignedTo}'s revenue. New total:`, employeeRevenue[deal.assignedTo].revenue);
      }
    });

    const total = Object.values(employeeRevenue).reduce((sum, emp) => 
      sum + emp.revenue + emp.commission, 0);

    console.log('Final revenue data:', { total, byEmployee: employeeRevenue });
    setRevenueData({ total, byEmployee: employeeRevenue });
  }, [deals]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const metrics = [
    {
      title: "Gesamtumsatz",
      value: formatCurrency(revenueData.total),
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Aktive Deals",
      value: deals.filter(d => d.status === "Aktiv").length,
      change: "+2",
      changeType: "positive",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Offene Aufgaben",
      value: tasks.filter(t => t.status !== "completed").length,
      change: "-3",
      changeType: "negative",
      icon: CheckSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Team Performance",
      value: `${Math.round(teamPerformance.reduce((acc, p) => acc + p.performance, 0) / teamPerformance.length)}%`,
      change: "+5%",
      changeType: "positive",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const recentActivities = [
    { type: "deal", message: "Neuer Deal 'Webseite Redesign' für Firma ABC erstellt", time: "vor 2 Stunden", icon: Target },
    { type: "task", message: "Aufgabe 'Konzepterstellung' abgeschlossen", time: "vor 3 Stunden", icon: CheckSquare },
    { type: "customer", message: "Neuer Kontakt bei Firma XYZ hinzugefügt", time: "vor 5 Stunden", icon: Users },
    { type: "invoice", message: "Rechnung #2024-001 versendet", time: "vor 1 Tag", icon: DollarSign }
  ];

  return (
    <div className="space-y-8 p-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Übersicht über Ihre Geschäftsaktivitäten</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Calendar className="w-4 h-4 inline-block mr-2" />
            Letzter Monat
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <ArrowUpRight className="w-4 h-4 inline-block mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                  <div className="flex items-center">
                    {metric.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <p className={`text-sm ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change} vs. letzter Monat
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deals Pipeline */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              Deals Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {pipelineStats.map((stat: any) => (
                <div key={stat.phase} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{stat.phase}</span>
                    <span className="text-gray-600">{stat.count} Deals</span>
                  </div>
                  <Progress value={stat.percentage} className="h-2 bg-gray-100" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Wert</span>
                    <span className="font-medium text-gray-900">{formatCurrency(stat.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Letzte Aktivitäten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    <activity.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance - Full Width */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mitarbeiter</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Deals</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Umsatz</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Provision</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Gesamt</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map((member) => {
                  const currentMonthHours = getCurrentMonthTrackedHours(member.name);
                  const memberData = revenueData.byEmployee[member.name] || { revenue: 0, commission: 0 };
                  const totalEarnings = memberData.revenue + memberData.commission;
                  const memberDeals = deals.filter(d => d.assignedTo === member.name);
                  const salespersonDeals = deals.filter(d => d.salesperson === member.name);
                  
                  console.log(`Member ${member.name}:`, {
                    revenue: memberData.revenue,
                    commission: memberData.commission,
                    totalEarnings,
                    assignedDeals: memberDeals.length,
                    salespersonDeals: salespersonDeals.length
                  });
                  
                  return (
                    <tr key={member.name} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {memberDeals.length}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(memberData.revenue)}</td>
                      <td className="py-3 px-4 font-medium text-green-600">{formatCurrency(memberData.commission)}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(totalEarnings)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={member.performance} className="w-20 h-2" />
                          <span className="text-sm text-gray-600">{member.performance}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Time Tracking Popup */}
      {selectedEmployee && (
        <TimeTrackingPopup
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          employeeName={selectedEmployee}
          tasks={getTasksByEmployee(selectedEmployee)}
        />
      )}
    </div>
  );
};

export default Dashboard;
