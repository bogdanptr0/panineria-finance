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
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!pl_reports) {
      return null;
    }

    // Safely handle subcategories with default empty objects
    const subcategories = pl_reports.subcategories ? pl_reports.subcategories as {
      revenueItems?: Record<string, string>;
      expenses?: Record<string, string>;
    } : { revenueItems: {}, expenses: {} };

    return {
      date: pl_reports.date,
      revenueItems: pl_reports.revenue_items as Record<string, number> || {},
      costOfGoodsItems: pl_reports.cost_of_goods_items as Record<string, number> || {},
      salaryExpenses: pl_reports.salary_expenses as Record<string, number> || {},
      distributorExpenses: pl_reports.distributor_expenses as Record<string, number> || {},
      utilitiesExpenses: pl_reports.utilities_expenses as Record<string, number> || {},
      operationalExpenses: pl_reports.operational_expenses as Record<string, number> || {},
      otherExpenses: pl_reports.other_expenses as Record<string, number> || {},
      budget: pl_reports.budget as { 
        targetRevenue: number; 
        targetExpenses: number; 
        targetProfit: number; 
      },
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

    return pl_reports.map(report => ({
      date: report.date,
      revenueItems: report.revenue_items as Record<string, number> || {},
      costOfGoodsItems: report.cost_of_goods_items as Record<string, number> || {},
      salaryExpenses: report.salary_expenses as Record<string, number> || {},
      distributorExpenses: report.distributor_expenses as Record<string, number> || {},
      utilitiesExpenses: report.utilities_expenses as Record<string, number> || {},
      operationalExpenses: report.operational_expenses as Record<string, number> || {},
      otherExpenses: report.other_expenses as Record<string, number> || {},
      budget: report.budget as { 
        targetRevenue: number; 
        targetExpenses: number; 
        targetProfit: number; 
      },
      subcategories: report.subcategories as {
        revenueItems?: Record<string, string>;
        expenses?: Record<string, string>;
      } || { revenueItems: {}, expenses: {} }
    }));
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
          subcategories: subcategories || { revenueItems: {}, expenses: {} },
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
          subcategories: subcategories || { revenueItems: {}, expenses: {} }
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
      let updatedData: Record<string, any> = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = existingReport.revenue_items as Record<string, number> || {};
        const newRevenueItems = { ...currentRevenueItems };
        delete newRevenueItems[name];
        updatedData.revenue_items = newRevenueItems;
        
        // Also remove from subcategories tracking
        const currentSubcategories = existingReport.subcategories || {};
        const currentRevenueSubcategories = (currentSubcategories as any).revenueItems || {};
        const newRevenueSubcategories = { ...currentRevenueSubcategories };
        delete newRevenueSubcategories[name];
        
        updatedData.subcategories = {
          ...(currentSubcategories as any),
          revenueItems: newRevenueSubcategories
        };
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = existingReport.salary_expenses as Record<string, number> || {};
        const newSalaryExpenses = { ...currentSalaryExpenses };
        delete newSalaryExpenses[name];
        updatedData.salary_expenses = newSalaryExpenses;
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = existingReport.distributor_expenses as Record<string, number> || {};
        const newDistributorExpenses = { ...currentDistributorExpenses };
        delete newDistributorExpenses[name];
        updatedData.distributor_expenses = newDistributorExpenses;
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = existingReport.utilities_expenses as Record<string, number> || {};
        const newUtilitiesExpenses = { ...currentUtilitiesExpenses };
        delete newUtilitiesExpenses[name];
        updatedData.utilities_expenses = newUtilitiesExpenses;
        
        // Also remove from subcategories tracking
        const currentSubcategories = existingReport.subcategories || {};
        const currentExpenseSubcategories = (currentSubcategories as any).expenses || {};
        const newExpenseSubcategories = { ...currentExpenseSubcategories };
        delete newExpenseSubcategories[name];
        
        updatedData.subcategories = {
          ...(currentSubcategories as any),
          expenses: newExpenseSubcategories
        };
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = existingReport.operational_expenses as Record<string, number> || {};
        const newOperationalExpenses = { ...currentOperationalExpenses };
        delete newOperationalExpenses[name];
        updatedData.operational_expenses = newOperationalExpenses;
        
        // Also remove from subcategories tracking
        const currentSubcategories = existingReport.subcategories || {};
        const currentExpenseSubcategories = (currentSubcategories as any).expenses || {};
        const newExpenseSubcategories = { ...currentExpenseSubcategories };
        delete newExpenseSubcategories[name];
        
        updatedData.subcategories = {
          ...(currentSubcategories as any),
          expenses: newExpenseSubcategories
        };
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = existingReport.other_expenses as Record<string, number> || {};
        const newOtherExpenses = { ...currentOtherExpenses };
        delete newOtherExpenses[name];
        updatedData.other_expenses = newOtherExpenses;
        
        // Also remove from subcategories tracking
        const currentSubcategories = existingReport.subcategories || {};
        const currentExpenseSubcategories = (currentSubcategories as any).expenses || {};
        const newExpenseSubcategories = { ...currentExpenseSubcategories };
        delete newExpenseSubcategories[name];
        
        updatedData.subcategories = {
          ...(currentSubcategories as any),
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
      let updatedData: Record<string, any> = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = existingReport.revenue_items as Record<string, number> || {};
        updatedData.revenue_items = {
          ...currentRevenueItems,
          [name]: value
        };
        
        // Track the subcategory
        const currentSubcategories = existingReport.subcategories || {};
        const currentRevenueSubcategories = (currentSubcategories as any).revenueItems || {};
        
        updatedData.subcategories = {
          ...(currentSubcategories as any),
          revenueItems: {
            ...currentRevenueSubcategories,
            [name]: category === 'bucatarieItems' ? 'Bucatarie' : 'Bar'
          }
        };
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = existingReport.salary_expenses as Record<string, number> || {};
        updatedData.salary_expenses = {
          ...currentSalaryExpenses,
          [name]: value
        };
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = existingReport.distributor_expenses as Record<string, number> || {};
        updatedData.distributor_expenses = {
          ...currentDistributorExpenses,
          [name]: value
        };
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = existingReport.utilities_expenses as Record<string, number> || {};
        updatedData.utilities_expenses = {
          ...currentUtilitiesExpenses,
          [name]: value
        };
        
        // Track the subcategory
        const currentSubcategories = existingReport.subcategories || {};
        const currentExpenseSubcategories = (currentSubcategories as any).expenses || {};
        
        updatedData.subcategories = {
          ...(currentSubcategories as any),
          expenses: {
            ...currentExpenseSubcategories,
            [name]: 'Utilitati'
          }
        };
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = existingReport.operational_expenses as Record<string, number> || {};
        updatedData.operational_expenses = {
          ...currentOperationalExpenses,
          [name]: value
        };
        
        // Track the subcategory
        const currentSubcategories = existingReport.subcategories || {};
        const currentExpenseSubcategories = (currentSubcategories as any).expenses || {};
        
        updatedData.subcategories = {
          ...(currentSubcategories as any),
          expenses: {
            ...currentExpenseSubcategories,
            [name]: 'Operationale'
          }
        };
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = existingReport.other_expenses as Record<string, number> || {};
        updatedData.other_expenses = {
          ...currentOtherExpenses,
          [name]: value
        };
        
        // Track the subcategory
        const currentSubcategories = existingReport.subcategories || {};
        const currentExpenseSubcategories = (currentSubcategories as any).expenses || {};
        
        updatedData.subcategories = {
          ...(currentSubcategories as any),
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
      const subcategories: any = {
        revenueItems: {},
        expenses: {}
      };
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        subcategories.revenueItems[name] = category === 'bucatarieItems' ? 'Bucatarie' : 'Bar';
      } else if (category === 'utilitiesExpenses') {
        subcategories.expenses[name] = 'Utilitati';
      } else if (category === 'operationalExpenses') {
        subcategories.expenses[name] = 'Operationale';
      } else if (category === 'otherExpenses') {
        subcategories.expenses[name] = 'Alte Cheltuieli';
      }
      
      const reportData: Record<string, any> = {
        date: dateKey,
        user_id: user.id,
        revenue_items: {} as Record<string, number>,
        cost_of_goods_items: {} as Record<string, number>,
        salary_expenses: {} as Record<string, number>,
        distributor_expenses: {} as Record<string, number>,
        utilities_expenses: {} as Record<string, number>,
        operational_expenses: {} as Record<string, number>,
        other_expenses: {} as Record<string, number>,
        subcategories
      };
      
      if (category === 'bucatarieItems') {
        reportData.revenue_items = { [name]: value };
      } else if (category === 'barItems') {
        reportData.revenue_items = { [name]: value };
      } else if (category === 'salaryExpenses') {
        reportData.salary_expenses = { [name]: value };
      } else if (category === 'distributorExpenses') {
        reportData.distributor_expenses = { [name]: value };
      } else if (category === 'utilitiesExpenses') {
        reportData.utilities_expenses = { [name]: value };
      } else if (category === 'operationalExpenses') {
        reportData.operational_expenses = { [name]: value };
      } else if (category === 'otherExpenses') {
        reportData.other_expenses = { [name]: value };
      }
      
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert(reportData);
      
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
      let updatedData: Record<string, any> = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = existingReport.revenue_items as Record<string, number> || {};
        updatedData.revenue_items = {
          ...currentRevenueItems,
          [name]: value
        };
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = existingReport.salary_expenses as Record<string, number> || {};
        updatedData.salary_expenses = {
          ...currentSalaryExpenses,
          [name]: value
        };
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = existingReport.distributor_expenses as Record<string, number> || {};
        updatedData.distributor_expenses = {
          ...currentDistributorExpenses,
          [name]: value
        };
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = existingReport.utilities_expenses as Record<string, number> || {};
        updatedData.utilities_expenses = {
          ...currentUtilitiesExpenses,
          [name]: value
        };
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = existingReport.operational_expenses as Record<string, number> || {};
        updatedData.operational_expenses = {
          ...currentOperationalExpenses,
          [name]: value
        };
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = existingReport.other_expenses as Record<string, number> || {};
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
      let updatedData: Record<string, any> = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = existingReport.revenue_items as Record<string, number> || {};
        
        if (currentRevenueItems[oldName] !== undefined) {
          const value = currentRevenueItems[oldName];
          delete currentRevenueItems[oldName];
          currentRevenueItems[newName] = value;
          updatedData.revenue_items = currentRevenueItems;
        }
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = existingReport.salary_expenses as Record<string, number> || {};
        
        if (currentSalaryExpenses[oldName] !== undefined) {
          const value = currentSalaryExpenses[oldName];
          delete currentSalaryExpenses[oldName];
          currentSalaryExpenses[newName] = value;
          updatedData.salary_expenses = currentSalaryExpenses;
        }
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = existingReport.distributor_expenses as Record<string, number> || {};
        
        if (currentDistributorExpenses[oldName] !== undefined) {
          const value = currentDistributorExpenses[oldName];
          delete currentDistributorExpenses[oldName];
          currentDistributorExpenses[newName] = value;
          updatedData.distributor_expenses = currentDistributorExpenses;
        }
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = existingReport.utilities_expenses as Record<string, number> || {};
        
        if (currentUtilitiesExpenses[oldName] !== undefined) {
          const value = currentUtilitiesExpenses[oldName];
          delete currentUtilitiesExpenses[oldName];
          currentUtilitiesExpenses[newName] = value;
          updatedData.utilities_expenses = currentUtilitiesExpenses;
        }
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = existingReport.operational_expenses as Record<string, number> || {};
        
        if (currentOperationalExpenses[oldName] !== undefined) {
          const value = currentOperationalExpenses[oldName];
          delete currentOperationalExpenses[oldName];
          currentOperationalExpenses[newName] = value;
          updatedData.operational_expenses = currentOperationalExpenses;
        }
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = existingReport.other_expenses as Record<string, number> || {};
        
        if (currentOtherExpenses[oldName] !== undefined) {
          const value = currentOtherExpenses[oldName];
          delete currentOtherExpenses[oldName];
          currentOtherExpenses[newName] = value;
          updatedData.other_expenses = currentOtherExpenses;
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
