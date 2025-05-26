
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, Target, CheckSquare, TrendingUp, Calendar, Clock } from 'lucide-react';

const Dashboard = () => {
  const metrics = [
    {
      title: "Gesamtumsatz",
      value: "€245,670",
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
      value: "23",
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

  const dealsPipeline = [
    { phase: "Ersttermin", count: 8, value: "€45,200", color: "bg-blue-500" },
    { phase: "Angebot versendet", count: 12, value: "€89,400", color: "bg-yellow-500" },
    { phase: "Verhandlung", count: 6, value: "€67,800", color: "bg-orange-500" },
    { phase: "Abgeschlossen", count: 15, value: "€156,300", color: "bg-green-500" }
  ];

  const recentActivities = [
    { type: "deal", message: "Neuer Deal 'Webseite Redesign' für Firma ABC erstellt", time: "vor 2 Stunden", icon: Target },
    { type: "task", message: "Aufgabe 'Konzepterstellung' abgeschlossen", time: "vor 3 Stunden", icon: CheckSquare },
    { type: "customer", message: "Neuer Kontakt bei Firma XYZ hinzugefügt", time: "vor 5 Stunden", icon: Users },
    { type: "invoice", message: "Rechnung #2024-001 versendet", time: "vor 1 Tag", icon: DollarSign }
  ];

  const teamPerformance = [
    { name: "Anna Schmidt", deals: 8, revenue: "€89,400", tasks: 12 },
    { name: "Thomas Müller", deals: 6, revenue: "€67,200", tasks: 9 },
    { name: "Sarah Weber", deals: 9, revenue: "€95,800", tasks: 15 },
    { name: "Michael König", deals: 5, revenue: "€45,600", tasks: 8 }
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
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
              {dealsPipeline.map((phase, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{phase.phase}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{phase.count} Deals</div>
                      <div className="text-xs text-gray-500">{phase.value}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${phase.color}`}
                      style={{ width: `${(phase.count / 20) * 100}%` }}
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
                    <th className="text-left py-3 px-4">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((member, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{member.name}</td>
                      <td className="py-3 px-4">{member.deals}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">{member.revenue}</td>
                      <td className="py-3 px-4">{member.tasks}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Progress value={75 + index * 5} className="w-20" />
                          <span className="text-sm text-gray-600">{75 + index * 5}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
