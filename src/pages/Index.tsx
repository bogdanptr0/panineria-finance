import { useState, useEffect } from "react";
import Header from "@/components/Header";
import RevenueSection from "@/components/RevenueSection";
import CostOfGoodsSection from "@/components/CostOfGoodsSection";
import ExpensesSection from "@/components/ExpensesSection";
import ProfitSummary from "@/components/ProfitSummary";
import DataVisualization from "@/components/DataVisualization";
import ProductProfitability from "@/components/ProductProfitability";
import LaborAnalysis from "@/components/LaborAnalysis";
import ComparisonView from "@/components/ComparisonView";
import BudgetAnalysis from "@/components/BudgetAnalysis";
import CashFlowProjection from "@/components/CashFlowProjection";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { loadReport, updateAllReportsWithDefaultSalaries } from "@/lib/persistence";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RequireAuth } from "@/lib/auth";

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState<boolean>(false);
  
  const [revenueItems, setRevenueItems] = useState<Record<string, number>>({
    "Bere": 0,
    "Vin": 0
  });

  const [costOfGoodsItems, setCostOfGoodsItems] = useState<Record<string, number>>({
    "Bere": 0,
    "Vin": 0
  });

  const [salaryExpenses, setSalaryExpenses] = useState<Record<string, number>>({
    "Adi": 4050,
    "Ioana": 4050,
    "Andreea": 4050,
    "Victoria": 4050
  });

  const [distributorExpenses, setDistributorExpenses] = useState<Record<string, number>>({
    "Maria FoodNova": 0,
    "CocaCola": 0,
    "24H": 0,
    "Sinless": 0,
    "Peroni": 0,
    "Sudavangarde(Brutarie Foccacia)": 0,
    "Proporzioni": 0,
    "LIDL": 0,
    "Metro": 0
  });

  const [utilitiesExpenses, setUtilitiesExpenses] = useState<Record<string, number>>({
    "Gaze(Engie)": 0,
    "Apa": 0,
    "Curent": 0,
    "Gunoi(Iridex)": 0,
    "Internet": 0
  });

  const [operationalExpenses, setOperationalExpenses] = useState<Record<string, number>>({
    "Contabilitate": 0,
    "ECR": 0,
    "ISU": 0,
    "Chirie": 0,
    "Protectia Muncii": 0
  });

  const [otherExpenses, setOtherExpenses] = useState<Record<string, number>>({});

  const [budget, setBudget] = useState<{
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  } | undefined>(undefined);

  useEffect(() => {
    updateAllReportsWithDefaultSalaries();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      const report = await loadReport(selectedMonth);
      if (report) {
        setRevenueItems(report.revenueItems);
        setCostOfGoodsItems(report.costOfGoodsItems);
        setSalaryExpenses(report.salaryExpenses);
        setDistributorExpenses(report.distributorExpenses);
        setUtilitiesExpenses(report.utilitiesExpenses || {
          "Gaze(Engie)": 0,
          "Apa": 0,
          "Curent": 0,
          "Gunoi(Iridex)": 0,
          "Internet": 0
        });
        setOperationalExpenses(report.operationalExpenses || {
          "Contabilitate": 0,
          "ECR": 0,
          "ISU": 0,
          "Chirie": 0,
          "Protectia Muncii": 0
        });
        setOtherExpenses(report.otherExpenses || {});
        setBudget(report.budget);
      }
    };
    
    fetchReport();
  }, [selectedMonth]);

  const calculateTotal = (items: Record<string, number>) => {
    return Object.values(items).reduce((sum, value) => sum + value, 0);
  };

  const totalRevenue = calculateTotal(revenueItems);
  const totalCogs = calculateTotal(costOfGoodsItems);
  const totalSalaryExpenses = calculateTotal(salaryExpenses);
  const totalDistributorExpenses = calculateTotal(distributorExpenses);
  const totalUtilitiesExpenses = calculateTotal(utilitiesExpenses);
  const totalOperationalExpenses = calculateTotal(operationalExpenses);
  const totalOtherExpenses = calculateTotal(otherExpenses);
  const totalExpenses = totalSalaryExpenses + totalDistributorExpenses + 
                         totalUtilitiesExpenses + totalOperationalExpenses + totalOtherExpenses;
  
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpenses;

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

  const handleUtilitiesUpdate = (name: string, value: number) => {
    setUtilitiesExpenses(prev => ({ ...prev, [name]: value }));
  };

  const handleOperationalUpdate = (name: string, value: number) => {
    setOperationalExpenses(prev => ({ ...prev, [name]: value }));
  };

  const handleOtherExpensesUpdate = (name: string, value: number) => {
    setOtherExpenses(prev => ({ ...prev, [name]: value }));
  };

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

  const handleUtilitiesRename = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setUtilitiesExpenses(prev => {
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

  const handleOtherExpensesRename = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setOtherExpenses(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
  };

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

  const handleAddUtilities = (name: string) => {
    setUtilitiesExpenses(prev => ({ ...prev, [name]: 0 }));
  };

  const handleAddOperational = (name: string) => {
    setOperationalExpenses(prev => ({ ...prev, [name]: 0 }));
  };

  const handleAddOtherExpenses = (name: string) => {
    setOtherExpenses(prev => ({ ...prev, [name]: 0 }));
  };

  const operationalExpensesSubsections = [
    {
      title: "Utilitati",
      items: ["Gaze(Engie)", "Apa", "Curent", "Gunoi(Iridex)", "Internet"]
    },
    {
      title: "Operationale",
      items: ["Contabilitate", "ECR", "ISU", "Chirie", "Protectia Muncii"]
    },
    {
      title: "Alte Cheltuieli",
      items: Object.keys(otherExpenses)
    }
  ];

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 print:bg-white">
        <div className="container mx-auto px-4 py-8 print:py-2">
          <Header 
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            revenueItems={revenueItems}
            costOfGoodsItems={costOfGoodsItems}
            salaryExpenses={salaryExpenses}
            distributorExpenses={distributorExpenses}
            utilitiesExpenses={utilitiesExpenses}
            operationalExpenses={operationalExpenses}
            otherExpenses={otherExpenses}
            budget={budget}
          />

          <Tabs defaultValue="summary" className="print:hidden">
            <TabsList className="grid grid-cols-2 mb-8 w-full md:w-[600px] mx-auto">
              <TabsTrigger value="summary">Basic Report</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
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
                  
                  <div className="bg-gray-100 p-4 rounded-md print:break-after-page">
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
                    items={{
                      ...utilitiesExpenses,
                      ...operationalExpenses,
                      ...otherExpenses
                    }}
                    onUpdateItem={(name, value) => {
                      if (operationalExpensesSubsections[0].items.includes(name)) {
                        handleUtilitiesUpdate(name, value);
                      } else if (operationalExpensesSubsections[1].items.includes(name)) {
                        handleOperationalUpdate(name, value);
                      } else {
                        handleOtherExpensesUpdate(name, value);
                      }
                    }}
                    totalExpenses={totalUtilitiesExpenses + totalOperationalExpenses + totalOtherExpenses}
                    onRenameItem={(oldName, newName) => {
                      if (operationalExpensesSubsections[0].items.includes(oldName)) {
                        handleUtilitiesRename(oldName, newName);
                      } else if (operationalExpensesSubsections[1].items.includes(oldName)) {
                        handleOperationalRename(oldName, newName);
                      } else {
                        handleOtherExpensesRename(oldName, newName);
                      }
                    }}
                    onAddItem={handleAddOtherExpenses}
                    subsections={operationalExpensesSubsections}
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
              
              <div className="mt-8">
                <DataVisualization 
                  revenueItems={revenueItems}
                  costOfGoodsItems={costOfGoodsItems}
                  salaryExpenses={salaryExpenses}
                  distributorExpenses={distributorExpenses}
                  utilitiesExpenses={utilitiesExpenses}
                  operationalExpenses={operationalExpenses}
                  otherExpenses={otherExpenses}
                  grossProfit={grossProfit}
                  netProfit={netProfit}
                  totalExpenses={totalExpenses}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="advanced">
              <div className="space-y-8">
                <ProductProfitability 
                  revenueItems={revenueItems}
                  costOfGoodsItems={costOfGoodsItems}
                />
                
                <LaborAnalysis 
                  salaryExpenses={salaryExpenses}
                  totalRevenue={totalRevenue}
                />
                
                <ComparisonView 
                  currentMonth={selectedMonth}
                  currentReport={{
                    totalRevenue,
                    totalCogs,
                    grossProfit,
                    totalExpenses,
                    netProfit
                  }}
                />
                
                <BudgetAnalysis 
                  selectedMonth={selectedMonth}
                  totalRevenue={totalRevenue}
                  totalExpenses={totalExpenses}
                  netProfit={netProfit}
                  revenueItems={revenueItems}
                  costOfGoodsItems={costOfGoodsItems}
                  salaryExpenses={salaryExpenses}
                  distributorExpenses={distributorExpenses}
                  utilitiesExpenses={utilitiesExpenses}
                  operationalExpenses={operationalExpenses}
                  otherExpenses={otherExpenses}
                  budget={budget}
                  onBudgetSave={setBudget}
                />
                
                <CashFlowProjection 
                  currentRevenue={totalRevenue}
                  currentExpenses={totalExpenses}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="hidden print:block">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Raport P&L Panineria</h1>
              <p className="text-xl">{formatDate(selectedMonth)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <RevenueSection 
                revenueItems={revenueItems}
                onUpdateItem={handleRevenueUpdate}
                totalRevenue={totalRevenue}
                onRenameItem={handleRevenueRename}
                onAddItem={handleAddRevenue}
              />
              
              <div className="space-y-6">
                <ExpensesSection 
                  title="CHELTUIELI SALARIALE"
                  items={salaryExpenses}
                  onUpdateItem={handleSalaryUpdate}
                  totalExpenses={totalSalaryExpenses}
                  onRenameItem={handleSalaryRename}
                  onAddItem={handleAddSalary}
                />
                
                <div className="bg-gray-100 p-4 rounded-md">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-lg">TOTAL CHELTUIELI</span>
                    <span className="text-lg">{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="page-break"></div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <CostOfGoodsSection 
                cogsItems={costOfGoodsItems}
                onUpdateItem={handleCogsUpdate}
                totalCogs={totalCogs}
                onRenameItem={handleCogsRename}
                onAddItem={handleAddCogs}
              />
              
              <div className="space-y-6">
                <ExpensesSection 
                  title="CHELTUIELI DISTRIBUITORI"
                  items={distributorExpenses}
                  onUpdateItem={handleDistributorUpdate}
                  totalExpenses={totalDistributorExpenses}
                  onRenameItem={handleDistributorRename}
                  onAddItem={handleAddDistributor}
                />
                
                <ExpensesSection 
                  title="UTILITATI"
                  items={utilitiesExpenses}
                  onUpdateItem={handleUtilitiesUpdate}
                  totalExpenses={totalUtilitiesExpenses}
                  onRenameItem={handleUtilitiesRename}
                  onAddItem={handleAddUtilities}
                />
                
                <ExpensesSection 
                  title="CHELTUIELI OPERATIONALE"
                  items={operationalExpenses}
                  onUpdateItem={handleOperationalUpdate}
                  totalExpenses={totalOperationalExpenses}
                  onRenameItem={handleOperationalRename}
                  onAddItem={handleAddOperational}
                />
                
                <ExpensesSection 
                  title="ALTE CHELTUIELI"
                  items={otherExpenses}
                  onUpdateItem={handleOtherExpensesUpdate}
                  totalExpenses={totalOtherExpenses}
                  onRenameItem={handleOtherExpensesRename}
                  onAddItem={handleAddOtherExpenses}
                />
              </div>
            </div>
            
            <ProfitSummary 
              grossProfit={grossProfit} 
              totalExpenses={totalExpenses} 
              netProfit={netProfit} 
            />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default Index;
