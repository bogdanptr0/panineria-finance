import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  loadReport, 
  updateAllReportsWithDefaultSalaries, 
  saveReport, 
  deleteItemFromSupabase, 
  addItemToSupabase, 
  updateItemInSupabase, 
  renameItemInSupabase 
} from "@/lib/persistence";

interface ReportContextType {
  // State
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  bucatarieItems: Record<string, number>;
  barItems: Record<string, number>;
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  utilitiesExpenses: Record<string, number>;
  operationalExpenses: Record<string, number>;
  otherExpenses: Record<string, number>;
  budget?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  };
  subcategories: {
    revenueItems?: Record<string, string>;
    expenses?: Record<string, string>;
  };
  
  // Calculated values
  totalBucatarieRevenue: number;
  totalBarRevenue: number;
  totalRevenue: number;
  totalSalaryExpenses: number;
  totalDistributorExpenses: number;
  totalUtilitiesExpenses: number;
  totalOperationalExpenses: number;
  totalOtherExpenses: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  
  // Functions
  getRevenueItems: () => Record<string, number>;
  handleRevenueUpdate: (name: string, value: number) => Promise<void>;
  handleSalaryUpdate: (name: string, value: number) => Promise<void>;
  handleDistributorUpdate: (name: string, value: number) => Promise<void>;
  handleUtilitiesUpdate: (name: string, value: number) => Promise<void>;
  handleOperationalUpdate: (name: string, value: number) => Promise<void>;
  handleOtherExpensesUpdate: (name: string, value: number) => Promise<void>;
  handleRevenueRename: (oldName: string, newName: string) => Promise<void>;
  handleSalaryRename: (oldName: string, newName: string) => Promise<void>;
  handleDistributorRename: (oldName: string, newName: string) => Promise<void>;
  handleUtilitiesRename: (oldName: string, newName: string) => Promise<void>;
  handleOperationalRename: (oldName: string, newName: string) => Promise<void>;
  handleOtherExpensesRename: (oldName: string, newName: string) => Promise<void>;
  handleAddRevenue: (name: string, subsectionTitle?: string) => Promise<void>;
  handleAddSalary: (name: string) => Promise<void>;
  handleAddDistributor: (name: string) => Promise<void>;
  handleAddUtilities: (name: string) => Promise<void>;
  handleAddOperational: (name: string) => Promise<void>;
  handleAddOtherExpenses: (name: string) => Promise<void>;
  handleDeleteRevenue: (name: string) => Promise<void>;
  handleDeleteSalary: (name: string) => Promise<void>;
  handleDeleteDistributor: (name: string) => Promise<void>;
  handleDeleteOperationalItem: (name: string) => Promise<void>;
  handleSubsectionAddItem: (subsectionTitle: string, name: string) => Promise<void>;
  updateBudget: (updatedBudget: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  }) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider = ({ children }: ReportProviderProps) => {
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
  
  const [barItems, setBarItems] = useState<Record<string, number>>({
    "Espresso": 0,
    "Cappuccino": 0,
    "Aperol Spritz": 0,
    "Hugo": 0,
    "Vin roșu": 0,
    "Vin alb": 0,
    "Bere": 0,
    "Apa plată": 0,
    "Apa minerală": 0
  });
  
  const [subcategories, setSubcategories] = useState<{
    revenueItems?: Record<string, string>;
    expenses?: Record<string, string>;
  }>({
    revenueItems: {
      "Il Classico": "Bucatarie",
      "Il Prosciutto": "Bucatarie",
      "Il Piccante": "Bucatarie",
      "La Porchetta": "Bucatarie",
      "La Mortadella": "Bucatarie",
      "La Buffala": "Bucatarie",
      "Tiramisu": "Bucatarie",
      "Platou": "Bucatarie",
      "Espresso": "Bar",
      "Cappuccino": "Bar",
      "Aperol Spritz": "Bar",
      "Hugo": "Bar",
      "Vin roșu": "Bar",
      "Vin alb": "Bar",
      "Bere": "Bar",
      "Apa plată": "Bar",
      "Apa minerală": "Bar"
    },
    expenses: {}
  });
  
  const [deletedBucatarieItems, setDeletedBucatarieItems] = useState<Record<string, number>>({});
  const [deletedBarItems, setDeletedBarItems] = useState<Record<string, number>>({});
  const [deletedSalaryItems, setDeletedSalaryItems] = useState<Record<string, number>>({});
  const [deletedDistributorItems, setDeletedDistributorItems] = useState<Record<string, number>>({});
  const [deletedUtilitiesItems, setDeletedUtilitiesItems] = useState<Record<string, number>>({});
  const [deletedOperationalItems, setDeletedOperationalItems] = useState<Record<string, number>>({});
  const [deletedOtherItems, setDeletedOtherItems] = useState<Record<string, number>>({});
  
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
        setSubcategories(report.subcategories || { 
          revenueItems: {
            "Il Classico": "Bucatarie",
            "Il Prosciutto": "Bucatarie",
            "Il Piccante": "Bucatarie",
            "La Porchetta": "Bucatarie",
            "La Mortadella": "Bucatarie",
            "La Buffala": "Bucatarie",
            "Tiramisu": "Bucatarie",
            "Platou": "Bucatarie",
            "Espresso": "Bar",
            "Cappuccino": "Bar",
            "Aperol Spritz": "Bar",
            "Hugo": "Bar",
            "Vin roșu": "Bar",
            "Vin alb": "Bar",
            "Bere": "Bar",
            "Apa plată": "Bar",
            "Apa minerală": "Bar"
          }, 
          expenses: {} 
        });
        
        const defaultBucatarieItems = {
          "Il Classico": 0,
          "Il Prosciutto": 0,
          "Il Piccante": 0,
          "La Porchetta": 0,
          "La Mortadella": 0,
          "La Buffala": 0,
          "Tiramisu": 0,
          "Platou": 0
        };
        
        const mergedBucatarieItems = {
          ...defaultBucatarieItems,
          ...(report.bucatarieItems || {})
        };
        
        setBucatarieItems(mergedBucatarieItems);
        
        const defaultBarItems = {
          "Espresso": 0,
          "Cappuccino": 0,
          "Aperol Spritz": 0,
          "Hugo": 0,
          "Vin roșu": 0,
          "Vin alb": 0,
          "Bere": 0,
          "Apa plată": 0,
          "Apa minerală": 0
        };
        
        const mergedBarItems = {
          ...defaultBarItems,
          ...(report.barItems || {})
        };
        
        setBarItems(mergedBarItems);
        
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
            subcategories,
            bucatarieItems,
            barItems
          );
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error("Error saving report:", error);
        }
      };
      
      saveData();
    }
  }, [hasUnsavedChanges, selectedMonth, bucatarieItems, barItems, salaryExpenses, distributorExpenses, utilitiesExpenses, operationalExpenses, otherExpenses, budget, subcategories]);

  const calculateTotal = (items: Record<string, number>) => {
    return Object.values(items).reduce((sum, value) => sum + value, 0);
  };

  const getRevenueItems = (): Record<string, number> => {
    return { ...bucatarieItems, ...barItems };
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
        
        setSubcategories(prev => ({
          ...prev,
          revenueItems: {
            ...(prev.revenueItems || {}),
            [name]: 'Bucatarie'
          }
        }));
        
        await addItemToSupabase(selectedMonth, 'bucatarieItems', name, 0, "Bucatarie");
        
        toast({
          title: "Item added",
          description: `"${name}" has been added to Bucatarie"
        });
      } else if (subsectionTitle === "Bar") {
        setBarItems(prev => ({ ...prev, [name]: 0 }));
        
        setSubcategories(prev => ({
          ...prev,
          revenueItems: {
            ...(prev.revenueItems || {}),
            [name]: 'Bar'
          }
        }));
        
        await addItemToSupabase(selectedMonth, 'barItems', name, 0, "Bar");
        
        toast({
          title: "Item added",
          description: `"${name}" has been added to Bar"
        });
      } else {
        setBarItems(prev => ({ ...prev, [name]: 0 }));
        
        setSubcategories(prev => ({
          ...prev,
          revenueItems: {
            ...(prev.revenueItems || {}),
            [name]: 'Bar'
          }
        }));
        
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
          description: `"${name}" has been removed`
        });
      } else if (Object.keys(barItems).includes(name)) {
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
          description: `"${name}" has been removed`
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
          description: `"${name}" has been removed`
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
          description: `"${name}" has been removed`
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

  const handleSubsectionAddItem = async (subsectionTitle: string, name: string) => {
    if (subsectionTitle === "Utilitati") {
      await handleAddUtilities(name);
    } else if (subsectionTitle === "Operationale") {
      await handleAddOperational(name);
    } else if (subsectionTitle === "Alte Cheltuieli") {
      await handleAddOtherExpenses(name);
    }
  };

  const updateBudget = (updatedBudget: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  }) => {
    setBudget(updatedBudget);
    setHasUnsavedChanges(true);
  };

  const value = {
    // State
    selectedMonth,
    setSelectedMonth,
    bucatarieItems,
    barItems,
    salaryExpenses,
    distributorExpenses,
    utilitiesExpenses,
    operationalExpenses,
    otherExpenses,
    budget,
    subcategories,
    
    // Calculated values
    totalBucatarieRevenue,
    totalBarRevenue,
    totalRevenue,
    totalSalaryExpenses,
    totalDistributorExpenses,
    totalUtilitiesExpenses,
    totalOperationalExpenses,
    totalOtherExpenses,
    totalExpenses,
    grossProfit,
    netProfit,
    
    // Functions
    getRevenueItems,
    handleRevenueUpdate,
    handleSalaryUpdate,
    handleDistributorUpdate,
    handleUtilitiesUpdate,
    handleOperationalUpdate,
    handleOtherExpensesUpdate,
    handleRevenueRename,
    handleSalaryRename,
    handleDistributorRename,
    handleUtilitiesRename,
    handleOperationalRename,
    handleOtherExpensesRename,
    handleAddRevenue,
    handleAddSalary,
    handleAddDistributor,
    handleAddUtilities,
    handleAddOperational,
    handleAddOtherExpenses,
    handleDeleteRevenue,
    handleDeleteSalary,
    handleDeleteDistributor,
    handleDeleteOperationalItem,
    handleSubsectionAddItem,
    updateBudget
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
};
