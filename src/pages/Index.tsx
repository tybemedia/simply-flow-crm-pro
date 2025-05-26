
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Target, CheckSquare, FileText, TrendingUp, DollarSign, Clock, Calendar, UserCheck } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import CustomerList from '@/components/CustomerList';
import DealsPipeline from '@/components/DealsPipeline';
import TaskManager from '@/components/TaskManager';
import InvoiceManager from '@/components/InvoiceManager';
import ContactsManager from '@/components/ContactsManager';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SimplyDone CRM</h1>
          <p className="text-lg text-gray-600">Ihr komplettes Business Management System</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Kunden
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Kontakte
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Aufgaben
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Rechnungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerList />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactsManager />
          </TabsContent>

          <TabsContent value="deals">
            <DealsPipeline />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
