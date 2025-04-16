
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface PLReport {
  date: string;
  revenueItems: Record<string, number>;
  costOfGoodsItems: Record<string, number>;
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
}

const STORAGE_KEY = 'panini_pl_reports';

// Default revenue items that should be present in all reports
const DEFAULT_REVENUE_ITEMS = {
  "Il Classico": 0,
  "Il Prosciutto": 0,
  "Il Piccante": 0,
  "La Porchetta": 0,
  "La Mortadella": 0,
  "La Buffala": 0,
  "Tiramisu": 0,
  "Platou": 0
};

// Default salary expenses that should be present in all reports
const DEFAULT_SALARY_EXPENSES = {
  "Adi": 4050,
  "Ioana": 4050,
  "Andreea": 4050,
  "Victoria": 4050
};

// Default distributor expenses that should be present in all reports
const DEFAULT_DISTRIBUTOR_EXPENSES = {
  "Maria FoodNova": 0,
  "CocaCola": 0,
  "24H": 0,
  "Sinless": 0,
  "Peroni": 0,
  "Sudavangarde(Brutarie Foccacia)": 0,
  "Proporzioni": 0,
  "LIDL": 0,
  "Metro": 0
};

// Default utilities expenses
const DEFAULT_UTILITIES_EXPENSES = {
  "Gaze(Engie)": 0,
  "Apa": 0,
  "Curent": 0,
  "Gunoi(Iridex)": 0,
  "Internet": 0
};

// Default operational expenses
const DEFAULT_OPERATIONAL_EXPENSES = {
  "Contabilitate": 0,
  "ECR": 0,
  "ISU": 0,
  "Chirie": 0,
  "Protectia Muncii": 0
};

// Process data from Supabase to ensure it matches the expected types
const processSupabaseData = (data: any): Record<string, number> => {
  if (!data) return {};
  
  // If it's already an object with the right structure, return it
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const result: Record<string, number> = {};
    
    // Convert all values to numbers
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        result[key] = typeof value === 'number' ? value : parseFloat(value) || 0;
      }
    }
    
    return result;
  }
  
  // If we can't process it, return an empty object
  return {};
};

export const saveReport = async (selectedMonth: Date, data: Omit<PLReport, 'date'>): Promise<void> => {
  try {
    // Create date key in format YYYY-MM
    const dateKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    
    // Ensure the report has the default items
    const revenueItems = {
      ...DEFAULT_REVENUE_ITEMS,
      ...data.revenueItems
    };
    
    const salaryExpenses = {
      ...DEFAULT_SALARY_EXPENSES,
      ...data.salaryExpenses
    };
    
    const distributorExpenses = {
      ...DEFAULT_DISTRIBUTOR_EXPENSES,
      ...data.distributorExpenses
    };
    
    const utilitiesExpenses = {
      ...DEFAULT_UTILITIES_EXPENSES,
      ...data.utilitiesExpenses
    };
    
    const operationalExpenses = {
      ...DEFAULT_OPERATIONAL_EXPENSES,
      ...data.operationalExpenses
    };
    
    const report: PLReport = {
      date: dateKey,
      revenueItems,
      costOfGoodsItems: {},
      salaryExpenses,
      distributorExpenses,
      utilitiesExpenses,
      operationalExpenses,
      otherExpenses: data.otherExpenses || {}
    };

    if (data.budget) {
      report.budget = data.budget;
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Check if report already exists
    const { data: existingReport, error: fetchError } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateKey)
      .maybeSingle();
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (existingReport) {
      // Update existing report
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update({
          revenue_items: report.revenueItems,
          cost_of_goods_items: report.costOfGoodsItems,
          salary_expenses: report.salaryExpenses,
          distributor_expenses: report.distributorExpenses,
          utilities_expenses: report.utilitiesExpenses,
          operational_expenses: report.operationalExpenses,
          other_expenses: report.otherExpenses,
          budget: report.budget,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReport.id);
      
      if (updateError) throw updateError;
    } else {
      // Insert new report
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert({
          user_id: user.id,
          date: dateKey,
          revenue_items: report.revenueItems,
          cost_of_goods_items: report.costOfGoodsItems,
          salary_expenses: report.salaryExpenses,
          distributor_expenses: report.distributorExpenses,
          utilities_expenses: report.utilitiesExpenses,
          operational_expenses: report.operationalExpenses,
          other_expenses: report.otherExpenses,
          budget: report.budget
        });
      
      if (insertError) throw insertError;
    }
    
    // Also keep local storage for backwards compatibility
    const existingReportsStr = localStorage.getItem(STORAGE_KEY);
    const existingReports: Record<string, PLReport> = existingReportsStr 
      ? JSON.parse(existingReportsStr) 
      : {};
    
    existingReports[dateKey] = report;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingReports));
    
    toast({
      title: "Success",
      description: "Report saved successfully",
    });
  } catch (error) {
    console.error('Error saving report:', error);
    toast({
      title: "Error",
      description: "Failed to save report",
      variant: "destructive",
    });
  }
};

export const loadReport = async (selectedMonth: Date): Promise<PLReport | null> => {
  try {
    // Create date key in format YYYY-MM
    const dateKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Fall back to localStorage if not authenticated
      return loadFromLocalStorage(selectedMonth);
    }
    
    // Fetch report from Supabase
    const { data, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateKey)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      // Add missing columns to the database type
      interface ExtendedReportData {
        budget: any;
        cost_of_goods_items: any;
        created_at: string;
        date: string;
        distributor_expenses: any;
        id: string;
        operational_expenses: any;
        revenue_items: any;
        salary_expenses: any;
        updated_at: string;
        user_id: string;
        utilities_expenses?: any;
        other_expenses?: any;
      }
      
      const reportData = data as ExtendedReportData;
      
      // Convert the snake_case from Supabase to camelCase for our frontend
      // Ensure data is properly processed to match expected types
      const report: PLReport = {
        date: reportData.date,
        revenueItems: processSupabaseData(reportData.revenue_items),
        costOfGoodsItems: processSupabaseData(reportData.cost_of_goods_items),
        salaryExpenses: processSupabaseData(reportData.salary_expenses),
        distributorExpenses: processSupabaseData(reportData.distributor_expenses),
        utilitiesExpenses: reportData.utilities_expenses ? processSupabaseData(reportData.utilities_expenses) : {},
        operationalExpenses: reportData.operational_expenses ? processSupabaseData(reportData.operational_expenses) : {},
        otherExpenses: reportData.other_expenses ? processSupabaseData(reportData.other_expenses) : {}
      };
      
      if (reportData.budget) {
        report.budget = reportData.budget as PLReport['budget'];
      }
      
      // Ensure the report has the default items
      report.revenueItems = {
        ...DEFAULT_REVENUE_ITEMS,
        ...report.revenueItems
      };
      
      report.salaryExpenses = {
        ...DEFAULT_SALARY_EXPENSES,
        ...report.salaryExpenses
      };
      
      report.distributorExpenses = {
        ...DEFAULT_DISTRIBUTOR_EXPENSES,
        ...report.distributorExpenses
      };
      
      report.utilitiesExpenses = {
        ...DEFAULT_UTILITIES_EXPENSES,
        ...report.utilitiesExpenses
      };
      
      report.operationalExpenses = {
        ...DEFAULT_OPERATIONAL_EXPENSES,
        ...report.operationalExpenses
      };
      
      if (!report.otherExpenses) {
        report.otherExpenses = {};
      }
      
      // Check if any default values were added
      const needsUpdate = 
        !reportData.utilities_expenses || 
        !reportData.other_expenses ||
        Object.keys(DEFAULT_REVENUE_ITEMS).some(key => !(key in processSupabaseData(reportData.revenue_items))) ||
        Object.keys(DEFAULT_SALARY_EXPENSES).some(key => !(key in processSupabaseData(reportData.salary_expenses))) ||
        Object.keys(DEFAULT_DISTRIBUTOR_EXPENSES).some(key => !(key in processSupabaseData(reportData.distributor_expenses)));
      
      // If any defaults were added, save the report back
      if (needsUpdate) {
        // Save the updated report back to the database
        await supabase
          .from('pl_reports')
          .update({
            revenue_items: report.revenueItems,
            cost_of_goods_items: report.costOfGoodsItems,
            salary_expenses: report.salaryExpenses,
            distributor_expenses: report.distributorExpenses,
            utilities_expenses: report.utilitiesExpenses,
            operational_expenses: report.operationalExpenses,
            other_expenses: report.otherExpenses,
            updated_at: new Date().toISOString()
          })
          .eq('id', reportData.id);
          
        // Also update in localStorage
        updateLocalStorageReport(report);
      }
      
      return report;
    }
    
    // If no report found, return a default template
    return {
      date: dateKey,
      revenueItems: DEFAULT_REVENUE_ITEMS,
      costOfGoodsItems: {},
      salaryExpenses: DEFAULT_SALARY_EXPENSES,
      distributorExpenses: DEFAULT_DISTRIBUTOR_EXPENSES,
      utilitiesExpenses: DEFAULT_UTILITIES_EXPENSES,
      operationalExpenses: DEFAULT_OPERATIONAL_EXPENSES,
      otherExpenses: {}
    };
  } catch (error) {
    console.error('Error loading report:', error);
    toast({
      title: "Error",
      description: "Failed to load report",
      variant: "destructive",
    });
    
    // Fall back to localStorage on error
    return loadFromLocalStorage(selectedMonth);
  }
};

const loadFromLocalStorage = (selectedMonth: Date): PLReport | null => {
  try {
    const existingReportsStr = localStorage.getItem(STORAGE_KEY);
    if (!existingReportsStr) return null;
    
    const existingReports: Record<string, PLReport> = JSON.parse(existingReportsStr);
    
    // Create date key in format YYYY-MM
    const dateKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    
    // Check if the report exists
    const report = existingReports[dateKey];
    
    if (report) {
      // Ensure the report has the default items
      const updatedReport = { ...report };
      
      if (updatedReport.revenueItems) {
        updatedReport.revenueItems = {
          ...DEFAULT_REVENUE_ITEMS,
          ...updatedReport.revenueItems
        };
      }
      
      if (updatedReport.costOfGoodsItems) {
        updatedReport.costOfGoodsItems = {
          ...DEFAULT_COGS_ITEMS,
          ...updatedReport.costOfGoodsItems
        };
      }
      
      if (updatedReport.salaryExpenses) {
        updatedReport.salaryExpenses = {
          ...DEFAULT_SALARY_EXPENSES,
          ...updatedReport.salaryExpenses
        };
      }
      
      if (updatedReport.distributorExpenses) {
        updatedReport.distributorExpenses = {
          ...DEFAULT_DISTRIBUTOR_EXPENSES,
          ...updatedReport.distributorExpenses
        };
      }
      
      if (!updatedReport.utilitiesExpenses) {
        updatedReport.utilitiesExpenses = { ...DEFAULT_UTILITIES_EXPENSES };
      } else {
        updatedReport.utilitiesExpenses = {
          ...DEFAULT_UTILITIES_EXPENSES,
          ...updatedReport.utilitiesExpenses
        };
      }
      
      if (!updatedReport.operationalExpenses) {
        updatedReport.operationalExpenses = { ...DEFAULT_OPERATIONAL_EXPENSES };
      } else {
        updatedReport.operationalExpenses = {
          ...DEFAULT_OPERATIONAL_EXPENSES,
          ...updatedReport.operationalExpenses
        };
      }
      
      if (!updatedReport.otherExpenses) {
        updatedReport.otherExpenses = {};
      }
      
      // If the report was updated, save it back to localStorage
      const revenueHasChanged = Object.keys(DEFAULT_REVENUE_ITEMS).some(
        key => !(key in report.revenueItems || {})
      );
      
      const cogsHasChanged = Object.keys(DEFAULT_COGS_ITEMS).some(
        key => !(key in report.costOfGoodsItems || {})
      );
      
      const salaryHasChanged = Object.keys(DEFAULT_SALARY_EXPENSES).some(
        key => !(key in report.salaryExpenses || {})
      );
      
      const distributorHasChanged = Object.keys(DEFAULT_DISTRIBUTOR_EXPENSES).some(
        key => !(key in report.distributorExpenses || {})
      );
      
      const utilitiesHasChanged = !report.utilitiesExpenses || Object.keys(DEFAULT_UTILITIES_EXPENSES).some(
        key => !(key in report.utilitiesExpenses || {})
      );
      
      const operationalHasChanged = !report.operationalExpenses || Object.keys(DEFAULT_OPERATIONAL_EXPENSES).some(
        key => !(key in report.operationalExpenses || {})
      );
      
      const otherHasChanged = !report.otherExpenses;
      
      if (revenueHasChanged || cogsHasChanged || salaryHasChanged || distributorHasChanged || utilitiesHasChanged || operationalHasChanged || otherHasChanged) {
        updateLocalStorageReport(updatedReport);
      }
      
      return updatedReport;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading report from localStorage:', error);
    return null;
  }
};

// Helper function to update a report in localStorage
const updateLocalStorageReport = (report: PLReport): void => {
  try {
    const existingReportsStr = localStorage.getItem(STORAGE_KEY);
    if (!existingReportsStr) return;
    
    const existingReports: Record<string, PLReport> = JSON.parse(existingReportsStr);
    existingReports[report.date] = report;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingReports));
  } catch (error) {
    console.error('Error updating report in localStorage:', error);
  }
};

// Function to update all reports with default expenses
export const updateAllReportsWithDefaultSalaries = async (): Promise<void> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Fall back to updating localStorage if not authenticated
      updateAllLocalStorageReportsWithDefaultExpenses();
      return;
    }
    
    // Fetch all reports from Supabase
    const { data, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Process each report
      for (const reportData of data) {
        // Add missing columns to the database type
        interface ExtendedReportData {
          budget: any;
          cost_of_goods_items: any;
          created_at: string;
          date: string;
          distributor_expenses: any;
          id: string;
          operational_expenses: any;
          revenue_items: any;
          salary_expenses: any;
          updated_at: string;
          user_id: string;
          utilities_expenses?: any;
          other_expenses?: any;
        }
        
        const extReportData = reportData as ExtendedReportData;
        
        const revenueItems = extReportData.revenue_items ? processSupabaseData(extReportData.revenue_items) : {};
        const salaryExpenses = extReportData.salary_expenses ? processSupabaseData(extReportData.salary_expenses) : {};
        const distributorExpenses = extReportData.distributor_expenses ? processSupabaseData(extReportData.distributor_expenses) : {};
        const utilitiesExpenses = extReportData.utilities_expenses ? processSupabaseData(extReportData.utilities_expenses) : {};
        const operationalExpenses = extReportData.operational_expenses ? processSupabaseData(extReportData.operational_expenses) : {};
        const otherExpenses = extReportData.other_expenses ? processSupabaseData(extReportData.other_expenses) : {};
        
        // Check if any default revenue items are missing
        const revenueHasChanged = Object.keys(DEFAULT_REVENUE_ITEMS).some(
          key => !(key in revenueItems)
        );
        
        // Check if any default salary is missing
        const salaryHasChanged = Object.keys(DEFAULT_SALARY_EXPENSES).some(
          key => !(key in salaryExpenses)
        );
        
        // Check if any default distributor is missing
        const distributorHasChanged = Object.keys(DEFAULT_DISTRIBUTOR_EXPENSES).some(
          key => !(key in distributorExpenses)
        );
        
        // Check if any default utilities is missing
        const utilitiesHasChanged = !extReportData.utilities_expenses || Object.keys(DEFAULT_UTILITIES_EXPENSES).some(
          key => !(key in utilitiesExpenses)
        );
        
        // Check if any default operational is missing
        const operationalHasChanged = !extReportData.operational_expenses || Object.keys(DEFAULT_OPERATIONAL_EXPENSES).some(
          key => !(key in operationalExpenses)
        );
        
        // Check if other expenses exists
        const otherHasChanged = !extReportData.other_expenses;
        
        if (revenueHasChanged || salaryHasChanged || distributorHasChanged || utilitiesHasChanged || operationalHasChanged || otherHasChanged) {
          // Update the report with defaults
          const updatedRevenueItems = {
            ...DEFAULT_REVENUE_ITEMS,
            ...revenueItems
          };
          
          const updatedSalaryExpenses = {
            ...DEFAULT_SALARY_EXPENSES,
            ...salaryExpenses
          };
          
          const updatedDistributorExpenses = {
            ...DEFAULT_DISTRIBUTOR_EXPENSES,
            ...distributorExpenses
          };
          
          const updatedUtilitiesExpenses = {
            ...DEFAULT_UTILITIES_EXPENSES,
            ...utilitiesExpenses
          };
          
          const updatedOperationalExpenses = {
            ...DEFAULT_OPERATIONAL_EXPENSES,
            ...operationalExpenses
          };
          
          await supabase
            .from('pl_reports')
            .update({
              revenue_items: updatedRevenueItems,
              cost_of_goods_items: {},
              salary_expenses: updatedSalaryExpenses,
              distributor_expenses: updatedDistributorExpenses,
              utilities_expenses: updatedUtilitiesExpenses,
              operational_expenses: updatedOperationalExpenses,
              other_expenses: otherExpenses || {},
              updated_at: new Date().toISOString()
            })
            .eq('id', reportData.id);
        }
      }
    }
    
    // Also update localStorage reports
    updateAllLocalStorageReportsWithDefaultExpenses();
    
    toast({
      title: "Success",
      description: "All reports updated with default expenses",
    });
  } catch (error) {
    console.error('Error updating reports with defaults:', error);
    toast({
      title: "Error",
      description: "Failed to update reports with default expenses",
      variant: "destructive",
    });
  }
};

// Helper function to update all localStorage reports with default expenses
const updateAllLocalStorageReportsWithDefaultExpenses = (): void => {
  try {
    const existingReportsStr = localStorage.getItem(STORAGE_KEY);
    if (!existingReportsStr) return;
    
    const existingReports: Record<string, PLReport> = JSON.parse(existingReportsStr);
    let hasChanges = false;
    
    // Process each report
    for (const dateKey in existingReports) {
      const report = existingReports[dateKey];
      
      // Check if revenue items need update
      if (report.revenueItems) {
        const revenueNeedsUpdate = Object.keys(DEFAULT_REVENUE_ITEMS).some(
          key => !(key in report.revenueItems)
        );
        
        if (revenueNeedsUpdate) {
          report.revenueItems = {
            ...DEFAULT_REVENUE_ITEMS,
            ...report.revenueItems
          };
          hasChanges = true;
        }
      }
      
      // Check if cogs items need update
      if (report.costOfGoodsItems) {
        const cogsNeedsUpdate = Object.keys(DEFAULT_COGS_ITEMS).some(
          key => !(key in report.costOfGoodsItems)
        );
        
        if (cogsNeedsUpdate) {
          report.costOfGoodsItems = {
            ...DEFAULT_COGS_ITEMS,
            ...report.costOfGoodsItems
          };
          hasChanges = true;
        }
      }
      
      // Check if salary needs update
      if (report.salaryExpenses) {
        const salaryNeedsUpdate = Object.keys(DEFAULT_SALARY_EXPENSES).some(
          key => !(key in report.salaryExpenses)
        );
        
        if (salaryNeedsUpdate) {
          report.salaryExpenses = {
            ...DEFAULT_SALARY_EXPENSES,
            ...report.salaryExpenses
          };
          hasChanges = true;
        }
      }
      
      // Check if distributor needs update
      if (report.distributorExpenses) {
        const distributorNeedsUpdate = Object.keys(DEFAULT_DISTRIBUTOR_EXPENSES).some(
          key => !(key in report.distributorExpenses)
        );
        
        if (distributorNeedsUpdate) {
          report.distributorExpenses = {
            ...DEFAULT_DISTRIBUTOR_EXPENSES,
            ...report.distributorExpenses
          };
          hasChanges = true;
        }
      }
      
      // Check if utilities needs update
      if (!report.utilitiesExpenses) {
        report.utilitiesExpenses = { ...DEFAULT_UTILITIES_EXPENSES };
        hasChanges = true;
      } else {
        const utilitiesNeedsUpdate = Object.keys(DEFAULT_UTILITIES_EXPENSES).some(
          key => !(key in report.utilitiesExpenses)
        );
        
        if (utilitiesNeedsUpdate) {
          report.utilitiesExpenses = {
            ...DEFAULT_UTILITIES_EXPENSES,
            ...report.utilitiesExpenses
          };
          hasChanges = true;
        }
      }
      
      // Check if operational needs update
      if (!report.operationalExpenses) {
        report.operationalExpenses = { ...DEFAULT_OPERATIONAL_EXPENSES };
        hasChanges = true;
      } else {
        const operationalNeedsUpdate = Object.keys(DEFAULT_OPERATIONAL_EXPENSES).some(
          key => !(key in report.operationalExpenses)
        );
        
        if (operationalNeedsUpdate) {
          report.operationalExpenses = {
            ...DEFAULT_OPERATIONAL_EXPENSES,
            ...report.operationalExpenses
          };
          hasChanges = true;
        }
      }
      
      // Check if other expenses exists
      if (!report.otherExpenses) {
        report.otherExpenses = {};
        hasChanges = true;
      }
    }
    
    // Save changes if any
    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingReports));
    }
  } catch (error) {
    console.error('Error updating localStorage reports with defaults:', error);
  }
};

export const getAllReports = async (): Promise<PLReport[]> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Fall back to localStorage if not authenticated
      return getAllReportsFromLocalStorage();
    }
    
    // Fetch all reports from Supabase
    const { data, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Add missing columns to the database type
      interface ExtendedReportData {
        budget: any;
        cost_of_goods_items: any;
        created_at: string;
        date: string;
        distributor_expenses: any;
        id: string;
        operational_expenses: any;
        revenue_items: any;
        salary_expenses: any;
        updated_at: string;
        user_id: string;
        utilities_expenses?: any;
        other_expenses?: any;
      }
      
      // Convert the snake_case from Supabase to camelCase for our frontend
      return data.map(reportData => {
        const extReportData = reportData as ExtendedReportData;
        return {
          date: extReportData.date,
          revenueItems: processSupabaseData(extReportData.revenue_items),
          costOfGoodsItems: processSupabaseData(extReportData.cost_of_goods_items),
          salaryExpenses: processSupabaseData(extReportData.salary_expenses),
          distributorExpenses: processSupabaseData(extReportData.distributor_expenses),
          utilitiesExpenses: processSupabaseData(extReportData.utilities_expenses),
          operationalExpenses: processSupabaseData(extReportData.operational_expenses),
          otherExpenses: processSupabaseData(extReportData.other_expenses),
          budget: extReportData.budget as PLReport['budget']
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error getting all reports:', error);
    toast({
      title: "Error",
      description: "Failed to retrieve reports",
      variant: "destructive",
    });
    
    // Fall back to localStorage on error
    return getAllReportsFromLocalStorage();
  }
};

const getAllReportsFromLocalStorage = (): PLReport[] => {
  try {
    const existingReportsStr = localStorage.getItem(STORAGE_KEY);
    if (!existingReportsStr) return [];
    
    const existingReports: Record<string, PLReport> = JSON.parse(existingReportsStr);
    return Object.values(existingReports).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting all reports from localStorage:', error);
    return [];
  }
};

export const exportToCsv = (report: PLReport): void => {
  const revenueLines = Object.entries(report.revenueItems)
    .map(([name, value]) => `Revenue,${name},${value}`);
  
  const salaryLines = Object.entries(report.salaryExpenses)
    .map(([name, value]) => `Salary,${name},${value}`);
  
  const distributorLines = Object.entries(report.distributorExpenses)
    .map(([name, value]) => `Distributor,${name},${value}`);
  
  const utilitiesLines = Object.entries(report.utilitiesExpenses || {})
    .map(([name, value]) => `Utilities,${name},${value}`);
  
  const operationalLines = Object.entries(report.operationalExpenses || {})
    .map(([name, value]) => `Operational,${name},${value}`);
  
  const otherLines = Object.entries(report.otherExpenses || {})
    .map(([name, value]) => `Other,${name},${value}`);
  
  const totalRevenue = Object.values(report.revenueItems).reduce((sum, val) => sum + val, 0);
  const totalSalary = Object.values(report.salaryExpenses).reduce((sum, val) => sum + val, 0);
  const totalDistributor = Object.values(report.distributorExpenses).reduce((sum, val) => sum + val, 0);
  const totalUtilities = Object.values(report.utilitiesExpenses || {}).reduce((sum, val) => sum + val, 0);
  const totalOperational = Object.values(report.operationalExpenses || {}).reduce((sum, val) => sum + val, 0);
  const totalOther = Object.values(report.otherExpenses || {}).reduce((sum, val) => sum + val, 0);
  
  const totalExpenses = totalSalary + totalDistributor + totalUtilities + totalOperational + totalOther;
  const grossProfit = totalRevenue;
  const netProfit = grossProfit - totalExpenses;
  
  const summaryLines = [
    `Summary,Total Revenue,${totalRevenue}`,
    `Summary,Gross Profit,${grossProfit}`,
    `Summary,Total Expenses,${totalExpenses}`,
    `Summary,Net Profit,${netProfit}`
  ];
  
  const csvContent = [
    'Category,Item,Value',
    ...revenueLines,
    ...salaryLines,
    ...distributorLines,
    ...utilitiesLines,
    ...operationalLines,
    ...otherLines,
    ...summaryLines
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `PL_Report_${report.date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPdf = (): void => {
  toast({
    title: "Print to PDF",
    description: "Use your browser's print function (Ctrl+P) to save as PDF",
  });
  window.print();
};
