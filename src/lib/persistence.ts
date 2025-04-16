
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface PLReport {
  date: string;
  revenueItems: Record<string, number>;
  costOfGoodsItems: Record<string, number>;
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  operationalExpenses: Record<string, number>;
  budget?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  };
}

const STORAGE_KEY = 'panini_pl_reports';

export const saveReport = async (selectedMonth: Date, data: Omit<PLReport, 'date'>): Promise<void> => {
  try {
    // Create date key in format YYYY-MM
    const dateKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    
    const report: PLReport = {
      date: dateKey,
      ...data
    };
    
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
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
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
          operational_expenses: report.operationalExpenses,
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
          operational_expenses: report.operationalExpenses,
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
      return {
        date: data.date,
        revenueItems: data.revenue_items as Record<string, number>,
        costOfGoodsItems: data.cost_of_goods_items as Record<string, number>,
        salaryExpenses: data.salary_expenses as Record<string, number>,
        distributorExpenses: data.distributor_expenses as Record<string, number>,
        operationalExpenses: data.operational_expenses as Record<string, number>,
        budget: data.budget as PLReport['budget']
      };
    }
    
    // Fall back to localStorage if no report found in Supabase
    return loadFromLocalStorage(selectedMonth);
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
    
    // Return the report if it exists
    return existingReports[dateKey] || null;
  } catch (error) {
    console.error('Error loading report from localStorage:', error);
    return null;
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
      return data.map(report => ({
        date: report.date,
        revenueItems: report.revenue_items as Record<string, number>,
        costOfGoodsItems: report.cost_of_goods_items as Record<string, number>,
        salaryExpenses: report.salary_expenses as Record<string, number>,
        distributorExpenses: report.distributor_expenses as Record<string, number>,
        operationalExpenses: report.operational_expenses as Record<string, number>,
        budget: report.budget as PLReport['budget']
      }));
    }
    
    // Fall back to localStorage if no reports found in Supabase
    return getAllReportsFromLocalStorage();
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
  
  const cogsLines = Object.entries(report.costOfGoodsItems)
    .map(([name, value]) => `CoGS,${name},${value}`);
  
  const salaryLines = Object.entries(report.salaryExpenses)
    .map(([name, value]) => `Salary,${name},${value}`);
  
  const distributorLines = Object.entries(report.distributorExpenses)
    .map(([name, value]) => `Distributor,${name},${value}`);
  
  const operationalLines = Object.entries(report.operationalExpenses)
    .map(([name, value]) => `Operational,${name},${value}`);
  
  const totalRevenue = Object.values(report.revenueItems).reduce((sum, val) => sum + val, 0);
  const totalCogs = Object.values(report.costOfGoodsItems).reduce((sum, val) => sum + val, 0);
  const totalSalary = Object.values(report.salaryExpenses).reduce((sum, val) => sum + val, 0);
  const totalDistributor = Object.values(report.distributorExpenses).reduce((sum, val) => sum + val, 0);
  const totalOperational = Object.values(report.operationalExpenses).reduce((sum, val) => sum + val, 0);
  
  const totalExpenses = totalSalary + totalDistributor + totalOperational;
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpenses;
  
  const summaryLines = [
    `Summary,Total Revenue,${totalRevenue}`,
    `Summary,Total CoGS,${totalCogs}`,
    `Summary,Gross Profit,${grossProfit}`,
    `Summary,Total Expenses,${totalExpenses}`,
    `Summary,Net Profit,${netProfit}`
  ];
  
  const csvContent = [
    'Category,Item,Value',
    ...revenueLines,
    ...cogsLines,
    ...salaryLines,
    ...distributorLines,
    ...operationalLines,
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
