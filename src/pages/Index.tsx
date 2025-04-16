
import { useState } from "react";
import MonthSelector from "@/components/MonthSelector";
import RevenueSection from "@/components/RevenueSection";
import CostOfGoodsSection from "@/components/CostOfGoodsSection";
import ExpensesSection from "@/components/ExpensesSection";
import ProfitSummary from "@/components/ProfitSummary";
import { formatCurrency } from "@/lib/formatters";

const Index = () => {
  // State for the selected month and year
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // State for revenue items
  const [revenueItems, setRevenueItems] = useState<Record<string, number>>({
    "Produs #1": 0,
    "Produs #2": 0,
    "Produs #3": 0,
    "Bere": 0,
    "Vin": 0
  });

  // State for cost of goods sold
  const [costOfGoodsItems, setCostOfGoodsItems] = useState<Record<string, number>>({
    "Produs #1": 0,
    "Produs #2": 0,
    "Produs #3": 0,
    "Bere": 0,
    "Vin": 0
  });

  // State for salary expenses
  const [salaryExpenses, setSalaryExpenses] = useState<Record<string, number>>({
    "#1": 0,
    "#2": 0,
    "#3": 0
  });

  // State for distributor expenses
  const [distributorExpenses, setDistributorExpenses] = useState<Record<string, number>>({
    "#1": 0,
    "#2": 0,
    "#3": 0
  });

  // State for operational expenses
  const [operationalExpenses, setOperationalExpenses] = useState<Record<string, number>>({
    "Chirie": 0,
    "Utilitati - Curent": 0,
    "Utilitati - Apa": 0,
    "Utilitati - Gunoi": 0,
    "Alte Cheltuieli": 0
  });

  // Calculate totals
  const calculateTotal = (items: Record<string, number>) => {
    return Object.values(items).reduce((sum, value) => sum + value, 0);
  };

  const totalRevenue = calculateTotal(revenueItems);
  const totalCogs = calculateTotal(costOfGoodsItems);
  const totalSalaryExpenses = calculateTotal(salaryExpenses);
  const totalDistributorExpenses = calculateTotal(distributorExpenses);
  const totalOperationalExpenses = calculateTotal(operationalExpenses);
  const totalExpenses = totalSalaryExpenses + totalDistributorExpenses + totalOperationalExpenses;
  
  // Calculate profit
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpenses;

  // Handle updates for each section
  const handleRevenueUpdate = (name: string, value: number) => {
    setRevenueItems(prev => ({ ...prev, [name]: value }));
  };

  const handleCogsUpdate = (name: string, value: number) => {
    setCostOfGoodsItems(prev => ({ ...prev, [name]: value }));
  };

  const handleSalaryUpdate = (name: string, value: number) => {
    setSalaryExpenses(prev => ({ ...prev, [name]: value }));
  };

  const handleDistributorUpdate = (name: string, value: number) => {
    setDistributorExpenses(prev => ({ ...prev, [name]: value }));
  };

  const handleOperationalUpdate = (name: string, value: number) => {
    setOperationalExpenses(prev => ({ ...prev, [name]: value }));
  };

  // Handle item renaming for each section
  const handleRevenueRename = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setRevenueItems(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
  };

  const handleCogsRename = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setCostOfGoodsItems(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
  };

  const handleSalaryRename = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setSalaryExpenses(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
  };

  const handleDistributorRename = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setDistributorExpenses(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
  };

  const handleOperationalRename = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setOperationalExpenses(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
  };

  // Handle adding new items for each section
  const handleAddRevenue = (name: string) => {
    setRevenueItems(prev => ({ ...prev, [name]: 0 }));
  };

  const handleAddCogs = (name: string) => {
    setCostOfGoodsItems(prev => ({ ...prev, [name]: 0 }));
  };

  const handleAddSalary = (name: string) => {
    setSalaryExpenses(prev => ({ ...prev, [name]: 0 }));
  };

  const handleAddDistributor = (name: string) => {
    setDistributorExpenses(prev => ({ ...prev, [name]: 0 }));
  };

  const handleAddOperational = (name: string) => {
    setOperationalExpenses(prev => ({ ...prev, [name]: 0 }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Raport P&L Panineria</h1>
          <div className="my-4">
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <RevenueSection 
              revenueItems={revenueItems}
              onUpdateItem={handleRevenueUpdate}
              totalRevenue={totalRevenue}
              onRenameItem={handleRevenueRename}
              onAddItem={handleAddRevenue}
            />
            
            <CostOfGoodsSection 
              cogsItems={costOfGoodsItems}
              onUpdateItem={handleCogsUpdate}
              totalCogs={totalCogs}
              onRenameItem={handleCogsRename}
              onAddItem={handleAddCogs}
            />
            
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-lg">PROFIT BRUT | Venituri minus CoGS</span>
                <span className="text-lg">{formatCurrency(grossProfit)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ExpensesSection 
              title="CHELTUIELI SALARIALE"
              items={salaryExpenses}
              onUpdateItem={handleSalaryUpdate}
              totalExpenses={totalSalaryExpenses}
              onRenameItem={handleSalaryRename}
              onAddItem={handleAddSalary}
            />
            
            <ExpensesSection 
              title="CHELTUIELI DISTRIBUITORI"
              items={distributorExpenses}
              onUpdateItem={handleDistributorUpdate}
              totalExpenses={totalDistributorExpenses}
              onRenameItem={handleDistributorRename}
              onAddItem={handleAddDistributor}
            />
            
            <ExpensesSection 
              title="CHELTUIELI OPERATIONALE"
              items={operationalExpenses}
              onUpdateItem={handleOperationalUpdate}
              totalExpenses={totalOperationalExpenses}
              onRenameItem={handleOperationalRename}
              onAddItem={handleAddOperational}
            />
            
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-lg">TOTAL CHELTUIELI</span>
                <span className="text-lg">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>

        <ProfitSummary 
          grossProfit={grossProfit} 
          totalExpenses={totalExpenses} 
          netProfit={netProfit} 
        />
      </div>
    </div>
  );
};

export default Index;
