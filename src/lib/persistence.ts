import { supabase } from "@/integrations/supabase/client";

export interface PLReport {
  date: string;
  revenueItems: Record<string, number>;
  bucatarieItems: Record<string, number>; // Add separate bucatarieItems
  barItems: Record<string, number>; // Add separate barItems
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
  bucatarie_items: Record<string, number>; // Add separate bucatarie_items in DB
  bar_items: Record<string, number>; // Add separate bar_items in DB
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

    // Combine bucatarie and bar items for revenueItems for backwards compatibility
    const revenueItems = {
      ...(report.bucatarie_items || {}),
      ...(report.bar_items || {})
    };

    return {
      date: report.date,
      revenueItems: revenueItems,
      bucatarieItems: report.bucatarie_items || {},
      barItems: report.bar_items || {},
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
      
      // Combine bucatarie and bar items for revenueItems for backwards compatibility
      const revenueItems = {
        ...(typedReport.bucatarie_items || {}),
        ...(typedReport.bar_items || {})
      };
      
      return {
        date: typedReport.date,
        revenueItems: revenueItems,
        bucatarieItems: typedReport.bucatarie_items || {},
        barItems: typedReport.bar_items || {},
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
  },
  bucatarieItems?: Record<string, number>, // Added separate parameter
  barItems?: Record<string, number> // Added separate parameter
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    console.log("Saving report for date:", dateKey);
    
    const { data: existingReport, error: fetchError } = await supabase
      .from('pl_reports')
      .select('id')
      .eq('date', dateKey)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    // Ensure subcategories is properly structured as an object
    const safeSubcategories = {
      revenueItems: subcategories?.revenueItems || {},
      expenses: subcategories?.expenses || {}
    };
    
    // Separate bucatarie and bar items
    const separateBucatarieItems = bucatarieItems || {};
    const separateBarItems = barItems || {};
    
    if (existingReport) {
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update({
          revenue_items: revenueItems,
          bucatarie_items: separateBucatarieItems, // Store separately
          bar_items: separateBarItems, // Store separately
          cost_of_goods_items: costOfGoodsItems,
          salary_expenses: salaryExpenses,
          distributor_expenses: distributorExpenses,
          utilities_expenses: utilitiesExpenses,
          operational_expenses: operationalExpenses,
          other_expenses: otherExpenses,
          budget,
          subcategories: safeSubcategories as Record<string, unknown>, // Type cast to avoid TS error
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
          bucatarie_items: separateBucatarieItems, // Store separately
          bar_items: separateBarItems, // Store separately
          cost_of_goods_items: costOfGoodsItems,
          salary_expenses: salaryExpenses,
          distributor_expenses: distributorExpenses,
          utilities_expenses: utilitiesExpenses,
          operational_expenses: operationalExpenses,
          other_expenses: otherExpenses,
          budget,
          subcategories: safeSubcategories as Record<string, unknown> // Type cast to avoid TS error
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
      
      if (category === 'bucatarieItems') {
        const currentBucatarieItems = typedReport.bucatarie_items || {};
        const newBucatarieItems = { ...currentBucatarieItems };
        delete newBucatarieItems[name];
        updatedData.bucatarie_items = newBucatarieItems;
        
        // Update the combined revenue_items
        const currentRevenueItems = typedReport.revenue_items || {};
        const newRevenueItems = { ...currentRevenueItems };
        delete newRevenueItems[name];
        updatedData.revenue_items = newRevenueItems;
        
        // Also remove from subcategories tracking if it exists
        if (typedReport.subcategories?.revenueItems) {
          const currentSubcategories = typedReport.subcategories || {};
          const currentRevenueSubcategories = currentSubcategories.revenueItems || {};
          const newRevenueSubcategories = { ...currentRevenueSubcategories };
          delete newRevenueSubcategories[name];
          
          updatedData.subcategories = {
            ...currentSubcategories,
            revenueItems: newRevenueSubcategories,
            expenses: currentSubcategories.expenses || {}
          };
        }
      } else if (category === 'barItems') {
        const currentBarItems = typedReport.bar_items || {};
        const newBarItems = { ...currentBarItems };
        delete newBarItems[name];
        updatedData.bar_items = newBarItems;
        
        // Update the combined revenue_items
        const currentRevenueItems = typedReport.revenue_items || {};
        const newRevenueItems = { ...currentRevenueItems };
        delete newRevenueItems[name];
        updatedData.revenue_items = newRevenueItems;
        
        // Also remove from subcategories tracking if it exists
        if (typedReport.subcategories?.revenueItems) {
          const currentSubcategories = typedReport.subcategories || {};
          const currentRevenueSubcategories = currentSubcategories.revenueItems || {};
          const newRevenueSubcategories = { ...currentRevenueSubcategories };
          delete newRevenueSubcategories[name];
          
          updatedData.subcategories = {
            ...currentSubcategories,
            revenueItems: newRevenueSubcategories,
            expenses: currentSubcategories.expenses || {}
          };
        }
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
        
        // Also remove from subcategories tracking if it exists
        if (typedReport.subcategories?.expenses) {
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
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = typedReport.operational_expenses || {};
        const newOperationalExpenses = { ...currentOperationalExpenses };
        delete newOperationalExpenses[name];
        updatedData.operational_expenses = newOperationalExpenses;
        
        // Also remove from subcategories tracking if it exists
        if (typedReport.subcategories?.expenses) {
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
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = typedReport.other_expenses || {};
        const newOtherExpenses = { ...currentOtherExpenses };
        delete newOtherExpenses[name];
        updatedData.other_expenses = newOtherExpenses;
        
        // Also remove from subcategories tracking if it exists
        if (typedReport.subcategories?.expenses) {
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
      
      console.log(`Successfully deleted ${name} from ${category}`);
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
      
      if (category === 'bucatarieItems') {
        // Add to separate bucatarie_items
        const currentBucatarieItems = typedReport.bucatarie_items || {};
        updatedData.bucatarie_items = {
          ...currentBucatarieItems,
          [name]: value
        };
        
        // Update the combined revenue_items
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
            [name]: 'Bucatarie'
          },
          expenses: currentSubcategories.expenses || {}
        };
      } else if (category === 'barItems') {
        // Add to separate bar_items
        const currentBarItems = typedReport.bar_items || {};
        updatedData.bar_items = {
          ...currentBarItems,
          [name]: value
        };
        
        // Update the combined revenue_items
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
            [name]: 'Bar'
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
      
      console.log(`Successfully added ${name} to ${category} with value ${value}`);
    } else {
      // Creating a new report
      const initialSubcategories: {
        revenueItems: Record<string, string>;
        expenses: Record<string, string>;
      } = {
        revenueItems: {},
        expenses: {}
      };
      
      // Initialize default empty objects for all item types
      const revenue_items: Record<string, number> = {};
      const bucatarie_items: Record<string, number> = {};
      const bar_items: Record<string, number> = {};
      const cost_of_goods_items: Record<string, number> = {};
      const salary_expenses: Record<string, number> = {};
      const distributor_expenses: Record<string, number> = {};
      const utilities_expenses: Record<string, number> = {};
      const operational_expenses: Record<string, number> = {};
      const other_expenses: Record<string, number> = {};
      
      // Add the new item to the appropriate category
      if (category === 'bucatarieItems') {
        bucatarie_items[name] = value;
        revenue_items[name] = value; // Also add to combined revenue items
        initialSubcategories.revenueItems[name] = 'Bucatarie';
      } else if (category === 'barItems') {
        bar_items[name] = value;
        revenue_items[name] = value; // Also add to combined revenue items
        initialSubcategories.revenueItems[name] = 'Bar';
      } else if (category === 'salaryExpenses') {
        salary_expenses[name] = value;
      } else if (category === 'distributorExpenses') {
        distributor_expenses[name] = value;
      } else if (category === 'utilitiesExpenses') {
        utilities_expenses[name] = value;
        initialSubcategories.expenses[name] = 'Utilitati';
      } else if (category === 'operationalExpenses') {
        operational_expenses[name] = value;
        initialSubcategories.expenses[name] = 'Operationale';
      } else if (category === 'otherExpenses') {
        other_expenses[name] = value;
        initialSubcategories.expenses[name] = 'Alte Cheltuieli';
      }
      
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert({
          date: dateKey,
          user_id: user.id,
          revenue_items,
          bucatarie_items,
          bar_items,
          cost_of_goods_items,
          salary_expenses,
          distributor_expenses,
          utilities_expenses,
          operational_expenses,
          other_expenses,
          subcategories: initialSubcategories as Record<string, unknown> // Type cast to avoid TS error
        });
      
      if (insertError) {
        console.error("Error inserting report:", insertError);
        throw insertError;
      }
      
      console.log(`Successfully created new report and added ${name} to ${category} with value ${value}`);
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
      
      if (category === 'bucatarieItems') {
        // Update separate bucatarie_items
        const currentBucatarieItems = typedReport.bucatarie_items || {};
        updatedData.bucatarie_items = {
          ...currentBucatarieItems,
          [name]: value
        };
        
        // Update the combined revenue_items
        const currentRevenueItems = typedReport.revenue_items || {};
        updatedData.revenue_items = {
          ...currentRevenueItems,
          [name]: value
        };
      } else if (category === 'barItems') {
        // Update separate bar_items
        const currentBarItems = typedReport.bar_items || {};
        updatedData.bar_items = {
          ...currentBarItems,
          [name]: value
        };
        
        // Update the combined revenue_items
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
      
      if (category === 'bucatarieItems') {
        const currentBucatarieItems = typedReport.bucatarie_items || {};
        
        if (currentBucatarieItems[oldName] !== undefined) {
          const value = currentBucatarieItems[oldName];
          const newBucatarieItems = { ...currentBucatarieItems };
          delete newBucatarieItems[oldName];
          newBucatarieItems[newName] = value;
          updatedData.bucatarie_items = newBucatarieItems;
          
          // Update combined revenue items
