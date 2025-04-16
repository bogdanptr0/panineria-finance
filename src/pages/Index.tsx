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
import { useToast } from "@/context/ToastContext";

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
  
  const [barItems, setBarItems] = useState<Record<string, number>>({});
  
  const [subcategories, setSubcategories] = useState<{
    revenueItems?: Record<string, string>;
    expenses?: Record<string, string>;
  }>({
    revenueItems: {},
    expenses: {}
  });
  
  const [deletedBucatarieItems, setDeletedBucatarieItems] = useState<Record<string, number>>({});
  const [deletedBarItems, setDeletedBarItems] = useState<Record<string, number>>({});
  const [deletedSalaryItems, setDeletedSalaryItems] = useState<Record<string, number>>({});
  const [deletedDistributorItems, setDeletedDistributorItems] = useState<Record<string, number>>({});
  const [deletedUtilitiesItems, setDeletedUtilitiesItems] = useState<Record<string, number>>({});
  const [deletedOperationalItems, setDeletedOperationalItems] = useState<Record<string, number>>({});
  const [deletedOtherItems, setDeletedOtherItems] = useState<Record<string, number>>({});
  
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
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    updateAllReportsWithDefaultSalaries();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      const report = await loadReport(selectedMonth);
      if (report) {
        setSubcategories(report.subcategories || { revenueItems: {}, expenses: {} });
        
        const allRevenueItems = report.revenueItems || {};
        
        const bucatarie: Record<string, number> = {};
        const bar: Record<string, number> = {};
        
        const revenueSubcategories = report.subcategories?.revenueItems || {};
        
        Object.entries(allRevenueItems).forEach(([key, value]) => {
          const subcat = revenueSubcategories[key];
          
          if (subcat === 'Bucatarie' || 
             (!subcat && ['Il Classico', 'Il Prosciutto', 'Il Piccante', 'La Porchetta', 'La Mortadella', 'La Buffala', 'Tiramisu', 'Platou'].includes(key))) {
            bucatarie[key] = value;
            if (!subcat) {
              revenueSubcategories[key] = 'Bucatarie';
            }
          } else {
            bar[key] = value;
            if (!subcat) {
              revenueSubcategories[key] = 'Bar';
            }
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
            budget,
            subcategories
          );
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error("Error saving report:", error);
        }
      };
      
      saveData();
    }
  }, [hasUnsavedChanges, selectedMonth, salaryExpenses, distributorExpenses, utilitiesExpenses, operationalExpenses, otherExpenses, budget, subcategories]);

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

  const handleRevenueUpdate = async (name: string, value: number) => {
    if (Object.keys(bucatarieItems).includes(name)) {
      setBucatarieItems(prev => ({ ...prev, [name]: value }));
      await updateItemInSupabase(selectedMonth, 'bucatarieItems', name, value);
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
      
      setSubcategories(prev => {
        const revenueSubcategories = prev.revenueItems || {};
        const subcategory = revenueSubcategories[oldName] || 'Bucatarie';
        
        const newRevenueSubcategories = { ...revenueSubcategories };
        delete newRevenueSubcategories[oldName];
        newRevenueSubcategories[newName] = subcategory;
        
        return {
          ...prev,
          revenueItems: newRevenueSubcategories
        };
      });
      
      await renameItemInSupabase(selectedMonth, 'bucatarieItems', oldName, newName);
    } else if (oldName in barItems) {
      setBarItems(prev => {
        const value = prev[oldName];
        const newItems = { ...prev };
        delete newItems[oldName];
        return { ...newItems, [newName]: value };
      });
      
      setSubcategories(prev => {
        const revenueSubcategories = prev.revenueItems || {};
        const subcategory = revenueSubcategories[oldName] || 'Bar';
        
        const newRevenueSubcategories = { ...revenueSubcategories };
        delete newRevenueSubcategories[oldName];
        newRevenueSubcategories[newName] = subcategory;
        
        return {
          ...prev,
          revenueItems: newRevenueSubcategories
        };
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
    
    setSubcategories(prev => {
      const expenseSubcategories = prev.expenses || {};
      const subcategory = expenseSubcategories[oldName] || 'Utilitati';
      
      const newExpenseSubcategories = { ...expenseSubcategories };
      delete newExpenseSubcategories[oldName];
      newExpenseSubcategories[newName] = subcategory;
      
      return {
        ...prev,
        expenses: newExpenseSubcategories
      };
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
    
    setSubcategories(prev => {
      const expenseSubcategories = prev.expenses || {};
      const subcategory = expenseSubcategories[oldName] || 'Operationale';
      
      const newExpenseSubcategories = { ...expenseSubcategories };
      delete newExpenseSubcategories[oldName];
      newExpenseSubcategories[newName] = subcategory;
      
      return {
        ...prev,
        expenses: newExpenseSubcategories
      };
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
    
    setSubcategories(prev => {
      const expenseSubcategories = prev.expenses || {};
      const subcategory = expenseSubcategories[oldName] || 'Alte Cheltuieli';
      
      const newExpenseSubcategories = { ...expenseSubcategories };
      delete newExpenseSubcategories[oldName];
      newExpenseSubcategories[newName] = subcategory;
      
      return {
        ...prev,
        expenses: newExpenseSubcategories
      };
    });
    
    await renameItemInSupabase(selectedMonth, 'otherExpenses', oldName, newName);
    setHasUnsavedChanges(true);
  };

  const handleAddRevenue = async (name: string, subsectionTitle?: string) => {
    try {
      const category = subsectionTitle === "Bucatarie" ? 'bucatarieItems' : 'barItems';
      
      if (subsectionTitle === "Bucatarie") {
        setBucatarieItems(prev => ({ ...prev, [name]: 0 }));
        
        setSubcategories(prev => {
          const revenueSubcategories = prev.revenueItems || {};
          
          return {
            ...prev,
            revenueItems: {
              ...revenueSubcategories,
              [name]: 'Bucatarie'
            }
          };
        });
        
        await addItemToSupabase(selectedMonth, 'bucatarieItems', name, 0, "Bucatarie");
        
        toast({
          title: "Item added",
          description: `"${name}" has been added to Bucatarie"
        });
      } else if (subsectionTitle === "Bar") {
        setBarItems(prev => ({ ...prev, [name]: 0 }));
        
        setSubcategories(prev => {
          const revenueSubcategories = prev.revenueItems || {};
          
          return {
            ...prev,
            revenueItems: {
              ...revenueSubcategories,
              [name]: 'Bar'
            }
          };
        });
        
        await addItemToSupabase(selectedMonth, 'barItems', name, 0, "Bar");
        
        toast({
          title: "Item added",
          description: `"${name}" has been added to Bar"
        });
      } else {
        setBarItems(prev => ({ ...prev, [name]: 0 }));
        
        setSubcategories(prev => {
          const revenueSubcategories = prev.revenueItems || {};
          
          return {
            ...prev,
            revenueItems: {
              ...revenueSubcategories,
              [name]: 'Bar'
            }
          };
        });
        
        await addItemToSupabase(selectedMonth, 'barItems', name, 0, "Bar");
        
        toast({
          title: "Item added",
          description: `"${name}" has been added to revenue items"
        });
      }
      
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error adding revenue item:", error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive"
      });
    }
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
    
    setSubcategories(prev => {
      const expenseSubcategories = prev.expenses || {};
      
      return {
        ...prev,
        expenses: {
          ...expenseSubcategories,
          [name]: 'Utilitati'
        }
      };
    });
    
    await addItemToSupabase(selectedMonth, 'utilitiesExpenses', name, 0, "Utilitati");
    setHasUnsavedChanges(true);
  };

  const handleAddOperational = async (name: string) => {
    setOperationalExpenses(prev => ({ ...prev, [name]: 0 }));
    
    setSubcategories(prev => {
      const expenseSubcategories = prev.expenses || {};
      
      return {
        ...prev,
        expenses: {
          ...expenseSubcategories,
          [name]: 'Operationale'
        }
      };
    });
    
    await addItemToSupabase(selectedMonth, 'operationalExpenses', name, 0, "Operationale");
    setHasUnsavedChanges(true);
  };

  const handleAddOtherExpenses = async (name: string) => {
    setOtherExpenses(prev => ({ ...prev, [name]: 0 }));
    
    setSubcategories(prev => {
      const expenseSubcategories = prev.expenses || {};
      
      return {
        ...prev,
        expenses: {
          ...expenseSubcategories,
          [name]: 'Alte Cheltuieli'
        }
      };
    });
    
    await addItemToSupabase(selectedMonth, 'otherExpenses', name, 0, "Alte Cheltuieli");
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
        
        setSubcategories(prev => {
          const revenueSubcategories = prev.revenueItems || {};
          const newRevenueSubcategories = { ...revenueSubcategories };
          delete newRevenueSubcategories[name];
          
          return {
            ...prev,
            revenueItems: newRevenueSubcategories
          };
        });
        
        await deleteItemFromSupabase(selectedMonth, 'bucatarieItems', name);
        
        toast({
          title: "Item deleted",
          description: `"${name}" has been removed"
        });
        
        setHasUnsavedChanges(true);
      } else if (Object.keys(barItems).includes(name)) {
        const value = barItems[name];
        
        setBarItems(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        setSubcategories(prev => {
          const revenueSubcategories = prev.revenueItems || {};
          const newRevenueSubcategories = { ...revenueSubcategories };
          delete newRevenueSubcategories[name];
          
          return {
            ...prev,
            revenueItems: newRevenueSubcategories
          };
        });
        
        await deleteItemFromSupabase(selectedMonth, 'barItems', name);
        
        toast({
          title: "Item deleted",
          description: `"${name}" has been removed"
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
        description: `"${name}" has been removed"
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
        description: `"${name}" has been removed"
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
        
        setSubcategories(prev => {
          const expenseSubcategories = prev.expenses || {};
          const newExpenseSubcategories = { ...expenseSubcategories };
          delete newExpenseSubcategories[name];
          
          return {
            ...prev,
            expenses: newExpenseSubcategories
          };
        });
        
        await deleteItemFromSupabase(selectedMonth, 'utilitiesExpenses', name);
        
        toast({
          title: "Utilities item deleted",
          description: `"${name}" has been removed"
        });
        
        setHasUnsavedChanges(true);
      } else if (Object.keys(operationalExpenses).includes(name)) {
        setOperationalExpenses(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        setSubcategories(prev => {
          const expenseSubcategories = prev.expenses || {};
          const newExpenseSubcategories = { ...expenseSubcategories };
          delete newExpenseSubcategories[name];
          
          return {
            ...prev,
            expenses: newExpenseSubcategories
          };
        });
        
        await deleteItemFromSupabase(selectedMonth, 'operationalExpenses', name);
        
        toast({
          title: "Operational item deleted",
          description: `"${name}" has been removed"
        });
        
        setHasUnsavedChanges(true);
      } else if (Object.keys(otherExpenses).includes(name)) {
        setOtherExpenses(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        setSubcategories(prev => {
          const expenseSubcategories = prev.expenses || {};
          const newExpenseSubcategories = { ...expenseSubcategories };
          delete newExpenseSubcategories[name];
          
          return {
            ...prev,
            expenses: newExpenseSubcategories
          };
        });
        
        await deleteItemFromSupabase(selectedMonth, 'otherExpenses', name);
        
        toast({
          title: "Other expense item deleted",
          description: `"${name}" has been removed"
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
                  budget={budget}
                  onBudgetUpdate={(updatedBudget) => {
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
