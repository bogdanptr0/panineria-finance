import { supabase } from "@/integrations/supabase/client";
import { format, parse } from "date-fns";
import { Json } from "@/integrations/supabase/types";

export interface PLReport {
  date: string;
  revenueItems: Record<string, number>;
  costOfGoodsItems: Record<string, number>;
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  utilitiesExpenses: Record<string, number>;
  operationalExpenses: Record<string, number>;
  otherExpenses: Record<string, number>;
  subcategories?: {
    revenueItems?: Record<string, string>;
    expenses?: Record<string, string>;
  };
  budget?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  };
  bucatarieItems?: Record<string, number>;
  barItems?: Record<string, number>;
}

function parseJsonToRecord<T>(data: Json | null): Record<string, T> {
  if (!data || typeof data !== 'object') {
    return {};
  }
  
  return data as Record<string, T>;
}

export const loadReport = async (date: Date): Promise<PLReport | null> => {
  try {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    console.log("Loading report for date:", dateKey);
    
    const { data, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', dateKey)
      .maybeSingle();
    
    if (error) {
      console.error("Error loading report:", error);
      return null;
    }
    
    if (!data) {
      console.log("No report found for date:", dateKey);
      
      const defaultReport: PLReport = {
        date: dateKey,
        revenueItems: {},
        costOfGoodsItems: {},
        salaryExpenses: {
          "Adi": 4050,
          "Ioana": 4050,
          "Andreea": 4050,
          "Victoria": 4050
        },
        distributorExpenses: {
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
        utilitiesExpenses: {
          "Gaze(Engie)": 0,
          "Apa": 0,
          "Curent": 0,
          "Gunoi(Iridex)": 0,
          "Internet": 0
        },
        operationalExpenses: {
          "Contabilitate": 0,
          "ECR": 0,
          "ISU": 0,
          "Chirie": 0,
          "Protectia Muncii": 0
        },
        otherExpenses: {},
        subcategories: {
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
        },
        bucatarieItems: {
          "Il Classico": 0,
          "Il Prosciutto": 0,
          "Il Piccante": 0,
          "La Porchetta": 0,
          "La Mortadella": 0,
          "La Buffala": 0,
          "Tiramisu": 0,
          "Platou": 0
        },
        barItems: {
          "Espresso": 0,
          "Cappuccino": 0,
          "Aperol Spritz": 0,
          "Hugo": 0,
          "Vin roșu": 0,
          "Vin alb": 0,
          "Bere": 0,
          "Apa plată": 0,
          "Apa minerală": 0
        }
      };
      
      await saveReport(
        date, 
        defaultReport.revenueItems,
        defaultReport.costOfGoodsItems,
        defaultReport.salaryExpenses,
        defaultReport.distributorExpenses,
        defaultReport.utilitiesExpenses,
        defaultReport.operationalExpenses,
        defaultReport.otherExpenses,
        undefined,
        defaultReport.subcategories,
        defaultReport.bucatarieItems,
        defaultReport.barItems
      );
      
      return defaultReport;
    }
    
    const report: PLReport = {
      date: data.date,
      revenueItems: parseJsonToRecord<number>(data.revenue_items),
      costOfGoodsItems: parseJsonToRecord<number>(data.cost_of_goods_items),
      salaryExpenses: parseJsonToRecord<number>(data.salary_expenses),
      distributorExpenses: parseJsonToRecord<number>(data.distributor_expenses),
      utilitiesExpenses: parseJsonToRecord<number>(data.utilities_expenses || {}),
      operationalExpenses: parseJsonToRecord<number>(data.operational_expenses),
      otherExpenses: parseJsonToRecord<number>(data.other_expenses || {}),
      subcategories: data.subcategories as any || { revenueItems: {}, expenses: {} },
      budget: data.budget as any,
      bucatarieItems: parseJsonToRecord<number>(data.bucatarie_items as any || {}),
      barItems: parseJsonToRecord<number>(data.bar_items as any || {})
    };
    
    return report;
  } catch (error) {
    console.error("Error in loadReport:", error);
    return null;
  }
};

export const saveReport = async (
  date: Date,
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
  bucatarieItems?: Record<string, number>,
  barItems?: Record<string, number>
) => {
  try {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const data = {
      date: dateKey,
      revenue_items: revenueItems as Json,
      cost_of_goods_items: costOfGoodsItems as Json,
      salary_expenses: salaryExpenses as Json,
      distributor_expenses: distributorExpenses as Json,
      utilities_expenses: utilitiesExpenses as Json,
      operational_expenses: operationalExpenses as Json,
      other_expenses: otherExpenses as Json,
      budget: budget as Json,
      subcategories: subcategories as Json || { revenueItems: {}, expenses: {} } as Json,
      bucatarie_items: bucatarieItems as Json || {} as Json,
      bar_items: barItems as Json || {} as Json
    };
    
    const userId = localStorage.getItem('supabase.auth.token.currentSession')
      ? JSON.parse(localStorage.getItem('supabase.auth.token.currentSession') || '{}')?.user?.id
      : null;
    
    if (userId) {
      data['user_id'] = userId;
    }
    
    const { error: upsertError } = await supabase
      .from('pl_reports')
      .upsert(data, {
        onConflict: 'date'
      });
    
    if (upsertError) {
      console.error("Error saving report:", upsertError);
      throw upsertError;
    }
    
    console.log("Report saved successfully for date:", dateKey);
    return data;
  } catch (error) {
    console.error("Error in saveReport:", error);
    throw error;
  }
};

export const updateAllReportsWithDefaultSalaries = async () => {
  try {
    const { data, error } = await supabase
      .from('pl_reports')
      .select('date, salary_expenses');
    
    if (error) {
      console.error("Error fetching reports:", error);
      return;
    }
    
    const defaultSalaries = {
      "Adi": 4050,
      "Ioana": 4050,
      "Andreea": 4050,
      "Victoria": 4050
    };
    
    for (const report of data) {
      if (!report.salary_expenses || Object.keys(report.salary_expenses).length === 0) {
        const { error: updateError } = await supabase
          .from('pl_reports')
          .update({ salary_expenses: defaultSalaries })
          .eq('date', report.date);
        
        if (updateError) {
          console.error(`Error updating salaries for ${report.date}:`, updateError);
        } else {
          console.log(`Updated default salaries for ${report.date}`);
        }
      }
    }
  } catch (error) {
    console.error("Error in updateAllReportsWithDefaultSalaries:", error);
  }
};

export const deleteItemFromSupabase = async (date: Date, category: string, name: string) => {
  try {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const { data, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', dateKey)
      .maybeSingle();
    
    if (error || !data) {
      console.error("Error fetching report for deletion:", error);
      return;
    }
    
    const columnMap: Record<string, string> = {
      'bucatarieItems': 'bucatarie_items',
      'barItems': 'bar_items',
      'salaryExpenses': 'salary_expenses',
      'distributorExpenses': 'distributor_expenses',
      'utilitiesExpenses': 'utilities_expenses',
      'operationalExpenses': 'operational_expenses',
      'otherExpenses': 'other_expenses'
    };
    
    const dbColumn = columnMap[category];
    if (!dbColumn) {
      console.error(`Unknown category: ${category}`);
      return;
    }
    
    const items = data[dbColumn] || {};
    
    if (items[name] !== undefined) {
      delete items[name];
      
      if (category === 'bucatarieItems' || category === 'barItems') {
        const subcategories = data.subcategories || { revenueItems: {}, expenses: {} };
        if (subcategories.revenueItems && subcategories.revenueItems[name]) {
          delete subcategories.revenueItems[name];
        }
        
        const updateData: Record<string, any> = {
          [dbColumn]: items,
          subcategories: subcategories
        };
        
        const { error: updateError } = await supabase
          .from('pl_reports')
          .update(updateData)
          .eq('date', dateKey);
        
        if (updateError) {
          console.error(`Error deleting ${name} from ${category}:`, updateError);
        } else {
          console.log(`Successfully deleted ${name} from ${category}`);
        }
      } else if (['utilitiesExpenses', 'operationalExpenses', 'otherExpenses'].includes(category)) {
        const subcategories = data.subcategories || { revenueItems: {}, expenses: {} };
        if (subcategories.expenses && subcategories.expenses[name]) {
          delete subcategories.expenses[name];
        }
        
        const updateData: Record<string, any> = {
          [dbColumn]: items,
          subcategories: subcategories
        };
        
        const { error: updateError } = await supabase
          .from('pl_reports')
          .update(updateData)
          .eq('date', dateKey);
        
        if (updateError) {
          console.error(`Error deleting ${name} from ${category}:`, updateError);
        } else {
          console.log(`Successfully deleted ${name} from ${category}`);
        }
      } else {
        const updateData: Record<string, any> = {
          [dbColumn]: items
        };
        
        const { error: updateError } = await supabase
          .from('pl_reports')
          .update(updateData)
          .eq('date', dateKey);
        
        if (updateError) {
          console.error(`Error deleting ${name} from ${category}:`, updateError);
        } else {
          console.log(`Successfully deleted ${name} from ${category}`);
        }
      }
    } else {
      console.log(`Item ${name} not found in ${category}`);
    }
  } catch (error) {
    console.error("Error in deleteItemFromSupabase:", error);
  }
};

export const addItemToSupabase = async (
  date: Date, 
  category: string, 
  name: string, 
  value: number,
  subcategory?: string
) => {
  try {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const { data, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', dateKey)
      .maybeSingle();
    
    if (error || !data) {
      console.error("Error fetching report for addition:", error);
      return;
    }
    
    const columnMap: Record<string, string> = {
      'bucatarieItems': 'bucatarie_items',
      'barItems': 'bar_items',
      'salaryExpenses': 'salary_expenses',
      'distributorExpenses': 'distributor_expenses',
      'utilitiesExpenses': 'utilities_expenses',
      'operationalExpenses': 'operational_expenses',
      'otherExpenses': 'other_expenses'
    };
    
    const dbColumn = columnMap[category];
    if (!dbColumn) {
      console.error(`Unknown category: ${category}`);
      return;
    }
    
    const items = data[dbColumn] || {};
    
    items[name] = value;
    
    if (category === 'bucatarieItems' || category === 'barItems') {
      const subcategories = data.subcategories || { revenueItems: {}, expenses: {} };
      if (!subcategories.revenueItems) {
        subcategories.revenueItems = {};
      }
      subcategories.revenueItems[name] = subcategory || (category === 'bucatarieItems' ? 'Bucatarie' : 'Bar');
      
      const updateData: Record<string, any> = {
        [dbColumn]: items,
        subcategories: subcategories
      };
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updateData)
        .eq('date', dateKey);
      
      if (updateError) {
        console.error(`Error adding ${name} to ${category}:`, updateError);
      } else {
        console.log(`Successfully added ${name} to ${category}`);
      }
    } else if (['utilitiesExpenses', 'operationalExpenses', 'otherExpenses'].includes(category)) {
      const subcategories = data.subcategories || { revenueItems: {}, expenses: {} };
      if (!subcategories.expenses) {
        subcategories.expenses = {};
      }
      
      let expenseCategory;
      if (category === 'utilitiesExpenses') {
        expenseCategory = 'Utilitati';
      } else if (category === 'operationalExpenses') {
        expenseCategory = 'Operationale';
      } else {
        expenseCategory = 'Alte Cheltuieli';
      }
      
      subcategories.expenses[name] = subcategory || expenseCategory;
      
      const updateData: Record<string, any> = {
        [dbColumn]: items,
        subcategories: subcategories
      };
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updateData)
        .eq('date', dateKey);
      
      if (updateError) {
        console.error(`Error adding ${name} to ${category}:`, updateError);
      } else {
        console.log(`Successfully added ${name} to ${category}`);
      }
    } else {
      const updateData: Record<string, any> = {
        [dbColumn]: items
      };
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updateData)
        .eq('date', dateKey);
      
      if (updateError) {
        console.error(`Error adding ${name} to ${category}:`, updateError);
      } else {
        console.log(`Successfully added ${name} to ${category}`);
      }
    }
  } catch (error) {
    console.error("Error in addItemToSupabase:", error);
  }
};

export const updateItemInSupabase = async (
  date: Date, 
  category: string, 
  name: string, 
  value: number
) => {
  try {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const columnMap: Record<string, string> = {
      'bucatarieItems': 'bucatarie_items',
      'barItems': 'bar_items',
      'salaryExpenses': 'salary_expenses',
      'distributorExpenses': 'distributor_expenses',
      'utilitiesExpenses': 'utilities_expenses',
      'operationalExpenses': 'operational_expenses',
      'otherExpenses': 'other_expenses'
    };
    
    const dbColumn = columnMap[category];
    if (!dbColumn) {
      console.error(`Unknown category: ${category}`);
      return;
    }
    
    const { data, error } = await supabase
      .from('pl_reports')
      .select(dbColumn)
      .eq('date', dateKey)
      .maybeSingle();
    
    if (error || !data) {
      console.error("Error fetching report for update:", error);
      return;
    }
    
    const items = data[dbColumn] || {};
    
    items[name] = value;
    
    const updateData: Record<string, any> = {
      [dbColumn]: items
    };
    
    const { error: updateError } = await supabase
      .from('pl_reports')
      .update(updateData)
      .eq('date', dateKey);
    
    if (updateError) {
      console.error(`Error updating ${name} in ${category}:`, updateError);
    } else {
      console.log(`Successfully updated ${name} in ${category} to ${value}`);
    }
  } catch (error) {
    console.error("Error in updateItemInSupabase:", error);
  }
};

export const renameItemInSupabase = async (
  date: Date, 
  category: string, 
  oldName: string, 
  newName: string
) => {
  try {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const { data, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', dateKey)
      .maybeSingle();
    
    if (error || !data) {
      console.error("Error fetching report for rename:", error);
      return;
    }
    
    const columnMap: Record<string, string> = {
      'bucatarieItems': 'bucatarie_items',
      'barItems': 'bar_items',
      'salaryExpenses': 'salary_expenses',
      'distributorExpenses': 'distributor_expenses',
      'utilitiesExpenses': 'utilities_expenses',
      'operationalExpenses': 'operational_expenses',
      'otherExpenses': 'other_expenses'
    };
    
    const dbColumn = columnMap[category];
    if (!dbColumn) {
      console.error(`Unknown category: ${category}`);
      return;
    }
    
    const items = data[dbColumn] || {};
    
    if (items[oldName] === undefined) {
      console.error(`Item ${oldName} not found in ${category}`);
      return;
    }
    
    const value = items[oldName];
    const newItems = { ...items };
    delete newItems[oldName];
    newItems[newName] = value;
    
    if (category === 'bucatarieItems' || category === 'barItems') {
      const subcategories = data.subcategories || { revenueItems: {}, expenses: {} };
      if (subcategories.revenueItems && subcategories.revenueItems[oldName]) {
        const subcategory = subcategories.revenueItems[oldName];
        const newRevenueSubcategories = { ...subcategories.revenueItems };
        delete newRevenueSubcategories[oldName];
        newRevenueSubcategories[newName] = subcategory;
        subcategories.revenueItems = newRevenueSubcategories;
      }
      
      const updateData: Record<string, any> = {
        [dbColumn]: newItems,
        subcategories: subcategories
      };
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updateData)
        .eq('date', dateKey);
      
      if (updateError) {
        console.error(`Error renaming ${oldName} to ${newName} in ${category}:`, updateError);
      } else {
        console.log(`Successfully renamed ${oldName} to ${newName} in ${category}`);
      }
    } else if (['utilitiesExpenses', 'operationalExpenses', 'otherExpenses'].includes(category)) {
      const subcategories = data.subcategories || { revenueItems: {}, expenses: {} };
      if (subcategories.expenses && subcategories.expenses[oldName]) {
        const subcategory = subcategories.expenses[oldName];
        const newExpenseSubcategories = { ...subcategories.expenses };
        delete newExpenseSubcategories[oldName];
        newExpenseSubcategories[newName] = subcategory;
        subcategories.expenses = newExpenseSubcategories;
      }
      
      const updateData: Record<string, any> = {
        [dbColumn]: newItems,
        subcategories: subcategories
      };
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updateData)
        .eq('date', dateKey);
      
      if (updateError) {
        console.error(`Error renaming ${oldName} to ${newName} in ${category}:`, updateError);
      } else {
        console.log(`Successfully renamed ${oldName} to ${newName} in ${category}`);
      }
    } else {
      const updateData: Record<string, any> = {
        [dbColumn]: newItems
      };
      
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update(updateData)
        .eq('date', dateKey);
      
      if (updateError) {
        console.error(`Error renaming ${oldName} to ${newName} in ${category}:`, updateError);
      } else {
        console.log(`Successfully renamed ${oldName} to ${newName} in ${category}`);
      }
    }
  } catch (error) {
    console.error("Error in renameItemInSupabase:", error);
  }
};

export const exportToCsv = (report: PLReport) => {
  try {
    const dateObj = parse(report.date, 'yyyy-MM', new Date());
    const formattedDate = format(dateObj, 'MMMM yyyy');
    
    let csvContent = `P&L Report - ${formattedDate}\n\n`;
    
    csvContent += "REVENUE\n";
    let totalRevenue = 0;
    
    if (report.bucatarieItems && Object.keys(report.bucatarieItems).length > 0) {
      csvContent += "Bucatarie:\n";
      let bucatarieTotal = 0;
      
      Object.entries(report.bucatarieItems).forEach(([name, value]) => {
        csvContent += `${name},${value}\n`;
        bucatarieTotal += value;
        totalRevenue += value;
      });
      
      csvContent += `Bucatarie Total,${bucatarieTotal}\n\n`;
    }
    
    if (report.barItems && Object.keys(report.barItems).length > 0) {
      csvContent += "Bar:\n";
      let barTotal = 0;
      
      Object.entries(report.barItems).forEach(([name, value]) => {
        csvContent += `${name},${value}\n`;
        barTotal += value;
        totalRevenue += value;
      });
      
      csvContent += `Bar Total,${barTotal}\n\n`;
    }
    
    const bucatarieKeys = report.bucatarieItems ? Object.keys(report.bucatarieItems) : [];
    const barKeys = report.barItems ? Object.keys(report.barItems) : [];
    const otherRevenueItems = Object.entries(report.revenueItems).filter(
      ([name]) => !bucatarieKeys.includes(name) && !barKeys.includes(name)
    );
    
    if (otherRevenueItems.length > 0) {
      csvContent += "Other Revenue:\n";
      let otherRevenueTotal = 0;
      
      otherRevenueItems.forEach(([name, value]) => {
        csvContent += `${name},${value}\n`;
        otherRevenueTotal += value;
        totalRevenue += value;
      });
      
      csvContent += `Other Revenue Total,${otherRevenueTotal}\n\n`;
    }
    
    csvContent += `TOTAL REVENUE,${totalRevenue}\n\n`;
    
    csvContent += "EXPENSES\n";
    let totalExpenses = 0;
    
    if (Object.keys(report.salaryExpenses).length > 0) {
      csvContent += "Salary Expenses:\n";
      let salaryTotal = 0;
      
      Object.entries(report.salaryExpenses).forEach(([name, value]) => {
        csvContent += `${name},${value}\n`;
        salaryTotal += value;
      });
      
      csvContent += `Salary Total,${salaryTotal}\n\n`;
      totalExpenses += salaryTotal;
    }
    
    if (Object.keys(report.distributorExpenses).length > 0) {
      csvContent += "Distributor Expenses:\n";
      let distributorTotal = 0;
      
      Object.entries(report.distributorExpenses).forEach(([name, value]) => {
        csvContent += `${name},${value}\n`;
        distributorTotal += value;
      });
      
      csvContent += `Distributor Total,${distributorTotal}\n\n`;
      totalExpenses += distributorTotal;
    }
    
    if (Object.keys(report.utilitiesExpenses).length > 0) {
      csvContent += "Utilities Expenses:\n";
      let utilitiesTotal = 0;
      
      Object.entries(report.utilitiesExpenses).forEach(([name, value]) => {
        csvContent += `${name},${value}\n`;
        utilitiesTotal += value;
      });
      
      csvContent += `Utilities Total,${utilitiesTotal}\n\n`;
      totalExpenses += utilitiesTotal;
    }
    
    if (Object.keys(report.operationalExpenses).length > 0) {
      csvContent += "Operational Expenses:\n";
      let operationalTotal = 0;
      
      Object.entries(report.operationalExpenses).forEach(([name, value]) => {
        csvContent += `${name},${value}\n`;
        operationalTotal += value;
      });
      
      csvContent += `Operational Total,${operationalTotal}\n\n`;
      totalExpenses += operationalTotal;
    }
    
    if (Object.keys(report.otherExpenses).length > 0) {
      csvContent += "Other Expenses:\n";
      let otherTotal = 0;
      
      Object.entries(report.otherExpenses).forEach(([name, value]) => {
        csvContent += `${name},${value}\n`;
        otherTotal += value;
      });
      
      csvContent += `Other Total,${otherTotal}\n\n`;
      totalExpenses += otherTotal;
    }
    
    csvContent += `TOTAL EXPENSES,${totalExpenses}\n\n`;
    
    const grossProfit = totalRevenue;
    const netProfit = grossProfit - totalExpenses;
    
    csvContent += `GROSS PROFIT,${grossProfit}\n`;
    csvContent += `NET PROFIT,${netProfit}\n\n`;
    
    if (report.budget) {
      csvContent += "BUDGET COMPARISON\n";
      csvContent += `Target Revenue,${report.budget.targetRevenue}\n`;
      csvContent += `Actual Revenue,${totalRevenue}\n`;
      csvContent += `Revenue Variance,${totalRevenue - report.budget.targetRevenue}\n\n`;
      
      csvContent += `Target Expenses,${report.budget.targetExpenses}\n`;
      csvContent += `Actual Expenses,${totalExpenses}\n`;
      csvContent += `Expenses Variance,${totalExpenses - report.budget.targetExpenses}\n\n`;
      
      csvContent += `Target Profit,${report.budget.targetProfit}\n`;
      csvContent += `Actual Profit,${netProfit}\n`;
      csvContent += `Profit Variance,${netProfit - report.budget.targetProfit}\n`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `P&L_Report_${report.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error in exportToCsv:", error);
  }
};

export const exportToPdf = () => {
  try {
    window.print();
  } catch (error) {
    console.error("Error in exportToPdf:", error);
  }
};

export const getAllReports = async (): Promise<PLReport[]> => {
  try {
    const { data, error } = await supabase
      .from('pl_reports')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error("Error fetching reports:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const reports = data.map(item => {
      const report: PLReport = {
        date: item.date,
        revenueItems: parseJsonToRecord<number>(item.revenue_items),
        costOfGoodsItems: parseJsonToRecord<number>(item.cost_of_goods_items),
        salaryExpenses: parseJsonToRecord<number>(item.salary_expenses),
        distributorExpenses: parseJsonToRecord<number>(item.distributor_expenses),
        utilitiesExpenses: parseJsonToRecord<number>(item.utilities_expenses || {}),
        operationalExpenses: parseJsonToRecord<number>(item.operational_expenses),
        otherExpenses: parseJsonToRecord<number>(item.other_expenses || {}),
        subcategories: item.subcategories as any || { revenueItems: {}, expenses: {} },
        budget: item.budget as any,
        bucatarieItems: parseJsonToRecord<number>(item.bucatarie_items as any || {}),
        barItems: parseJsonToRecord<number>(item.bar_items as any || {})
      };
      return report;
    });
    
    return reports;
  } catch (error) {
    console.error("Error in getAllReports:", error);
    return [];
  }
};
