import { useState, useEffect } from "react";
import Header from "@/components/Header";
import RevenueSection from "@/components/RevenueSection";
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
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState<boolean>(false);
  
  const [bucatarieItems, setBucatarieItems] = useState<Record<string, number>>({
    "Il Classico": 0,
    "Il Prosciutto": 0,
    "Il Piccante": 0,
    "La Porchetta": 0,
    "La Mortadella": 0,
    "La Buffala": 0,
    "Tiramisu": 0,
    "Platou": 0
  });
  
  const [deletedBucatarieItems, setDeletedBucatarieItems] = useState<Record<string, number>>({});
  const [deletedBarItems, setDeletedBarItems] = useState<Record<string, number>>({});
  const [deletedSalaryItems, setDeletedSalaryItems] = useState<Record<string, number>>({});
  const [deletedDistributorItems, setDeletedDistributorItems] = useState<Record<string, number>>({});
  const [deletedUtilitiesItems, setDeletedUtilitiesItems] = useState<Record<string, number>>({});
  const [deletedOperationalItems, setDeletedOperationalItems] = useState<Record<string, number>>({});
  const [deletedOtherItems, setDeletedOtherItems] = useState<Record<string, number>>({});
  
  const [barItems, setBarItems] = useState<Record<string, number>>({});
  
  const getRevenueItems = (): Record<string, number> => {
    return { ...bucatarieItems, ...barItems };
  };

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
        const bucatarie: Record<string, number> = {};
        const bar: Record<string, number> = {};
        
        const bucatarieKeys = [
          "Il Classico", "Il Prosciutto", "Il Piccante", 
          "La Porchetta", "La Mortadella", "La Buffala", 
          "Tiramisu", "Platou"
        ];
        
        Object.entries(report.revenueItems).forEach(([key, value]) => {
          if (bucatarieKeys.includes(key)) {
            bucatarie[key] = value;
          } else {
            bar[key] = value;
          }
        });
        
        setBucatarieItems(bucatarie);
        setBarItems(bar);
        
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

  const totalBucatarieRevenue = calculateTotal(bucatarieItems);
  const totalBarRevenue = calculateTotal(barItems);
  const totalRevenue = totalBucatarieRevenue + totalBarRevenue;
  const totalSalaryExpenses = calculateTotal(salaryExpenses);
  const totalDistributorExpenses = calculateTotal(distributorExpenses);
  const totalUtilitiesExpenses = calculateTotal(utilitiesExpenses);
  const totalOperationalExpenses = calculateTotal(operationalExpenses);
  const totalOtherExpenses = calculateTotal(otherExpenses);
  const totalExpenses = totalSalaryExpenses + totalDistributorExpenses + 
                         totalUtilitiesExpenses + totalOperationalExpenses + totalOtherExpenses;
  
  const grossProfit = totalRevenue;
  const netProfit = grossProfit - totalExpenses;

  const handleRevenueUpdate = (name: string, value: number) => {
    if (Object.keys(bucatarieItems).includes(name)) {
      setBucatarieItems(prev => ({ ...prev, [name]: value }));
    } else {
      setBarItems(prev => ({ ...prev, [name]: value }));
    }
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
    
    if (oldName in bucatarieItems) {
      setBucatarieItems(prev => {
        const value = prev[oldName];
        const newItems = { ...prev };
        delete newItems[oldName];
        return { ...newItems, [newName]: value };
      });
    } else if (oldName in barItems) {
      setBarItems(prev => {
        const value = prev[oldName];
        const newItems = { ...prev };
        delete newItems[oldName];
        return { ...newItems, [newName]: value };
      });
    }
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

  const handleAddRevenue = (name: string, subsectionTitle?: string) => {
    if (subsectionTitle === "Bucatarie") {
      setBucatarieItems(prev => ({ ...prev, [name]: 0 }));
    } else if (subsectionTitle === "Bar") {
      setBarItems(prev => ({ ...prev, [name]: 0 }));
    }
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

  const handleDeleteRevenue = (name: string) => {
    if (Object.keys(bucatarieItems).includes(name)) {
      const value = bucatarieItems[name];
      setDeletedBucatarieItems(prev => ({ ...prev, [name]: value }));
      
      setBucatarieItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Item deleted",
        description: `"${name}" has been removed`,
        action: (
          <Button 
            variant="outline" 
            onClick={() => handleUndoDeleteBucatarie(name)}
          >
            Undo
          </Button>
        ),
      });
    } else if (Object.keys(barItems).includes(name)) {
      const value = barItems[name];
      setDeletedBarItems(prev => ({ ...prev, [name]: value }));
      
      setBarItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Item deleted",
        description: `"${name}" has been removed`,
        action: (
          <Button 
            variant="outline" 
            onClick={() => handleUndoDeleteBar(name)}
          >
            Undo
          </Button>
        ),
      });
    }
  };

  const handleDeleteSalary = (name: string) => {
    const value = salaryExpenses[name];
    setDeletedSalaryItems(prev => ({ ...prev, [name]: value }));
    
    setSalaryExpenses(prev => {
      const newItems = { ...prev };
      delete newItems[name];
      return newItems;
    });
    
    toast({
      title: "Salary item deleted",
      description: `"${name}" has been removed`,
      action: (
        <Button 
          variant="outline" 
          onClick={() => handleUndoDeleteSalary(name)}
        >
          Undo
        </Button>
      ),
    });
  };

  const handleDeleteDistributor = (name: string) => {
    const value = distributorExpenses[name];
    setDeletedDistributorItems(prev => ({ ...prev, [name]: value }));
    
    setDistributorExpenses(prev => {
      const newItems = { ...prev };
      delete newItems[name];
      return newItems;
    });
    
    toast({
      title: "Distributor item deleted",
      description: `"${name}" has been removed`,
      action: (
        <Button 
          variant="outline" 
          onClick={() => handleUndoDeleteDistributor(name)}
        >
          Undo
        </Button>
      ),
    });
  };

  const handleDeleteOperationalItem = (name: string) => {
    if (Object.keys(utilitiesExpenses).includes(name)) {
      const value = utilitiesExpenses[name];
      setDeletedUtilitiesItems(prev => ({ ...prev, [name]: value }));
      
      setUtilitiesExpenses(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Utilities item deleted",
        description: `"${name}" has been removed`,
        action: (
          <Button 
            variant="outline" 
            onClick={() => handleUndoDeleteUtilities(name)}
          >
            Undo
          </Button>
        ),
      });
    } else if (Object.keys(operationalExpenses).includes(name)) {
      const value = operationalExpenses[name];
      setDeletedOperationalItems(prev => ({ ...prev, [name]: value }));
      
      setOperationalExpenses(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Operational item deleted",
        description: `"${name}" has been removed`,
        action: (
          <Button 
            variant="outline" 
            onClick={() => handleUndoDeleteOperational(name)}
          >
            Undo
          </Button>
        ),
      });
    } else if (Object.keys(otherExpenses).includes(name)) {
      const value = otherExpenses[name];
      setDeletedOtherItems(prev => ({ ...prev, [name]: value }));
      
      setOtherExpenses(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Other expense item deleted",
        description: `"${name}" has been removed`,
        action: (
          <Button 
            variant="outline" 
            onClick={() => handleUndoDeleteOther(name)}
          >
            Undo
          </Button>
        ),
      });
    }
  };

  const handleUndoDeleteBucatarie = (name: string) => {
    if (deletedBucatarieItems[name] !== undefined) {
      setBucatarieItems(prev => ({
        ...prev,
        [name]: deletedBucatarieItems[name]
      }));
      
      setDeletedBucatarieItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Item restored",
        description: `"${name}" has been restored`,
      });
    }
  };

  const handleUndoDeleteBar = (name: string) => {
    if (deletedBarItems[name] !== undefined) {
      setBarItems(prev => ({
        ...prev,
        [name]: deletedBarItems[name]
      }));
      
      setDeletedBarItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Item restored",
        description: `"${name}" has been restored`,
      });
    }
  };

  const handleUndoDeleteSalary = (name: string) => {
    if (deletedSalaryItems[name] !== undefined) {
      setSalaryExpenses(prev => ({
        ...prev,
        [name]: deletedSalaryItems[name]
      }));
      
      setDeletedSalaryItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Salary item restored",
        description: `"${name}" has been restored`,
      });
    }
  };

  const handleUndoDeleteDistributor = (name: string) => {
    if (deletedDistributorItems[name] !== undefined) {
      setDistributorExpenses(prev => ({
        ...prev,
        [name]: deletedDistributorItems[name]
      }));
      
      setDeletedDistributorItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Distributor item restored",
        description: `"${name}" has been restored`,
      });
    }
  };

  const handleUndoDeleteUtilities = (name: string) => {
    if (deletedUtilitiesItems[name] !== undefined) {
      setUtilitiesExpenses(prev => ({
        ...prev,
        [name]: deletedUtilitiesItems[name]
      }));
      
      setDeletedUtilitiesItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Utilities item restored",
        description: `"${name}" has been restored`,
      });
    }
  };

  const handleUndoDeleteOperational = (name: string) => {
    if (deletedOperationalItems[name] !== undefined) {
      setOperationalExpenses(prev => ({
        ...prev,
        [name]: deletedOperationalItems[name]
      }));
      
      setDeletedOperationalItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Operational item restored",
        description: `"${name}" has been restored`,
      });
    }
  };

  const handleUndoDeleteOther = (name: string) => {
    if (deletedOtherItems[name] !== undefined) {
      setOtherExpenses(prev => ({
        ...prev,
        [name]: deletedOtherItems[name]
      }));
      
      setDeletedOtherItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      toast({
        title: "Other expense item restored",
        description: `"${name}" has been restored`,
      });
    }
  };

  const operationalExpensesSubsections = [
    {
      title: "Utilitati",
      items: Object.keys(utilitiesExpenses)
    },
    {
      title: "Operationale",
      items: Object.keys(operationalExpenses)
    },
    {
      title: "Alte Cheltuieli",
      items: Object.keys(otherExpenses)
    }
  ];

  const revenueSubsections = [
    {
      title: "Bucatarie",
      items: Object.keys(bucatarieItems)
    },
    {
      title: "Bar",
      items: Object.keys(barItems)
    }
  ];

  const handleSubsectionAddItem = (subsectionTitle: string, name: string) => {
    if (subsectionTitle === "Utilitati") {
      handleAddUtilities(name);
    } else if (subsectionTitle === "Operationale") {
      handleAddOperational(name);
    } else if (subsectionTitle === "Alte Cheltuieli") {
      handleAddOtherExpenses(name);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 print:bg-white">
        <div className="container mx-auto px-4 py-8 print:py-2">
          <Header 
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            revenueItems={getRevenueItems()}
            costOfGoodsItems={{}}
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
                    revenueItems={getRevenueItems()}
                    onUpdateItem={handleRevenueUpdate}
                    totalRevenue={totalRevenue}
                    onRenameItem={handleRevenueRename}
                    onAddItem={handleAddRevenue}
                    onDeleteItem={handleDeleteRevenue}
                    subsections={revenueSubsections}
                  />
                  
                  <div className="bg-gray-100 p-4 rounded-md print:break-after-page">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-lg">PROFIT BRUT</span>
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
                    onDeleteItem={handleDeleteSalary}
                  />
                  
                  <ExpensesSection 
                    title="CHELTUIELI DISTRIBUITORI"
                    items={distributorExpenses}
                    onUpdateItem={handleDistributorUpdate}
                    totalExpenses={totalDistributorExpenses}
                    onRenameItem={handleDistributorRename}
                    onAddItem={handleAddDistributor}
                    onDeleteItem={handleDeleteDistributor}
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
                    onAddItem={(name, subsectionTitle) => {
                      handleSubsectionAddItem(subsectionTitle || operationalExpensesSubsections[2].title, name);
                    }}
                    onDeleteItem={handleDeleteOperationalItem}
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
                  revenueItems={getRevenueItems()}
                  costOfGoodsItems={{}}
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
                  revenueItems={getRevenueItems()}
                  costOfGoodsItems={{}}
                />
                
                <LaborAnalysis 
                  salaryExpenses={salaryExpenses}
                  totalRevenue={totalRevenue}
                />
                
                <ComparisonView 
                  currentMonth={selectedMonth}
                  currentReport={{
                    totalRevenue,
                    totalCogs: 0,
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
                  revenueItems={getRevenueItems()}
                  costOfGoodsItems={{}}
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
                revenueItems={getRevenueItems()}
                onUpdateItem={handleRevenueUpdate}
                totalRevenue={totalRevenue}
                onRenameItem={handleRevenueRename}
                onAddItem={handleAddRevenue}
                onDeleteItem={handleDeleteRevenue}
                subsections={revenueSubsections}
              />
              
              <div className="space-y-6">
                <ExpensesSection 
                  title="CHELTUIELI SALARIALE"
                  items={salaryExpenses}
                  onUpdateItem={handleSalaryUpdate}
                  totalExpenses={totalSalaryExpenses}
                  onRenameItem={handleSalaryRename}
                  onAddItem={handleAddSalary}
                  onDeleteItem={handleDeleteSalary}
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
              <div className="space-y-6">
                
              </div>
              
              <div className="space-y-6">
                <ExpensesSection 
                  title="CHELTUIELI DISTRIBUITORI"
                  items={distributorExpenses}
                  onUpdateItem={handleDistributorUpdate}
                  totalExpenses={totalDistributorExpenses}
                  onRenameItem={handleDistributorRename}
                  onAddItem={handleAddDistributor}
                  onDeleteItem={handleDeleteDistributor}
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
                  onAddItem={(name) => {
                    handleSubsectionAddItem(operationalExpensesSubsections[2].title, name);
                  }}
                  onDeleteItem={handleDeleteOperationalItem}
                  subsections={operationalExpensesSubsections}
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
