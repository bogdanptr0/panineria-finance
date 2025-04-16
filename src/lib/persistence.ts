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

    return {
      date: pl_reports.date,
      revenueItems: pl_reports.revenue_items || {},
      costOfGoodsItems: pl_reports.cost_of_goods_items || {},
      salaryExpenses: pl_reports.salary_expenses || {},
      distributorExpenses: pl_reports.distributor_expenses || {},
      utilitiesExpenses: pl_reports.utilities_expenses || {},
      operationalExpenses: pl_reports.operational_expenses || {},
      otherExpenses: pl_reports.other_expenses || {},
      budget: pl_reports.budget
    };
  } catch (error) {
    console.error("Error loading report:", error);
    return null;
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
  }
): Promise<void> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    console.log("Saving report for date:", dateKey);
    console.log("Revenue items:", revenueItems);
    
    // Check if report exists
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
      // Update existing report
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
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReport.id);
      
      if (updateError) {
        console.error("Error updating report:", updateError);
        throw updateError;
      }
    } else {
      // Insert new report
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
          budget
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

    // Fetch all reports for the user
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

    // Define default salaries
    const defaultSalaries = {
      "Adi": 4050,
      "Ioana": 4050,
      "Andreea": 4050,
      "Victoria": 4050
    };

    // Update reports that don't have the default salaries
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
          continue; // Don't throw, just continue to the next report
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

  // Helper function to add rows
  const addRow = (title: string, items: Record<string, number>) => {
    csvRows.push([title]);
    Object.entries(items).forEach(([key, value]) => {
      csvRows.push([key, value.toString()]);
    });
    csvRows.push([]); // Empty row for spacing
  };

  // Add data
  addRow("Revenue Items", report.revenueItems);
  addRow("Cost of Goods Items", report.costOfGoodsItems);
  addRow("Salary Expenses", report.salaryExpenses);
  addRow("Distributor Expenses", report.distributorExpenses);
  addRow("Utilities Expenses", report.utilitiesExpenses);
  addRow("Operational Expenses", report.operationalExpenses);
  addRow("Other Expenses", report.otherExpenses);

  // Convert to CSV format
  const csvContent = csvRows.map(row => row.join(",")).join("\n");

  // Create a download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "report.csv");
  document.body.appendChild(link); // Required for Firefox
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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    // Check if report exists
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
      let updatedData: any = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = existingReport.revenue_items || {};
        const newRevenueItems = { ...currentRevenueItems };
        delete newRevenueItems[name];
        updatedData.revenue_items = newRevenueItems;
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = existingReport.salary_expenses || {};
        const newSalaryExpenses = { ...currentSalaryExpenses };
        delete newSalaryExpenses[name];
        updatedData.salary_expenses = newSalaryExpenses;
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = existingReport.distributor_expenses || {};
        const newDistributorExpenses = { ...currentDistributorExpenses };
        delete newDistributorExpenses[name];
        updatedData.distributor_expenses = newDistributorExpenses;
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = existingReport.utilities_expenses || {};
        const newUtilitiesExpenses = { ...currentUtilitiesExpenses };
        delete newUtilitiesExpenses[name];
        updatedData.utilities_expenses = newUtilitiesExpenses;
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = existingReport.operational_expenses || {};
        const newOperationalExpenses = { ...currentOperationalExpenses };
        delete newOperationalExpenses[name];
        updatedData.operational_expenses = newOperationalExpenses;
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = existingReport.other_expenses || {};
        const newOtherExpenses = { ...currentOtherExpenses };
        delete newOtherExpenses[name];
        updatedData.other_expenses = newOtherExpenses;
      }
      
      updatedData.updated_at = new Date().toISOString();
      
      // Update existing report
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
  value: number
): Promise<void> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    // Check if report exists
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
      let updatedData: any = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = existingReport.revenue_items || {};
        updatedData.revenue_items = {
          ...currentRevenueItems,
          [name]: value
        };
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = existingReport.salary_expenses || {};
        updatedData.salary_expenses = {
          ...currentSalaryExpenses,
          [name]: value
        };
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = existingReport.distributor_expenses || {};
        updatedData.distributor_expenses = {
          ...currentDistributorExpenses,
          [name]: value
        };
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = existingReport.utilities_expenses || {};
        updatedData.utilities_expenses = {
          ...currentUtilitiesExpenses,
          [name]: value
        };
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = existingReport.operational_expenses || {};
        updatedData.operational_expenses = {
          ...currentOperationalExpenses,
          [name]: value
        };
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = existingReport.other_expenses || {};
        updatedData.other_expenses = {
          ...currentOtherExpenses,
          [name]: value
        };
      }
      
      updatedData.updated_at = new Date().toISOString();
      
      // Update existing report
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updatedData)
        .eq('id', existingReport.id);
      
      if (updateError) {
        console.error("Error updating report:", updateError);
        throw updateError;
      }
    } else {
      // Create default report structure
      let reportData: any = {
        date: dateKey,
        user_id: user.id,
        revenue_items: {},
        cost_of_goods_items: {},
        salary_expenses: {},
        distributor_expenses: {},
        utilities_expenses: {},
        operational_expenses: {},
        other_expenses: {}
      };
      
      // Add new item to appropriate category
      if (category === 'bucatarieItems' || category === 'barItems') {
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
      
      // Insert new report
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert(reportData);
      
      if (insertError) {
        console.error("Error inserting report:", insertError);
        throw insertError;
      }
    }
    
    // Force re-save the entire report to ensure all data is synced
    await saveReport(
      month,
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      undefined
    );
    
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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    // Check if report exists
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
      let updatedData: any = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = existingReport.revenue_items || {};
        updatedData.revenue_items = {
          ...currentRevenueItems,
          [name]: value
        };
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = existingReport.salary_expenses || {};
        updatedData.salary_expenses = {
          ...currentSalaryExpenses,
          [name]: value
        };
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = existingReport.distributor_expenses || {};
        updatedData.distributor_expenses = {
          ...currentDistributorExpenses,
          [name]: value
        };
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = existingReport.utilities_expenses || {};
        updatedData.utilities_expenses = {
          ...currentUtilitiesExpenses,
          [name]: value
        };
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = existingReport.operational_expenses || {};
        updatedData.operational_expenses = {
          ...currentOperationalExpenses,
          [name]: value
        };
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = existingReport.other_expenses || {};
        updatedData.other_expenses = {
          ...currentOtherExpenses,
          [name]: value
        };
      }
      
      updatedData.updated_at = new Date().toISOString();
      
      // Update existing report
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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    // Check if report exists
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
      let updatedData: any = {};
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const currentRevenueItems = existingReport.revenue_items || {};
        
        if (currentRevenueItems[oldName] !== undefined) {
          const value = currentRevenueItems[oldName];
          delete currentRevenueItems[oldName];
          currentRevenueItems[newName] = value;
          updatedData.revenue_items = currentRevenueItems;
        }
      } else if (category === 'salaryExpenses') {
        const currentSalaryExpenses = existingReport.salary_expenses || {};
        
        if (currentSalaryExpenses[oldName] !== undefined) {
          const value = currentSalaryExpenses[oldName];
          delete currentSalaryExpenses[oldName];
          currentSalaryExpenses[newName] = value;
          updatedData.salary_expenses = currentSalaryExpenses;
        }
      } else if (category === 'distributorExpenses') {
        const currentDistributorExpenses = existingReport.distributor_expenses || {};
        
        if (currentDistributorExpenses[oldName] !== undefined) {
          const value = currentDistributorExpenses[oldName];
          delete currentDistributorExpenses[oldName];
          currentDistributorExpenses[newName] = value;
          updatedData.distributor_expenses = currentDistributorExpenses;
        }
      } else if (category === 'utilitiesExpenses') {
        const currentUtilitiesExpenses = existingReport.utilities_expenses || {};
        
        if (currentUtilitiesExpenses[oldName] !== undefined) {
          const value = currentUtilitiesExpenses[oldName];
          delete currentUtilitiesExpenses[oldName];
          currentUtilitiesExpenses[newName] = value;
          updatedData.utilities_expenses = currentUtilitiesExpenses;
        }
      } else if (category === 'operationalExpenses') {
        const currentOperationalExpenses = existingReport.operational_expenses || {};
        
        if (currentOperationalExpenses[oldName] !== undefined) {
          const value = currentOperationalExpenses[oldName];
          delete currentOperationalExpenses[oldName];
          currentOperationalExpenses[newName] = value;
          updatedData.operational_expenses = currentOperationalExpenses;
        }
      } else if (category === 'otherExpenses') {
        const currentOtherExpenses = existingReport.other_expenses || {};
        
        if (currentOtherExpenses[oldName] !== undefined) {
          const value = currentOtherExpenses[oldName];
          delete currentOtherExpenses[oldName];
          currentOtherExpenses[newName] = value;
          updatedData.other_expenses = currentOtherExpenses;
        }
      }
      
      updatedData.updated_at = new Date().toISOString();
      
      // Update existing report
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
