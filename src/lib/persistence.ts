
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
  subcategories?: {
    revenueItems?: Record<string, string>;
    expenses?: Record<string, string>;
  };
}

interface SupabaseReport {
  id: string;
  date: string;
  user_id: string;
  revenue_items: Record<string, number>;
  cost_of_goods_items: Record<string, number>;
  salary_expenses: Record<string, number>;
  distributor_expenses: Record<string, number>;
  utilities_expenses: Record<string, number>;
  operational_expenses: Record<string, number>;
  other_expenses: Record<string, number>;
  budget?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  };
  subcategories?: {
    revenueItems?: Record<string, string>;
    expenses?: Record<string, string>;
  };
  created_at: string;
  updated_at: string;
}

export const loadReport = async (month: Date): Promise<PLReport | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;

    let { data: pl_reports, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', dateKey)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!pl_reports) {
      return null;
    }

    // Cast to our interface with known properties
    const report = pl_reports as unknown as SupabaseReport;
    
    // Safely handle subcategories with default empty objects
    const subcategories = report.subcategories || { revenueItems: {}, expenses: {} };

    return {
      date: report.date,
      revenueItems: report.revenue_items || {},
      costOfGoodsItems: report.cost_of_goods_items || {},
      salaryExpenses: report.salary_expenses || {},
      distributorExpenses: report.distributor_expenses || {},
      utilitiesExpenses: report.utilities_expenses || {},
      operationalExpenses: report.operational_expenses || {},
      otherExpenses: report.other_expenses || {},
      budget: report.budget,
      subcategories
    };
  } catch (error) {
    console.error("Error loading report:", error);
    return null;
  }
};

export const getAllReports = async (): Promise<PLReport[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    let { data: pl_reports, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    if (!pl_reports || pl_reports.length === 0) {
      return [];
    }

    return pl_reports.map(report => {
      const typedReport = report as unknown as SupabaseReport;
      return {
        date: typedReport.date,
        revenueItems: typedReport.revenue_items || {},
        costOfGoodsItems: typedReport.cost_of_goods_items || {},
        salaryExpenses: typedReport.salary_expenses || {},
        distributorExpenses: typedReport.distributor_expenses || {},
        utilitiesExpenses: typedReport.utilities_expenses || {},
        operationalExpenses: typedReport.operational_expenses || {},
        otherExpenses: typedReport.other_expenses || {},
        budget: typedReport.budget,
        subcategories: typedReport.subcategories || { revenueItems: {}, expenses: {} }
      };
    });
  } catch (error) {
    console.error("Error loading all reports:", error);
    return [];
  }
};

export const saveReport = async (
  month: Date,
  revenueItems: Record<string, number>,
  costOfGoodsItems: Record<string, number>,
  salaryExpenses: Record<string, number>,
  distributorExpenses: Record<string, number>,
  utilitiesExpenses: Record<string, number>,
  operationalExpenses: Record<string, number>,
  otherExpenses: Record<string, number>,
  budget?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  },
  subcategories?: {
    revenueItems?: Record<string, string>;
    expenses?: Record<string, string>;
  }
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    console.log("Saving report for date:", dateKey);
    console.log("Revenue items:", revenueItems);
    
    const { data: existingReport, error: fetchError } = await supabase
      .from('pl_reports')
      .select('id')
      .eq('date', dateKey)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    // Ensure subcategories is properly structured
    const safeSubcategories = {
      revenueItems: subcategories?.revenueItems || {},
      expenses: subcategories?.expenses || {}
    };
    
    if (existingReport) {
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update({
          revenue_items: revenueItems,
          cost_of_goods_items: costOfGoodsItems,
          salary_expenses: salaryExpenses,
          distributor_expenses: distributorExpenses,
          utilities_expenses: utilitiesExpenses,
          operational_expenses: operationalExpenses,
          other_expenses: otherExpenses,
          budget,
          subcategories: safeSubcategories,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReport.id);
      
      if (updateError) {
        console.error("Error updating report:", updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert({
          date: dateKey,
          user_id: user.id,
          revenue_items: revenueItems,
          cost_of_goods_items: costOfGoodsItems,
          salary_expenses: salaryExpenses,
          distributor_expenses: distributorExpenses,
          utilities_expenses: utilitiesExpenses,
          operational_expenses: operationalExpenses,
          other_expenses: otherExpenses,
          budget,
          subcategories: safeSubcategories
        });
      
      if (insertError) {
        console.error("Error inserting report:", insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error saving report:", error);
    throw error;
  }
};

export const updateAllReportsWithDefaultSalaries = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const defaultSalaries = {
      "Adi": 4050,
      "Ioana": 4050,
      "Andreea": 4050,
      "Victoria": 4050
    };

    const { data: reports, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }

    if (!reports || reports.length === 0) {
      console.log("No reports found for the user.");
      return;
    }

    for (const report of reports) {
      const currentSalaries = report.salary_expenses || {};
      const missingSalaries = Object.keys(defaultSalaries).filter(salaryName => !(salaryName in currentSalaries));

      if (missingSalaries.length > 0) {
        const updatedSalaries = { ...currentSalaries, ...defaultSalaries };

        const { error: updateError } = await supabase
          .from('pl_reports')
          .update({ salary_expenses: updatedSalaries })
          .eq('id', report.id);

        if (updateError) {
          console.error("Error updating report:", updateError);
          continue;
        } else {
          console.log(`Updated report ${report.id} with default salaries.`);
        }
      } else {
        console.log(`Report ${report.id} already has default salaries.`);
      }
    }

    console.log("All reports checked and updated with default salaries where necessary.");

  } catch (error) {
    console.error("Error updating reports with default salaries:", error);
  }
};

export const exportToCsv = (report: PLReport) => {
  const csvRows = [];

  const addRow = (title: string, items: Record<string, number>) => {
    csvRows.push([title]);
    Object.entries(items).forEach(([key, value]) => {
      csvRows.push([key, value.toString()]);
    });
    csvRows.push([]);
  };

  addRow("Revenue Items", report.revenueItems);
  addRow("Cost of Goods Items", report.costOfGoodsItems);
  addRow("Salary Expenses", report.salaryExpenses);
  addRow("Distributor Expenses", report.distributorExpenses);
  addRow("Utilities Expenses", report.utilitiesExpenses);
  addRow("Operational Expenses", report.operationalExpenses);
  addRow("Other Expenses", report.otherExpenses);

  const csvContent = csvRows.map(row => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPdf = () => {
  window.print();
};

export const deleteItemFromSupabase = async (
  month: Date,
  category: string,
  name: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    const { data: existingReport, error: fetchError } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', dateKey)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingReport) {
      const typedReport = existingReport as unknown as SupabaseReport;
      let updatedData: Record<string, any> = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = typedReport.revenue_items || {};
        const newRevenueItems = { ...currentRevenueItems };
        delete newRevenueItems[name];
        updatedData.revenue_items = newRevenueItems;
        
        // Also remove from subcategories tracking
        const currentSubcategories = typedReport.subcategories || {};
        const currentRevenueSubcategories = currentSubcategories.revenueItems || {};
        const newRevenueSubcategories = { ...currentRevenueSubcategories };
        delete newRevenueSubcategories[name];
        
        updatedData.subcategories = {
          ...currentSubcategories,
          revenueItems: newRevenueSubcategories,
          expenses: currentSubcategories.expenses || {}
        };
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = typedReport.salary_expenses || {};
        const newSalaryExpenses = { ...currentSalaryExpenses };
        delete newSalaryExpenses[name];
        updatedData.salary_expenses = newSalaryExpenses;
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = typedReport.distributor_expenses || {};
        const newDistributorExpenses = { ...currentDistributorExpenses };
        delete newDistributorExpenses[name];
        updatedData.distributor_expenses = newDistributorExpenses;
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = typedReport.utilities_expenses || {};
        const newUtilitiesExpenses = { ...currentUtilitiesExpenses };
        delete newUtilitiesExpenses[name];
        updatedData.utilities_expenses = newUtilitiesExpenses;
        
        // Also remove from subcategories tracking
        const currentSubcategories = typedReport.subcategories || {};
        const currentExpenseSubcategories = currentSubcategories.expenses || {};
        const newExpenseSubcategories = { ...currentExpenseSubcategories };
        delete newExpenseSubcategories[name];
        
        updatedData.subcategories = {
          ...currentSubcategories,
          revenueItems: currentSubcategories.revenueItems || {},
          expenses: newExpenseSubcategories
        };
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = typedReport.operational_expenses || {};
        const newOperationalExpenses = { ...currentOperationalExpenses };
        delete newOperationalExpenses[name];
        updatedData.operational_expenses = newOperationalExpenses;
        
        // Also remove from subcategories tracking
        const currentSubcategories = typedReport.subcategories || {};
        const currentExpenseSubcategories = currentSubcategories.expenses || {};
        const newExpenseSubcategories = { ...currentExpenseSubcategories };
        delete newExpenseSubcategories[name];
        
        updatedData.subcategories = {
          ...currentSubcategories,
          revenueItems: currentSubcategories.revenueItems || {},
          expenses: newExpenseSubcategories
        };
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = typedReport.other_expenses || {};
        const newOtherExpenses = { ...currentOtherExpenses };
        delete newOtherExpenses[name];
        updatedData.other_expenses = newOtherExpenses;
        
        // Also remove from subcategories tracking
        const currentSubcategories = typedReport.subcategories || {};
        const currentExpenseSubcategories = currentSubcategories.expenses || {};
        const newExpenseSubcategories = { ...currentExpenseSubcategories };
        delete newExpenseSubcategories[name];
        
        updatedData.subcategories = {
          ...currentSubcategories,
          revenueItems: currentSubcategories.revenueItems || {},
          expenses: newExpenseSubcategories
        };
      }
      
      updatedData.updated_at = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updatedData)
        .eq('id', existingReport.id);
      
      if (updateError) {
        console.error("Error updating report:", updateError);
        throw updateError;
      }
    } else {
      console.log("Report not found, cannot delete item.");
    }
  } catch (error) {
    console.error("Error deleting item from Supabase:", error);
    throw error;
  }
};

export const addItemToSupabase = async (
  month: Date,
  category: string,
  name: string,
  value: number,
  subsectionTitle?: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    const { data: existingReport, error: fetchError } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', dateKey)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingReport) {
      const typedReport = existingReport as unknown as SupabaseReport;
      let updatedData: Record<string, any> = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = typedReport.revenue_items || {};
        updatedData.revenue_items = {
          ...currentRevenueItems,
          [name]: value
        };
        
        // Track the subcategory
        const currentSubcategories = typedReport.subcategories || {};
        const currentRevenueSubcategories = currentSubcategories.revenueItems || {};
        
        updatedData.subcategories = {
          ...currentSubcategories,
          revenueItems: {
            ...currentRevenueSubcategories,
            [name]: category === 'bucatarieItems' ? 'Bucatarie' : 'Bar'
          },
          expenses: currentSubcategories.expenses || {}
        };
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = typedReport.salary_expenses || {};
        updatedData.salary_expenses = {
          ...currentSalaryExpenses,
          [name]: value
        };
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = typedReport.distributor_expenses || {};
        updatedData.distributor_expenses = {
          ...currentDistributorExpenses,
          [name]: value
        };
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = typedReport.utilities_expenses || {};
        updatedData.utilities_expenses = {
          ...currentUtilitiesExpenses,
          [name]: value
        };
        
        // Track the subcategory
        const currentSubcategories = typedReport.subcategories || {};
        const currentExpenseSubcategories = currentSubcategories.expenses || {};
        
        updatedData.subcategories = {
          ...currentSubcategories,
          revenueItems: currentSubcategories.revenueItems || {},
          expenses: {
            ...currentExpenseSubcategories,
            [name]: 'Utilitati'
          }
        };
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = typedReport.operational_expenses || {};
        updatedData.operational_expenses = {
          ...currentOperationalExpenses,
          [name]: value
        };
        
        // Track the subcategory
        const currentSubcategories = typedReport.subcategories || {};
        const currentExpenseSubcategories = currentSubcategories.expenses || {};
        
        updatedData.subcategories = {
          ...currentSubcategories,
          revenueItems: currentSubcategories.revenueItems || {},
          expenses: {
            ...currentExpenseSubcategories,
            [name]: 'Operationale'
          }
        };
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = typedReport.other_expenses || {};
        updatedData.other_expenses = {
          ...currentOtherExpenses,
          [name]: value
        };
        
        // Track the subcategory
        const currentSubcategories = typedReport.subcategories || {};
        const currentExpenseSubcategories = currentSubcategories.expenses || {};
        
        updatedData.subcategories = {
          ...currentSubcategories,
          revenueItems: currentSubcategories.revenueItems || {},
          expenses: {
            ...currentExpenseSubcategories,
            [name]: 'Alte Cheltuieli'
          }
        };
      }
      
      updatedData.updated_at = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updatedData)
        .eq('id', existingReport.id);
      
      if (updateError) {
        console.error("Error updating report:", updateError);
        throw updateError;
      }
    } else {
      // Creating a new report
      const initialSubcategories: {
        revenueItems: Record<string, string>;
        expenses: Record<string, string>;
      } = {
        revenueItems: {},
        expenses: {}
      };
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        initialSubcategories.revenueItems[name] = category === 'bucatarieItems' ? 'Bucatarie' : 'Bar';
      } else if (category === 'utilitiesExpenses') {
        initialSubcategories.expenses[name] = 'Utilitati';
      } else if (category === 'operationalExpenses') {
        initialSubcategories.expenses[name] = 'Operationale';
      } else if (category === 'otherExpenses') {
        initialSubcategories.expenses[name] = 'Alte Cheltuieli';
      }
      
      // Initialize default empty objects for all item types
      const revenue_items: Record<string, number> = {};
      const cost_of_goods_items: Record<string, number> = {};
      const salary_expenses: Record<string, number> = {};
      const distributor_expenses: Record<string, number> = {};
      const utilities_expenses: Record<string, number> = {};
      const operational_expenses: Record<string, number> = {};
      const other_expenses: Record<string, number> = {};
      
      // Add the new item to the appropriate category
      if (category === 'bucatarieItems' || category === 'barItems') {
        revenue_items[name] = value;
      } else if (category === 'salaryExpenses') {
        salary_expenses[name] = value;
      } else if (category === 'distributorExpenses') {
        distributor_expenses[name] = value;
      } else if (category === 'utilitiesExpenses') {
        utilities_expenses[name] = value;
      } else if (category === 'operationalExpenses') {
        operational_expenses[name] = value;
      } else if (category === 'otherExpenses') {
        other_expenses[name] = value;
      }
      
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert({
          date: dateKey,
          user_id: user.id,
          revenue_items,
          cost_of_goods_items,
          salary_expenses,
          distributor_expenses,
          utilities_expenses,
          operational_expenses,
          other_expenses,
          subcategories: initialSubcategories
        });
      
      if (insertError) {
        console.error("Error inserting report:", insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error adding item to Supabase:", error);
    throw error;
  }
};

export const updateItemInSupabase = async (
  month: Date,
  category: string,
  name: string,
  value: number
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    const { data: existingReport, error: fetchError } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', dateKey)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingReport) {
      const typedReport = existingReport as unknown as SupabaseReport;
      let updatedData: Record<string, any> = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = typedReport.revenue_items || {};
        updatedData.revenue_items = {
          ...currentRevenueItems,
          [name]: value
        };
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = typedReport.salary_expenses || {};
        updatedData.salary_expenses = {
          ...currentSalaryExpenses,
          [name]: value
        };
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = typedReport.distributor_expenses || {};
        updatedData.distributor_expenses = {
          ...currentDistributorExpenses,
          [name]: value
        };
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = typedReport.utilities_expenses || {};
        updatedData.utilities_expenses = {
          ...currentUtilitiesExpenses,
          [name]: value
        };
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = typedReport.operational_expenses || {};
        updatedData.operational_expenses = {
          ...currentOperationalExpenses,
          [name]: value
        };
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = typedReport.other_expenses || {};
        updatedData.other_expenses = {
          ...currentOtherExpenses,
          [name]: value
        };
      }
      
      updatedData.updated_at = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updatedData)
        .eq('id', existingReport.id);
      
      if (updateError) {
        console.error("Error updating report:", updateError);
        throw updateError;
      }
    } else {
      console.log("Report not found, cannot update item.");
      // Handle the case when the report doesn't exist yet by creating it
      await addItemToSupabase(month, category, name, value);
    }
  } catch (error) {
    console.error("Error updating item in Supabase:", error);
    throw error;
  }
};

export const renameItemInSupabase = async (
  month: Date,
  category: string,
  oldName: string,
  newName: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    const { data: existingReport, error: fetchError } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', dateKey)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingReport) {
      const typedReport = existingReport as unknown as SupabaseReport;
      let updatedData: Record<string, any> = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = typedReport.revenue_items || {};
        
        if (currentRevenueItems[oldName] !== undefined) {
          const value = currentRevenueItems[oldName];
          const newRevenueItems = { ...currentRevenueItems };
          delete newRevenueItems[oldName];
          newRevenueItems[newName] = value;
          updatedData.revenue_items = newRevenueItems;
          
          // Update subcategories
          const currentSubcategories = typedReport.subcategories || { revenueItems: {}, expenses: {} };
          const currentRevenueSubcategories = currentSubcategories.revenueItems || {};
          
          if (currentRevenueSubcategories[oldName]) {
            const categoryType = currentRevenueSubcategories[oldName];
            const newRevenueSubcategories = { ...currentRevenueSubcategories };
            delete newRevenueSubcategories[oldName];
            newRevenueSubcategories[newName] = categoryType;
            
            updatedData.subcategories = {
              ...currentSubcategories,
              revenueItems: newRevenueSubcategories,
              expenses: currentSubcategories.expenses || {}
            };
          }
        }
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = typedReport.salary_expenses || {};
        
        if (currentSalaryExpenses[oldName] !== undefined) {
          const value = currentSalaryExpenses[oldName];
          const newSalaryExpenses = { ...currentSalaryExpenses };
          delete newSalaryExpenses[oldName];
          newSalaryExpenses[newName] = value;
          updatedData.salary_expenses = newSalaryExpenses;
        }
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = typedReport.distributor_expenses || {};
        
        if (currentDistributorExpenses[oldName] !== undefined) {
          const value = currentDistributorExpenses[oldName];
          const newDistributorExpenses = { ...currentDistributorExpenses };
          delete newDistributorExpenses[oldName];
          newDistributorExpenses[newName] = value;
          updatedData.distributor_expenses = newDistributorExpenses;
        }
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = typedReport.utilities_expenses || {};
        
        if (currentUtilitiesExpenses[oldName] !== undefined) {
          const value = currentUtilitiesExpenses[oldName];
          const newUtilitiesExpenses = { ...currentUtilitiesExpenses };
          delete newUtilitiesExpenses[oldName];
          newUtilitiesExpenses[newName] = value;
          updatedData.utilities_expenses = newUtilitiesExpenses;
          
          // Update subcategories
          const currentSubcategories = typedReport.subcategories || { revenueItems: {}, expenses: {} };
          const currentExpenseSubcategories = currentSubcategories.expenses || {};
          
          if (currentExpenseSubcategories[oldName]) {
            const subcategory = currentExpenseSubcategories[oldName];
            const newExpenseSubcategories = { ...currentExpenseSubcategories };
            delete newExpenseSubcategories[oldName];
            newExpenseSubcategories[newName] = subcategory;
            
            updatedData.subcategories = {
              ...currentSubcategories,
              revenueItems: currentSubcategories.revenueItems || {},
              expenses: newExpenseSubcategories
            };
          }
        }
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = typedReport.operational_expenses || {};
        
        if (currentOperationalExpenses[oldName] !== undefined) {
          const value = currentOperationalExpenses[oldName];
          const newOperationalExpenses = { ...currentOperationalExpenses };
          delete newOperationalExpenses[oldName];
          newOperationalExpenses[newName] = value;
          updatedData.operational_expenses = newOperationalExpenses;
          
          // Update subcategories
          const currentSubcategories = typedReport.subcategories || { revenueItems: {}, expenses: {} };
          const currentExpenseSubcategories = currentSubcategories.expenses || {};
          
          if (currentExpenseSubcategories[oldName]) {
            const subcategory = currentExpenseSubcategories[oldName];
            const newExpenseSubcategories = { ...currentExpenseSubcategories };
            delete newExpenseSubcategories[oldName];
            newExpenseSubcategories[newName] = subcategory;
            
            updatedData.subcategories = {
              ...currentSubcategories,
              revenueItems: currentSubcategories.revenueItems || {},
              expenses: newExpenseSubcategories
            };
          }
        }
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = typedReport.other_expenses || {};
        
        if (currentOtherExpenses[oldName] !== undefined) {
          const value = currentOtherExpenses[oldName];
          const newOtherExpenses = { ...currentOtherExpenses };
          delete newOtherExpenses[oldName];
          newOtherExpenses[newName] = value;
          updatedData.other_expenses = newOtherExpenses;
          
          // Update subcategories
          const currentSubcategories = typedReport.subcategories || { revenueItems: {}, expenses: {} };
          const currentExpenseSubcategories = currentSubcategories.expenses || {};
          
          if (currentExpenseSubcategories[oldName]) {
            const subcategory = currentExpenseSubcategories[oldName];
            const newExpenseSubcategories = { ...currentExpenseSubcategories };
            delete newExpenseSubcategories[oldName];
            newExpenseSubcategories[newName] = subcategory;
            
            updatedData.subcategories = {
              ...currentSubcategories,
              revenueItems: currentSubcategories.revenueItems || {},
              expenses: newExpenseSubcategories
            };
          }
        }
      }
      
      updatedData.updated_at = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updatedData)
        .eq('id', existingReport.id);
      
      if (updateError) {
        console.error("Error updating report:", updateError);
        throw updateError;
      }
    } else {
      console.log("Report not found, cannot rename item.");
    }
  } catch (error) {
    console.error("Error renaming item in Supabase:", error);
    throw error;
  }
};
