import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BucatarieSection from "@/components/BucatarieSection";
import TazzSection from "@/components/TazzSection";
import BarSection from "@/components/BarSection";
import ExpensesSection from "@/components/ExpensesSection";
import ProfitSummary from "@/components/ProfitSummary";
import DataVisualization from "@/components/DataVisualization";
import ProductProfitability from "@/components/ProductProfitability";
import LaborAnalysis from "@/components/LaborAnalysis";
import ComparisonView from "@/components/ComparisonView";
import BudgetAnalysis from "@/components/BudgetAnalysis";
import CashFlowProjection from "@/components/CashFlowProjection";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { 
  loadReport, updateAllReportsWithDefaultSalaries, saveReport, 
  deleteItemFromSupabase, addItemToSupabase, updateItemInSupabase, renameItemInSupabase,
  DEFAULT_BUCATARIE_ITEMS, DEFAULT_TAZZ_ITEMS, DEFAULT_BAR_ITEMS, handleAddRevenueItem
} from "@/lib/persistence";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RequireAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState<boolean>(false);
  
  const [bucatarieItems, setBucatarieItems] = useState<Record<string, number>>(DEFAULT_BUCATARIE_ITEMS);
  const [tazzItems, setTazzItems] = useState<Record<string, number>>(DEFAULT_TAZZ_ITEMS);
  const [barItems, setBarItems] = useState<Record<string, number>>(DEFAULT_BAR_ITEMS);
  
  const [deletedBucatarieItems, setDeletedBucatarieItems] = useState<Record<string, number>>({});
  const [deletedTazzItems, setDeletedTazzItems] = useState<Record<string, number>>({});
  const [deletedBarItems, setDeletedBarItems] = useState<Record<string, number>>({});
  const [deletedSalaryItems, setDeletedSalaryItems] = useState<Record<string, number>>({});
  const [deletedDistributorItems, setDeletedDistributorItems] = useState<Record<string, number>>({});
  const [deletedUtilitiesItems, setDeletedUtilitiesItems] = useState<Record<string, number>>({});
  const [deletedOperationalItems, setDeletedOperationalItems] = useState<Record<string, number>>({});
  const [deletedOtherItems, setDeletedOtherItems] = useState<Record<string, number>>({});
  
  const getRevenueItems = (): Record<string, number> => {
    const result: Record<string, number> = {};
    
    Object.entries(bucatarieItems).forEach(([key, value]) => {
      result[key] = value;
    });
    
    Object.entries(tazzItems).forEach(([key, value]) => {
      result[key] = value;
    });
    
    Object.entries(barItems).forEach(([key, value]) => {
      result[key] = value;
    });
    
    return result;
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
        setBucatarieItems(report.bucatarieItems || DEFAULT_BUCATARIE_ITEMS);
        setTazzItems(report.tazzItems || DEFAULT_TAZZ_ITEMS);
        setBarItems(report.barItems || DEFAULT_BAR_ITEMS);
        
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
  }, [hasUnsavedChanges, selectedMonth, bucatarieItems, tazzItems, barItems, salaryExpenses, distributorExpenses, utilitiesExpenses, operationalExpenses, otherExpenses, budget]);

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
    const isBucatarieItem = Object.keys(bucatarieItems).includes(name);
    const isTazzItem = Object.keys(tazzItems).includes(name);
    const isBarItem = Object.keys(barItems).includes(name);
    
    if (isBucatarieItem) {
      setBucatarieItems(prev => ({ ...prev, [name]: value }));
      await updateItemInSupabase(selectedMonth, 'bucatarieItems', name, value);
    } else if (isTazzItem) {
      setTazzItems(prev => ({ ...prev, [name]: value }));
      await updateItemInSupabase(selectedMonth, 'tazzItems', name, value);
    } else if (isBarItem) {
      setBarItems(prev => ({ ...prev, [name]: value }));
      await updateItemInSupabase(selectedMonth, 'barItems', name, value);
    } else {
      console.warn("Item not found in any subcategory:", name);
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
    
    const isBucatarieItem = oldName in bucatarieItems;
    const isTazzItem = oldName in tazzItems;
    const isBarItem = oldName in barItems;
    
    if (isBucatarieItem) {
      setBucatarieItems(prev => {
        const value = prev[oldName];
        const newItems = { ...prev };
        delete newItems[oldName];
        return { ...newItems, [newName]: value };
      });
      
      await renameItemInSupabase(selectedMonth, 'bucatarieItems', oldName, newName);
    } else if (isTazzItem) {
      setTazzItems(prev => {
        const value = prev[oldName];
        const newItems = { ...prev };
        delete newItems[oldName];
        return { ...newItems, [newName]: value };
      });
      
      await renameItemInSupabase(selectedMonth, 'tazzItems', oldName, newName);
    } else if (isBarItem) {
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
      const success = await handleAddRevenueItem(selectedMonth, 'bucatarieItems', name, 0);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to add item to Bucatarie. Please try again.",
          variant: "destructive"
        });
      }
    } else if (subsectionTitle === "Tazz") {
      setTazzItems(prev => ({ ...prev, [name]: 0 }));
      const success = await handleAddRevenueItem(selectedMonth, 'tazzItems', name, 0);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to add item to Tazz. Please try again.",
          variant: "destructive"
        });
      }
    } else if (subsectionTitle === "Bar") {
      setBarItems(prev => ({ ...prev, [name]: 0 }));
      const success = await handleAddRevenueItem(selectedMonth, 'barItems', name, 0);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to add item to Bar. Please try again.",
          variant: "destructive"
        });
      }
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
      const isBucatarieItem = Object.keys(bucatarieItems).includes(name);
      const isTazzItem = Object.keys(tazzItems).includes(name);
      const isBarItem = Object.keys(barItems).includes(name);
      
      if (isBucatarieItem) {
        setBucatarieItems(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        await deleteItemFromSupabase(selectedMonth, 'bucatarieItems', name);
        
        toast({
          title: "Item deleted",
          description: `"${name}" has been removed from Bucatarie`
        });
      } else if (isTazzItem) {
        setTazzItems(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        await deleteItemFromSupabase(selectedMonth, 'tazzItems', name);
        
        toast({
          title: "Item deleted",
          description: `"${name}" has been removed from Tazz`
        });
      } else if (isBarItem) {
        setBarItems(prev => {
          const newItems = { ...prev };
          delete newItems[name];
          return newItems;
        });
        
        await deleteItemFromSupabase(selectedMonth, 'barItems', name);
        
        toast({
          title: "Item deleted",
          description: `"${name}" has been removed from Bar`
        });
      }
      
      setHasUnsavedChanges(true);
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

  const handleAddBucatarieItem = async (name: string) => {
    setBucatarieItems(prev => ({ ...prev, [name]: 0 }));
    const success = await handleAddRevenueItem(selectedMonth, 'bucatarieItems', name, 0);
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to add item to Bucatarie. Please try again.",
        variant: "destructive"
      });
    }
    setHasUnsavedChanges(true);
  };

  const handleAddTazzItem = async (name: string) => {
    setTazzItems(prev => ({ ...prev, [name]: 0 }));
    const success = await handleAddRevenueItem(selectedMonth, 'tazzItems', name, 0);
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to add item to Tazz. Please try again.",
        variant: "destructive"
      });
    }
    setHasUnsavedChanges(true);
  };

  const handleAddBarItem = async (name: string) => {
    setBarItems(prev => ({ ...prev, [name]: 0 }));
    const success = await handleAddRevenueItem(selectedMonth, 'barItems', name, 0);
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to add item to Bar. Please try again.",
        variant: "destructive"
      });
    }
    setHasUnsavedChanges(true);
  };

  const handleBucatarieRename = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setBucatarieItems(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
    
    await renameItemInSupabase(selectedMonth, 'bucatarieItems', oldName, newName);
    setHasUnsavedChanges(true);
  };

  const handleTazzRename = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setTazzItems(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
    
    await renameItemInSupabase(selectedMonth, 'tazzItems', oldName, newName);
    setHasUnsavedChanges(true);
  };

  const handleBarRename = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    setBarItems(prev => {
      const value = prev[oldName];
      const newItems = { ...prev };
      delete newItems[oldName];
      return { ...newItems, [newName]: value };
    });
    
    await renameItemInSupabase(selectedMonth, 'barItems', oldName, newName);
    setHasUnsavedChanges(true);
  };

  const handleDeleteBucatarieItem = async (name: string) => {
    try {
      setBucatarieItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      await deleteItemFromSupabase(selectedMonth, 'bucatarieItems', name);
      
      toast({
        title: "Item deleted",
        description: `"${name}" has been removed from Bucatarie`
      });
      
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTazzItem = async (name: string) => {
    try {
      setTazzItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      await deleteItemFromSupabase(selectedMonth, 'tazzItems', name);
      
      toast({
        title: "Item deleted",
        description: `"${name}" has been removed from Tazz`
      });
      
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBarItem = async (name: string) => {
    try {
      setBarItems(prev => {
        const newItems = { ...prev };
        delete newItems[name];
        return newItems;
      });
      
      await deleteItemFromSupabase(selectedMonth, 'barItems', name);
      
      toast({
        title: "Item deleted",
        description: `"${name}" has been removed from Bar`
      });
      
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error deleting item:", error);
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
          />

          <Tabs defaultValue="summary" className="print:hidden">
            <TabsList className="grid grid-cols-2 mb-8 w-full md:w-[600px] mx-auto">
              <TabsTrigger value="summary">Basic Report</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
                <div className="space-y-6">
                  <BucatarieSection 
                    bucatarieItems={bucatarieItems}
                    onUpdateItem={handleRevenueUpdate}
                    totalRevenue={totalBucatarieRevenue}
                    onRenameItem={handleBucatarieRename}
                    onAddItem={handleAddBucatarieItem}
                    onDeleteItem={handleDeleteBucatarieItem}
                  />
                  
                  <TazzSection 
                    tazzItems={tazzItems}
                    onUpdateItem={handleRevenueUpdate}
                    totalRevenue={totalTazzRevenue}
                    onRenameItem={handleTazzRename}
                    onAddItem={handleAddTazzItem}
                    onDeleteItem={handleDeleteTazzItem}
                  />
                  
                  <BarSection 
                    barItems={barItems}
                    onUpdateItem={handleRevenueUpdate}
                    totalRevenue={totalBarRevenue}
                    onRenameItem={handleBarRename}
                    onAddItem={handleAddBarItem}
                    onDeleteItem={handleDeleteBarItem}
                  />
                  
                  <div className="bg-gray-100 p-4 rounded-md print:break-after-page">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-lg">TOTAL INCASARI</span>
                      <span className="text-lg">{formatCurrency(totalRevenue)}</span>
                    </div>
                  </div>
                  
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
