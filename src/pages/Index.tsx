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
import { loadReport, updateAllReportsWithDefaultSalaries, saveReport, 
  deleteItemFromSupabase, addItemToSupabase, updateItemInSupabase, renameItemInSupabase } from "@/lib/persistence";
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
  
  const [tazzItems, setTazzItems] = useState<Record<string, number>>({
    "[MINI] Il Classico": 0,
    "[MINI] Il Prosciutto": 0,
    "[MINI] Il Piccante": 0,
    "[MINI] La Porchetta": 0,
    "[MINI] La Mortadella": 0,
    "[MINI] La Buffala": 0,
    "Il Classico": 0,
    "Il Prosciutto": 0,
    "Il Piccante": 0,
    "La Porchetta": 0,
    "La Mortadella": 0,
    "La Buffala": 0,
    "Tiramisu": 0,
    "Apa plata - 0,5": 0,
    "Apa minerala - 0,5": 0,
    "Coca Cola": 0,
    "Coca Cola Zero": 0,
    "Sprite": 0,
    "Fanta": 0,
    "Bere Peroni 0% alcool": 0
  });
  
  const [deletedBucatarieItems, setDeletedBucatarieItems] = useState<Record<string, number>>({});
  const [deletedTazzItems, setDeletedTazzItems] = useState<Record<string, number>>({});
  const [deletedBarItems, setDeletedBarItems] = useState<Record<string, number>>({});
  const [deletedSalaryItems, setDeletedSalaryItems] = useState<Record<string, number>>({});
  const [deletedDistributorItems, setDeletedDistributorItems] = useState<Record<string, number>>({});
  const [deletedUtilitiesItems, setDeletedUtilitiesItems] = useState<Record<string, number>>({});
  const [deletedOperationalItems, setDeletedOperationalItems] = useState<Record<string, number>>({});
  const [deletedOtherItems, setDeletedOtherItems] = useState<Record<string, number>>({});
  
  const [barItems, setBarItems] = useState<Record<string, number>>({});
  
  const getRevenueItems = (): Record<string, number> => {
    return { ...bucatarieItems, ...tazzItems, ...barItems };
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
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    updateAllReportsWithDefaultSalaries();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      const report = await loadReport(selectedMonth);
      if (report) {
        const bucatarie: Record<string, number> = {};
        const tazz: Record<string, number> = {};
        const bar: Record<string, number> = {};
        
        const bucatarieKeys = [
          "Il Classico", "Il Prosciutto", "Il Piccante", 
          "La Porchetta", "La Mortadella", "La Buffala", 
          "Tiramisu", "Platou"
        ];
        
        const tazzKeys = [
          "[MINI] Il Classico", "[MINI] Il Prosciutto", "[MINI] Il Piccante",
          "[MINI] La Porchetta", "[MINI] La Mortadella", "[MINI] La Buffala",
          "Il Classico", "Il Prosciutto", "Il Piccante",
          "La Porchetta", "La Mortadella", "La Buffala",
          "Tiramisu", "Apa plata - 0,5", "Apa minerala - 0,5",
          "Coca Cola", "Coca Cola Zero", "Sprite", "Fanta", 
          "Bere Peroni 0% alcool"
        ];
        
        Object.entries(report.revenueItems).forEach(([key, value]) => {
          if (bucatarieKeys.includes(key)) {
            bucatarie[key] = value;
          } else if (tazzKeys.includes(key)) {
            tazz[key] = value;
          } else {
            bar[key] = value;
          }
        });
        
        setBucatarieItems(bucatarie);
        setTazzItems(tazz);
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
        
        setDeletedTazzItems({});
        setDeletedBucatarieItems({});
        setDeletedBarItems({});
        setDeletedSalaryItems({});
        setDeletedDistributorItems({});
        setDeletedUtilitiesItems({});
        setDeletedOperationalItems({});
        setDeletedOtherItems({});
        
        setHasUnsavedChanges(false);
      }
    };
    
    fetchReport();
  }, [selectedMonth]);
  
  useEffect(() => {
    if (hasUnsavedChanges) {
      const saveData = async () => {
        try {
          await saveReport(
            selectedMonth,
            getRevenueItems(),
            {},
            salaryExpenses,
            distributorExpenses,
            utilitiesExpenses,
            operationalExpenses,
            otherExpenses,
            budget
          );
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error("Error saving report:", error);
        }
      };
      
      saveData();
    }
  }, [hasUnsavedChanges, selectedMonth, salaryExpenses, distributorExpenses, utilitiesExpenses, operationalExpenses, otherExpenses, budget]);

  const calculateTotal = (items: Record<string, number>) => {
    return Object.values(items).reduce((sum, value) => sum + value, 0);
  };

  const totalBucatarieRevenue = calculateTotal(bucatarieItems);
  const totalTazzRevenue = calculateTotal(tazzItems);
  const totalBarRevenue = calculateTotal(barItems);
  const totalRevenue = totalBucatarieRevenue + totalTazzRevenue + totalBarRevenue;
  const totalSalaryExpenses = calculateTotal(salaryExpenses);
  const totalDistributorExpenses = calculateTotal(distributorExpenses);
  const totalUtilitiesExpenses = calculateTotal(utilitiesExpenses);
  const totalOperationalExpenses = calculateTotal(operationalExpenses);
  const totalOtherExpenses = calculateTotal(otherExpenses);
  const totalExpenses = totalSalaryExpenses + totalDistributorExpenses + 
                         totalUtilitiesExpenses + totalOperationalExpenses + totalOtherExpenses;
  
  const grossProfit = totalRevenue;
  const netProfit = grossProfit - totalExpenses;

  const handleRevenueUpdate = async (name: string, value: number) => {
    if (Object.keys(bucatarieItems).includes(name)) {
      setBucatarieItems(prev => ({ ...prev, [name]: value }));
      await updateItemInSupabase(selectedMonth, 'bucatarieItems', name, value);
    } else if (Object.keys(tazzItems).includes(name)) {
      setTazzItems(prev => ({ ...prev, [name]: value }));
      await updateItemInSupabase(selectedMonth, 'tazzItems', name, value);
    } else {
      setBarItems(prev => ({ ...prev, [name]: value }));
      await updateItemInSupabase(selectedMonth, 'barItems', name, value);
    }
    setHasUnsavedChanges(true);
  };

  const handleSalaryUpdate = async (name: string, value: number) => {
    setSalaryExpenses(prev => ({ ...prev, [name]: value }));
    await updateItemInSupabase(selectedMonth, 'salaryExpenses', name, value);
    setHasUnsavedChanges(true);
  };

  const handleDistributorUpdate = async (name: string, value: number) => {
    setDistributorExpenses(prev => ({ ...prev, [name]: value }));
    await updateItemInSupabase(selectedMonth, 'distributorExpenses', name, value);
    setHasUnsavedChanges(true);
  };

  const handleUtilitiesUpdate = async (name: string, value: number) => {
    setUtilitiesExpenses(prev => ({ ...prev, [name]: value }));
    await updateItemInSupabase(selectedMonth, 'utilitiesExpenses', name, value);
    setHasUnsavedChanges(true);
  };

  const handleOperationalUpdate = async (name: string, value: number) => {
    setOperationalExpenses(prev => ({ ...prev, [name]: value }));
    await updateItemInSupabase(selectedMonth, 'operationalExpenses', name, value);
    setHasUnsavedChanges(true);
  };

  const handleOtherExpensesUpdate = async (name: string, value: number) => {
    setOtherExpenses(prev => ({ ...prev, [name]: value }));
    await updateItemInSupabase(selectedMonth, 'otherExpenses', name, value);
    setHasUnsavedChanges(true);
  };

  const handleRevenueRename = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    if (oldName in bucatarieItems) {
      setBucatarieItems(prev => {
        const value = prev[oldName];
        const newItems = { ...prev };
        delete newItems[oldName];
        return { ...newItems, [newName]: value };
      });
      
      await renameItemInSupabase(selectedMonth, 'bucatarieItems', oldName, newName);
    } else if (oldName in tazzItems) {
      setTazzItems(prev => {
        const value = prev[oldName];
        const newItems = { ...prev };
        delete newItems[oldName];
        return { ...newItems, [newName]: value };
      });
      
      await renameItemInSupabase(selectedMonth, 'tazzItems', oldName, newName);
    } else if (oldName in barItems) {
      setBarItems(prev => {
        const value = prev[oldName];
        const newItems = { ...prev };
        delete newItems[oldName];
        return { ...newItems, [newName]: value };
      });
      
      await renameItemInSupabase(selectedMonth, 'barItems', oldName, newName);
    }
    setHasUnsavedChanges(true);
  };

  const handleSalaryRename = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setSalaryExpenses(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
    await renameItemInSupabase(selectedMonth, 'salaryExpenses', oldName, newName);
    setHasUnsavedChanges(true);
  };

  const handleDistributorRename = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setDistributorExpenses(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
    await renameItemInSupabase(selectedMonth, 'distributorExpenses', oldName, newName);
    setHasUnsavedChanges(true);
  };

  const handleUtilitiesRename = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setUtilitiesExpenses(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
    await renameItemInSupabase(selectedMonth, 'utilitiesExpenses', oldName, newName);
    setHasUnsavedChanges(true);
  };

  const handleOperationalRename = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setOperationalExpenses(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
    await renameItemInSupabase(selectedMonth, 'operationalExpenses', oldName, newName);
    setHasUnsavedChanges(true);
  };

  const handleOtherExpensesRename = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setOtherExpenses(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
    await renameItemInSupabase(selectedMonth, 'otherExpenses', oldName, newName);
    setHasUnsavedChanges(true);
  };

  const handleAddRevenue = async (name: string, subsectionTitle?: string) => {
    if (subsectionTitle === "Bucatarie") {
      setBucatarieItems(prev => ({ ...prev, [name]: 0 }));
      await addItemToSupabase(selectedMonth, 'bucatarieItems', name, 0);
    } else if (subsectionTitle === "Tazz") {
      setTazzItems(prev => ({ ...prev, [name]: 0 }));
      await addItemToSupabase(selectedMonth, 'tazzItems', name, 0);
    } else if (subsectionTitle === "Bar") {
      setBarItems(prev => ({ ...prev, [name]: 0 }));
      await addItemToSupabase(selectedMonth, 'barItems', name, 0);
    }
    setHasUnsavedChanges(true);
  };

  const handleAddSalary = async (name: string) => {
    setSalaryExpenses(prev => ({ ...prev, [name]: 0 }));
    await addItemToSupabase(selectedMonth, 'salaryExpenses', name, 0);
    setHasUnsavedChanges(true);
  };

  const handleAddDistributor = async (name: string) => {
    setDistributorExpenses(prev => ({ ...prev, [name]: 0 }));
    await addItemToSupabase(selectedMonth, 'distributorExpenses', name, 0);
    setHasUnsavedChanges(true);
  };

  const handleAddUtilities = async (name: string) => {
    setUtilitiesExpenses(prev => ({ ...prev, [name]: 0 }));
    await addItemToSupabase(selectedMonth, 'utilitiesExpenses', name, 0);
    setHasUnsavedChanges(true);
  };

  const handleAddOperational = async (name: string) => {
    setOperationalExpenses(prev => ({ ...prev, [name]: 0 }));
    await addItemToSupabase(selectedMonth, 'operationalExpenses', name, 0);
    setHasUnsavedChanges(true);
  };

  const handleAddOtherExpenses = async (name: string) => {
    setOtherExpenses(prev => ({ ...prev, [name]: 0 }));
    await addItemToSupabase(selectedMonth, 'otherExpenses', name, 0);
    setHasUnsavedChanges(true);
  };

  const handleDeleteRevenue = async (name: string) => {
    try {
      if (Object.keys(bucatarieItems).includes(name)) {
        const value = bucatarieItems[name];
        
        setBucatarieItems(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        await deleteItemFromSupabase(selectedMonth, 'bucatarieItems', name);
        
        toast({
          title: "Item deleted",
          description: `"${name}" has been removed`
        });
        
        setHasUnsavedChanges(true);
      } else if (Object.keys(tazzItems).includes(name)) {
        const value = tazzItems[name];
        
        setTazzItems(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        await deleteItemFromSupabase(selectedMonth, 'tazzItems', name);
        
        toast({
          title: "Item deleted",
          description: `"${name}" has been removed`
        });
        
        setHasUnsavedChanges(true);
      } else if (Object.keys(barItems).includes(name)) {
        const value = barItems[name];
        
        setBarItems(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        await deleteItemFromSupabase(selectedMonth, 'barItems', name);
        
        toast({
          title: "Item deleted",
          description: `"${name}" has been removed`
        });
        
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSalary = async (name: string) => {
    try {
      const value = salaryExpenses[name];
      
      setSalaryExpenses(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      await deleteItemFromSupabase(selectedMonth, 'salaryExpenses', name);
      
      toast({
        title: "Salary item deleted",
        description: `"${name}" has been removed`
      });
      
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error deleting salary item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDistributor = async (name: string) => {
    try {
      const value = distributorExpenses[name];
      
      setDistributorExpenses(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      await deleteItemFromSupabase(selectedMonth, 'distributorExpenses', name);
      
      toast({
        title: "Distributor item deleted",
        description: `"${name}" has been removed`
      });
      
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error deleting distributor item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOperationalItem = async (name: string) => {
    try {
      if (Object.keys(utilitiesExpenses).includes(name)) {
        setUtilitiesExpenses(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        await deleteItemFromSupabase(selectedMonth, 'utilitiesExpenses', name);
        
        toast({
          title: "Utilities item deleted",
          description: `"${name}" has been removed`
        });
        
        setHasUnsavedChanges(true);
      } else if (Object.keys(operationalExpenses).includes(name)) {
        setOperationalExpenses(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        await deleteItemFromSupabase(selectedMonth, 'operationalExpenses', name);
        
        toast({
          title: "Operational item deleted",
          description: `"${name}" has been removed`
        });
        
        setHasUnsavedChanges(true);
      } else if (Object.keys(otherExpenses).includes(name)) {
        setOtherExpenses(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        await deleteItemFromSupabase(selectedMonth, 'otherExpenses', name);
        
        toast({
          title: "Other expense item deleted",
          description: `"${name}" has been removed`
        });
        
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error("Error deleting operational item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
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
      title: "Tazz",
      items: Object.keys(tazzItems)
    },
    {
      title: "Bar",
      items: Object.keys(barItems)
    }
  ];

  const handleSubsectionAddItem = async (subsectionTitle: string, name: string) => {
    if (subsectionTitle === "Utilitati") {
      await handleAddUtilities(name);
    } else if (subsectionTitle === "Operationale") {
      await handleAddOperational(name);
    } else if (subsectionTitle === "Alte Cheltuieli") {
      await handleAddOtherExpenses(name);
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
                      handleSubsectionAddItem(subsectionTitle || "Alte Cheltuieli", name);
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
                  operationalExpenses={operationalExpenses}
                  budget={budget}
                  onBudgetSave={(updatedBudget) => {
                    setBudget(updatedBudget);
                    setHasUnsavedChanges(true);
                  }}
                />
                
                <CashFlowProjection 
                  currentRevenue={totalRevenue}
                  currentExpenses={totalExpenses}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RequireAuth>
  );
};

export default Index;
