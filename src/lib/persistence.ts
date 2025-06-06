
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_BUCATARIE_ITEMS, DEFAULT_TAZZ_ITEMS, DEFAULT_BAR_ITEMS } from "@/lib/constants";

// Return type for loadReport
export type ReportData = {
  bucatarieItems: Record<string, number>;
  tazzItems: Record<string, number>;
  barItems: Record<string, number>;
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  utilitiesExpenses: Record<string, number>;
  operationalExpenses: Record<string, number>;
  otherExpenses: Record<string, number>;
  budget: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  } | undefined;
};

// Load report from database
export async function loadReport(month: Date): Promise<ReportData | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    const formattedDate = format(month, "yyyy-MM");

    let { data: pl_reports, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error("Error fetching report:", error);
      return null;
    }

    if (!pl_reports) {
      // If no report exists, create one with default items
      const defaultReport = await createDefaultReport(formattedDate, user.id);
      return defaultReport;
    }

    return {
      bucatarieItems: pl_reports.bucatarie_items as Record<string, number> || DEFAULT_BUCATARIE_ITEMS,
      tazzItems: pl_reports.tazz_items as Record<string, number> || DEFAULT_TAZZ_ITEMS,
      barItems: pl_reports.bar_items as Record<string, number> || DEFAULT_BAR_ITEMS,
      salaryExpenses: pl_reports.salary_expenses as Record<string, number>,
      distributorExpenses: pl_reports.distributor_expenses as Record<string, number>,
      utilitiesExpenses: pl_reports.utilities_expenses as Record<string, number>,
      operationalExpenses: pl_reports.operational_expenses as Record<string, number>,
      otherExpenses: pl_reports.other_expenses as Record<string, number>,
      budget: pl_reports.budget as {
        targetRevenue: number;
        targetExpenses: number;
        targetProfit: number;
      } | undefined
    };
  } catch (error) {
    console.error("Error in loadReport:", error);
    return null;
  }
}

// New function to create a default report with default items
async function createDefaultReport(formattedDate: string, userId: string): Promise<ReportData | null> {
  const defaultReportData = {
    date: formattedDate,
    user_id: userId,
    bucatarie_items: DEFAULT_BUCATARIE_ITEMS,
    tazz_items: DEFAULT_TAZZ_ITEMS,
    bar_items: DEFAULT_BAR_ITEMS,
    cost_of_goods_items: {},
    revenue_items: {}, // Add empty revenue_items to make the schema happy
    salary_expenses: {
      "Adi": 4050,
      "Ioana": 4050,
      "Andreea": 4050,
      "Victoria": 4050
    },
    distributor_expenses: {
      "Maria FoodNova": 0,
      "CocaCola": 0,
      "24H": 0,
      "Sinless": 0,
      "Peroni": 0,
      "Sudavangarde(Brutarie Foccacia)": 0,
      "Proporzioni": 0,
      "LIDL": 0,
      "Metro": 0
    },
    operational_expenses: {
      "Contabilitate": 0,
      "ECR": 0,
      "ISU": 0,
      "Chirie": 0,
      "Protectia Muncii": 0
    },
    utilities_expenses: {
      "Gaze(Engie)": 0,
      "Apa": 0,
      "Curent": 0,
      "Gunoi(Iridex)": 0,
      "Internet": 0
    },
    other_expenses: {},
    budget: undefined
  };

  const { data, error } = await supabase
    .from('pl_reports')
    .insert(defaultReportData)
    .select()
    .single();

  if (error) {
    console.error("Error creating default report:", error);
    return null;
  }

  return {
    bucatarieItems: DEFAULT_BUCATARIE_ITEMS,
    tazzItems: DEFAULT_TAZZ_ITEMS,
    barItems: DEFAULT_BAR_ITEMS,
    salaryExpenses: defaultReportData.salary_expenses,
    distributorExpenses: defaultReportData.distributor_expenses,
    utilitiesExpenses: defaultReportData.utilities_expenses,
    operationalExpenses: defaultReportData.operational_expenses,
    otherExpenses: defaultReportData.other_expenses,
    budget: defaultReportData.budget
  };
}

// Update the batchAddRevenueItems function to use the new columns
export async function batchAddRevenueItems(
  month: Date, 
  items: Record<string, number>,
  section: 'bucatarie' | 'tazz' | 'bar' = 'bucatarie'
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    const formattedDate = format(month, "yyyy-MM");
    
    // Check if report exists
    const { data: existingReport, error: reportError } = await supabase
      .from('pl_reports')
      .select('id, bucatarie_items, tazz_items, bar_items')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .single();
      
    if (reportError && reportError.code !== 'PGRST116') {
      console.error("Error fetching report:", reportError);
      return false;
    }
    
    if (existingReport) {
      // Update specific section items
      const updateData: any = {};
      switch(section) {
        case 'bucatarie':
          updateData.bucatarie_items = items;
          break;
        case 'tazz':
          updateData.tazz_items = items;
          break;
        case 'bar':
          updateData.bar_items = items;
          break;
      }
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updateData)
        .eq('id', existingReport.id);
        
      if (updateError) {
        console.error(`Error updating ${section}_items:`, updateError);
        return false;
      }
      
      return true;
    } else {
      // Create default report with section-specific items
      const defaultReportData = {
        date: formattedDate,
        user_id: user.id,
        bucatarie_items: section === 'bucatarie' ? items : {},
        tazz_items: section === 'tazz' ? items : {},
        bar_items: section === 'bar' ? items : {},
        cost_of_goods_items: {},
        revenue_items: {}, // Add empty revenue_items to make the schema happy
        salary_expenses: {
          "Adi": 4050,
          "Ioana": 4050,
          "Andreea": 4050,
          "Victoria": 4050
        },
        distributor_expenses: {
          "Maria FoodNova": 0,
          "CocaCola": 0,
          "24H": 0,
          "Sinless": 0,
          "Peroni": 0,
          "Sudavangarde(Brutarie Foccacia)": 0,
          "Proporzioni": 0,
          "LIDL": 0,
          "Metro": 0
        },
        operational_expenses: {
          "Contabilitate": 0,
          "ECR": 0,
          "ISU": 0,
          "Chirie": 0,
          "Protectia Muncii": 0
        },
        utilities_expenses: {
          "Gaze(Engie)": 0,
          "Apa": 0,
          "Curent": 0,
          "Gunoi(Iridex)": 0,
          "Internet": 0
        },
        other_expenses: {},
        budget: undefined
      };
      
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert(defaultReportData);
        
      if (insertError) {
        console.error("Error inserting new report:", insertError);
        return false;
      }
      
      return true;
    }
  } catch (error) {
    console.error("Batch add revenue items error:", error);
    return false;
  }
}

export async function updateAllReportsWithDefaultSalaries() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    // Fetch all reports for the user
    let { data: pl_reports, error } = await supabase
      .from('pl_reports')
      .select('id, salary_expenses')
      .eq('user_id', user.id);

    if (error) {
      console.error("Error fetching reports:", error);
      return;
    }

    if (!pl_reports || pl_reports.length === 0) {
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

    // Iterate through each report and update salary_expenses if it's null or empty
    for (const report of pl_reports) {
      if (!report.salary_expenses || Object.keys(report.salary_expenses).length === 0) {
        // Update the report with default salaries
        const { error: updateError } = await supabase
          .from('pl_reports')
          .update({ salary_expenses: defaultSalaries })
          .eq('id', report.id);

        if (updateError) {
          console.error(`Error updating report ${report.id}:`, updateError);
        } else {
          console.log(`Updated report ${report.id} with default salaries.`);
        }
      } else {
        console.log(`Report ${report.id} already has salary expenses. Skipping update.`);
      }
    }

    console.log("Completed updating reports with default salaries.");

  } catch (error) {
    console.error("Error in updateAllReportsWithDefaultSalaries:", error);
  }
}

export async function saveReport(
  month: Date,
  bucatarieItems: Record<string, number>,
  tazzItems: Record<string, number>,
  barItems: Record<string, number>,
  costOfGoodsItems: Record<string, number>,
  salaryExpenses: Record<string, number>,
  distributorExpenses: Record<string, number>,
  utilitiesExpenses: Record<string, number>,
  operationalExpenses: Record<string, number>,
  otherExpenses: Record<string, number>,
  budget: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  } | undefined
): Promise<any> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const formattedDate = format(month, "yyyy-MM");

    // Check if a report already exists for the given month and user
    const { data: existingReport, error: selectError } = await supabase
      .from('pl_reports')
      .select('id')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error("Error checking for existing report:", selectError);
      throw selectError;
    }

    if (existingReport) {
      // Update the existing report
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update({
          bucatarie_items: bucatarieItems,
          tazz_items: tazzItems,
          bar_items: barItems,
          cost_of_goods_items: costOfGoodsItems,
          revenue_items: {}, // Add empty revenue_items to keep the schema happy
          salary_expenses: salaryExpenses,
          distributor_expenses: distributorExpenses,
          utilities_expenses: utilitiesExpenses,
          operational_expenses: operationalExpenses,
          other_expenses: otherExpenses,
          budget: budget
        })
        .eq('id', existingReport.id);

      if (updateError) {
        console.error("Error updating report:", updateError);
        throw updateError;
      }

      return { success: true, message: "Report updated successfully" };
    } else {
      // Create a new report
      const newReport = {
        date: formattedDate,
        user_id: user.id,
        bucatarie_items: bucatarieItems,
        tazz_items: tazzItems,
        bar_items: barItems,
        cost_of_goods_items: costOfGoodsItems,
        revenue_items: {}, // Add empty revenue_items to keep the schema happy
        salary_expenses: salaryExpenses,
        distributor_expenses: distributorExpenses,
        utilities_expenses: utilitiesExpenses,
        operational_expenses: operationalExpenses,
        other_expenses: otherExpenses,
        budget: budget
      };

      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert(newReport);

      if (insertError) {
        console.error("Error creating report:", insertError);
        throw insertError;
      }

      return { success: true, message: "Report created successfully" };
    }
  } catch (error) {
    console.error("Error in saveReport:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteItemFromSupabase(
  month: Date,
  section: 'bucatarie_items' | 'tazz_items' | 'bar_items' | 'cost_of_goods_items' | 'salary_expenses' | 'distributor_expenses' | 'utilities_expenses' | 'operational_expenses' | 'other_expenses',
  itemName: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    const formattedDate = format(month, "yyyy-MM");

    // Fetch the report for the given month and user
    const { data: existingReport, error: reportError } = await supabase
      .from('pl_reports')
      .select(`id, ${section}`)
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .single();

    if (reportError) {
      console.error("Error fetching report:", reportError);
      return false;
    }

    if (!existingReport) {
      console.log("Report not found for the given month and user.");
      return false;
    }

    const sectionItems = existingReport[section] as Record<string, number> || {};

    if (!sectionItems[itemName]) {
      console.log(`Item "${itemName}" not found in section "${section}".`);
      return false;
    }

    // Remove the item from the section
    delete sectionItems[itemName];

    // Update the report in Supabase with the modified section
    const { error: updateError } = await supabase
      .from('pl_reports')
      .update({ [section]: sectionItems })
      .eq('id', existingReport.id);

    if (updateError) {
      console.error(`Error updating ${section}:`, updateError);
      return false;
    }

    return true;

  } catch (error) {
    console.error("Error deleting item from Supabase:", error);
    return false;
  }
}

export async function addItemToSupabase(
  month: Date,
  section: 'salary_expenses' | 'distributor_expenses' | 'utilities_expenses' | 'operational_expenses' | 'other_expenses',
  itemName: string,
  itemValue: number
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    const formattedDate = format(month, "yyyy-MM");

    // Check if report exists
    const { data: existingReport, error: reportError } = await supabase
      .from('pl_reports')
      .select(`id, ${section}`)
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .single();

    if (reportError && reportError.code !== 'PGRST116') {
      console.error("Error fetching report:", reportError);
      return false;
    }

    if (existingReport) {
      const sectionItems = existingReport[section] as Record<string, number> || {};
      const updatedItems = { ...sectionItems, [itemName]: itemValue };

      const { error: updateError } = await supabase
        .from('pl_reports')
        .update({ [section]: updatedItems })
        .eq('id', existingReport.id);

      if (updateError) {
        console.error(`Error updating ${section}:`, updateError);
        return false;
      }

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Add item error:", error);
    return false;
  }
}

export async function updateItemInSupabase(
  month: Date,
  section: 'bucatarie_items' | 'tazz_items' | 'bar_items' | 'salary_expenses' | 'distributor_expenses' | 'utilities_expenses' | 'operational_expenses' | 'other_expenses',
  itemName: string,
  itemValue: number
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    const formattedDate = format(month, "yyyy-MM");

    // Fetch the report for the given month and user
    const { data: existingReport, error: reportError } = await supabase
      .from('pl_reports')
      .select('id, bucatarie_items, tazz_items, bar_items, cost_of_goods_items, salary_expenses, distributor_expenses, utilities_expenses, operational_expenses, other_expenses')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .single();

    if (reportError) {
      console.error("Error fetching report:", reportError);
      return false;
    }

    if (!existingReport) {
      console.log("Report not found for the given month and user.");
      return false;
    }

    let sectionItems: Record<string, number> = {};

    if (section === 'bucatarie_items') {
      sectionItems = (existingReport.bucatarie_items || {}) as Record<string, number>;
    } else if (section === 'tazz_items') {
      sectionItems = (existingReport.tazz_items || {}) as Record<string, number>;
    } else if (section === 'bar_items') {
      sectionItems = (existingReport.bar_items || {}) as Record<string, number>;  
    } else if (section === 'salary_expenses') {
      sectionItems = (existingReport.salary_expenses || {}) as Record<string, number>;
    } else if (section === 'distributor_expenses') {
      sectionItems = (existingReport.distributor_expenses || {}) as Record<string, number>;
    } else if (section === 'utilities_expenses') {
      sectionItems = (existingReport.utilities_expenses || {}) as Record<string, number>;
    } else if (section === 'operational_expenses') {
      sectionItems = (existingReport.operational_expenses || {}) as Record<string, number>;
    } else if (section === 'other_expenses') {
      sectionItems = (existingReport.other_expenses || {}) as Record<string, number>;
    }

    // Update the item value
    sectionItems[itemName] = itemValue;

    // Prepare the update object
    let updateObject: any = {};

    if (section === 'bucatarie_items') {
      updateObject.bucatarie_items = sectionItems;
    } else if (section === 'tazz_items') {
      updateObject.tazz_items = sectionItems;
    } else if (section === 'bar_items') {
      updateObject.bar_items = sectionItems;
    } else if (section === 'salary_expenses') {
      updateObject.salary_expenses = sectionItems;
    } else if (section === 'distributor_expenses') {
      updateObject.distributor_expenses = sectionItems;
    } else if (section === 'utilities_expenses') {
      updateObject.utilities_expenses = sectionItems;
    } else if (section === 'operational_expenses') {
      updateObject.operational_expenses = sectionItems;
    } else if (section === 'other_expenses') {
      updateObject.other_expenses = sectionItems;
    }

    // Update the report in Supabase with the modified section
    const { error: updateError } = await supabase
      .from('pl_reports')
      .update(updateObject)
      .eq('id', existingReport.id);

    if (updateError) {
      console.error(`Error updating ${section}:`, updateError);
      return false;
    }

    return true;

  } catch (error) {
    console.error("Error updating item in Supabase:", error);
    return false;
  }
}

export async function renameItemInSupabase(
  month: Date,
  section: 'bucatarie_items' | 'tazz_items' | 'bar_items' | 'salary_expenses' | 'distributor_expenses' | 'utilities_expenses' | 'operational_expenses' | 'other_expenses',
  oldName: string,
  newName: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    const formattedDate = format(month, "yyyy-MM");

    // Fetch the report for the given month and user
    const { data: existingReport, error: reportError } = await supabase
      .from('pl_reports')
      .select('id, bucatarie_items, tazz_items, bar_items, cost_of_goods_items, salary_expenses, distributor_expenses, utilities_expenses, operational_expenses, other_expenses')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .single();

    if (reportError) {
      console.error("Error fetching report:", reportError);
      return false;
    }

    if (!existingReport) {
      console.log("Report not found for the given month and user.");
      return false;
    }

    let sectionItems: Record<string, number> = {};

    if (section === 'bucatarie_items') {
      sectionItems = (existingReport.bucatarie_items || {}) as Record<string, number>;
    } else if (section === 'tazz_items') {
      sectionItems = (existingReport.tazz_items || {}) as Record<string, number>;
    } else if (section === 'bar_items') {
      sectionItems = (existingReport.bar_items || {}) as Record<string, number>;  
    } else if (section === 'salary_expenses') {
      sectionItems = (existingReport.salary_expenses || {}) as Record<string, number>;
    } else if (section === 'distributor_expenses') {
      sectionItems = (existingReport.distributor_expenses || {}) as Record<string, number>;
    } else if (section === 'utilities_expenses') {
      sectionItems = (existingReport.utilities_expenses || {}) as Record<string, number>;
    } else if (section === 'operational_expenses') {
      sectionItems = (existingReport.operational_expenses || {}) as Record<string, number>;
    } else if (section === 'other_expenses') {
      sectionItems = (existingReport.other_expenses || {}) as Record<string, number>;
    }

    if (!sectionItems[oldName]) {
      console.log(`Item "${oldName}" not found in section "${section}".`);
      return false;
    }

    // Rename the item
    sectionItems[newName] = sectionItems[oldName];
    delete sectionItems[oldName];

    // Prepare the update object
    let updateObject: any = {};
    updateObject[section] = sectionItems;

    // Update the report in Supabase with the modified section
    const { error: updateError } = await supabase
      .from('pl_reports')
      .update(updateObject)
      .eq('id', existingReport.id);

    if (updateError) {
      console.error(`Error updating ${section}:`, updateError);
      return false;
    }

    return true;

  } catch (error) {
    console.error("Error renaming item in Supabase:", error);
    return false;
  }
}

export async function handleAddRevenueItem(
  month: Date, 
  section: 'bucatarie_items' | 'tazz_items' | 'bar_items', 
  itemName: string, 
  itemValue: number
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    const formattedDate = format(month, "yyyy-MM");
    
    // Check if report exists
    const { data: existingReport, error: reportError } = await supabase
      .from('pl_reports')
      .select(`id, ${section}`)
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .single();
      
    if (reportError && reportError.code !== 'PGRST116') {
      console.error("Error fetching report:", reportError);
      return false;
    }
    
    if (existingReport) {
      const sectionItems = existingReport[section] as Record<string, number> || {};
      const updatedItems = { ...sectionItems, [itemName]: itemValue };
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update({ [section]: updatedItems })
        .eq('id', existingReport.id);
        
      if (updateError) {
        console.error(`Error updating ${section}:`, updateError);
        return false;
      }
      
      return true;
    } else {
      // Create default report with new item in the appropriate section
      const defaultReportData = {
        date: formattedDate,
        user_id: user.id,
        bucatarie_items: section === 'bucatarie_items' ? { [itemName]: itemValue } : {},
        tazz_items: section === 'tazz_items' ? { [itemName]: itemValue } : {},
        bar_items: section === 'bar_items' ? { [itemName]: itemValue } : {},
        cost_of_goods_items: {},
        revenue_items: {}, // Add empty revenue_items to make the schema happy
        salary_expenses: {
          "Adi": 4050,
          "Ioana": 4050,
          "Andreea": 4050,
          "Victoria": 4050
        },
        distributor_expenses: {
          "Maria FoodNova": 0,
          "CocaCola": 0,
          "24H": 0,
          "Sinless": 0,
          "Peroni": 0,
          "Sudavangarde(Brutarie Foccacia)": 0,
          "Proporzioni": 0,
          "LIDL": 0,
          "Metro": 0
        },
        operational_expenses: {
          "Contabilitate": 0,
          "ECR": 0,
          "ISU": 0,
          "Chirie": 0,
          "Protectia Muncii": 0
        },
        utilities_expenses: {
          "Gaze(Engie)": 0,
          "Apa": 0,
          "Curent": 0,
          "Gunoi(Iridex)": 0,
          "Internet": 0
        },
        other_expenses: {},
        budget: undefined
      };
      
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert(defaultReportData);
        
      if (insertError) {
        console.error("Error inserting new report:", insertError);
        return false;
      }
      
      return true;
    }
  } catch (error) {
    console.error("Add revenue item error:", error);
    return false;
  }
}
