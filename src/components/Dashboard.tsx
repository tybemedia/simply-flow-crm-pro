import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, Target, CheckSquare, TrendingUp, Calendar, Clock } from 'lucide-react';
import { getAllEmployeePerformances } from '../data/employees';
import { deals, getPipelineStats, getTotalDealValue } from '../data/deals';
import { tasks, getCurrentMonthTrackedHours, getTasksByEmployee } from '../data/tasks';
import TimeTrackingPopup from './TimeTrackingPopup';

const Dashboard = () => {
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [pipelineStats, setPipelineStats] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  useEffect(() => {
    const performances = getAllEmployeePerformances(deals, tasks);
    setTeamPerformance(performances);
    setPipelineStats(getPipelineStats());
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const metrics = [
    {
      title: "Gesamtumsatz",
      value: formatCurrency(getTotalDealValue()),
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Aktive Kunden",
      value: "156",
      change: "+8",
      changeType: "positive",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Offene Deals",
      value: deals.filter(d => d.phase !== 'Abgeschlossen').length.toString(),
      change: "-2",
      changeType: "negative",
      icon: Target,
      color: "text-orange-600"
    },
    {
      title: "Offene Aufgaben",
      value: "47",
      change: "+5",
      changeType: "positive",
      icon: CheckSquare,
      color: "text-purple-600"
    }
  ];

  const recentActivities = [
    { type: "deal", message: "Neuer Deal 'Webseite Redesign' für Firma ABC erstellt", time: "vor 2 Stunden", icon: Target },
    { type: "task", message: "Aufgabe 'Konzepterstellung' abgeschlossen", time: "vor 3 Stunden", icon: CheckSquare },
    { type: "customer", message: "Neuer Kontakt bei Firma XYZ hinzugefügt", time: "vor 5 Stunden", icon: Users },
    { type: "invoice", message: "Rechnung #2024-001 versendet", time: "vor 1 Tag", icon: DollarSign }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Übersicht über Ihre Geschäftsaktivitäten</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`text-sm ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change} vs. letzter Monat
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deals Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Deals Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineStats.map((phase, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{phase.phase}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{phase.count} Deals</div>
                      <div className="text-xs text-gray-500">{formatCurrency(phase.value)}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        phase.phase === 'Ersttermin' ? 'bg-blue-500' :
                        phase.phase === 'Angebot versendet' ? 'bg-yellow-500' :
                        phase.phase === 'Verhandlung' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(phase.count / deals.length) * 100}%` }}
                    ></div>
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
                  <div className="p-2 bg-blue-100 rounded-full">
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

        {/* Team Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Mitarbeiter</th>
                    <th className="text-left py-3 px-4">Deals</th>
                    <th className="text-left py-3 px-4">Umsatz</th>
                    <th className="text-left py-3 px-4">Aufgaben</th>
                    <th className="text-left py-3 px-4">Arbeitszeit (Monat)</th>
                    <th className="text-left py-3 px-4">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((member) => {
                    const currentMonthHours = getCurrentMonthTrackedHours(member.name);
                    return (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{member.name}</td>
                        <td className="py-3 px-4">{member.deals}</td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          {formatCurrency(member.revenue)}
                        </td>
                        <td className="py-3 px-4">{member.tasks}</td>
                        <td className="py-3 px-4">
                          <div 
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                            onClick={() => setSelectedEmployee(member.name)}
                          >
                            <span className="text-sm">
                              {Math.round(currentMonthHours)} / {member.monthlyHours}h
                            </span>
                            <Progress 
                              value={(currentMonthHours / member.monthlyHours) * 100} 
                              className="w-20" 
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Progress value={member.performance} className="w-20" />
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
      </div>

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
