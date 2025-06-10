export interface Deal {
  id: number;
  title: string;
  customer: string;
  value: number;
  probability: number;
  phase: "Ersttermin" | "Angebot versendet" | "Verhandlung" | "Abgeschlossen";
  assignedTo: string;
  salesperson: string | null;
  commissionPercentage: number;
  closeDate: string;
  status: "Aktiv" | "In Kooperation" | "Erfolgreich abgeschlossen - Einmalig" | "Gekündigt";
  expirationDate: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type DealPhase = Deal['phase'];
export type DealStatus = Deal['status'];

// This array will later be replaced with data from a database
export const deals: Deal[] = [
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
    description: "Komplettes Redesign der Unternehmenswebseite mit moderner Technologie",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
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
    description: "Entwicklung einer maßgeschneiderten E-Commerce Lösung",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20"
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
    description: "Entwicklung einer neuen Markenidentität und Logodesign",
    createdAt: "2024-01-25",
    updatedAt: "2024-01-25"
  }
];

export const getDealsByPhase = (phase: DealPhase): Deal[] => {
  return deals.filter(deal => deal.phase === phase);
};

export const getDealsByEmployee = (employeeName: string): Deal[] => {
  return deals.filter(deal => deal.assignedTo === employeeName || deal.salesperson === employeeName);
};

export const getDealsByCompany = (companyName: string): Deal[] => {
  return deals.filter(deal => deal.customer === companyName);
};

export const getDealsByCustomer = (customer: string) => 
  deals.filter(deal => deal.customer === customer);

export const getTotalDealValue = (): number => {
  return deals.reduce((sum, deal) => sum + deal.value, 0);
};

export const getTotalRevenueWithCommissions = (): { total: number, byEmployee: Record<string, number> } => {
  const employeeRevenue: Record<string, number> = {};
  
  deals.forEach(deal => {
    // Add full value to assigned person
    employeeRevenue[deal.assignedTo] = (employeeRevenue[deal.assignedTo] || 0) + deal.value;
    
    // If there's a salesperson with commission, adjust the values
    if (deal.salesperson && deal.commissionPercentage > 0) {
      const commissionAmount = (deal.value * deal.commissionPercentage) / 100;
      // Add commission to salesperson
      employeeRevenue[deal.salesperson] = (employeeRevenue[deal.salesperson] || 0) + commissionAmount;
      // Subtract commission from assigned person
      employeeRevenue[deal.assignedTo] = (employeeRevenue[deal.assignedTo] || 0) - commissionAmount;
    }
  });

  const total = Object.values(employeeRevenue).reduce((sum, value) => sum + value, 0);
  
  return {
    total,
    byEmployee: employeeRevenue
  };
};

export const getDealsByDateRange = (startDate: string, endDate: string) => 
  deals.filter(deal => 
    deal.createdAt >= startDate && deal.createdAt <= endDate
  );

export const getDealsByStatus = (status: DealStatus): Deal[] => {
  return deals.filter(deal => deal.status === status);
};

// Helper function to get pipeline statistics
export const getPipelineStats = () => {
  const phases: Deal['phase'][] = ['Ersttermin', 'Angebot versendet', 'Verhandlung', 'Abgeschlossen'];
  
  return phases.map(phase => {
    const phaseDeals = getDealsByPhase(phase);
    return {
      phase,
      count: phaseDeals.length,
      value: phaseDeals.reduce((sum, deal) => sum + deal.value, 0)
    };
  });
}; 