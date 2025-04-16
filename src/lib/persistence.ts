
import { supabase } from "@/integrations/supabase/client";
import { formatMonth } from "@/lib/formatters";
import { DEFAULT_SALARY_EXPENSES } from "@/lib/constants";

// Utility function to handle empty strings and return a default value
export const getDefaultIfEmpty = (value: string, defaultValue: string = ""): string => {
  return value.trim() === "" ? defaultValue : value.trim();
};

// Define default empty values for each section
export const DEFAULT_BUCATARIE_ITEMS: Record<string, number> = {
  "Il Classico": 0,
  "Il Prosciutto": 0,
  "Il Piccante": 0,
  "La Porchetta": 0,
  "La Mortadella": 0,
  "La Buffala": 0,
  "Tiramisu": 0,
  "Platou": 0
};

export const DEFAULT_TAZZ_ITEMS: Record<string, number> = {
  "[MINI] Il Classico": 0,
  "[MINI] Il Prosciutto": 0,
  "[MINI] Il Piccante": 0,
  "[MINI] La Porchetta": 0,
  "[MINI] La Mortadella": 0,
  "[MINI] La Buffala": 0,
  "Il Classico": 0,
  "Il Prosciutto": 0,
  "Il Piccante": 0,
  "La Porchetta": 0,
  "La Mortadella": 0,
  "La Buffala": 0,
  "Tiramisu": 0,
  "Apa plata - 0,5": 0,
  "Apa minerala - 0,5": 0,
  "Coca Cola": 0,
  "Coca Cola Zero": 0,
  "Sprite": 0,
  "Fanta": 0,
  "Bere Peroni 0% alcool": 0
};

export const DEFAULT_BAR_ITEMS: Record<string, number> = {};

export const DEFAULT_EMPTY_COGS_ITEMS: Record<string, number> = {};

export const DEFAULT_DISTRIBUTOR_EXPENSES: Record<string, number> = {
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

export const DEFAULT_UTILITIES_EXPENSES: Record<string, number> = {
  "Gaze(Engie)": 0,
  "Apa": 0,
  "Curent": 0,
  "Gunoi(Iridex)": 0,
  "Internet": 0
};

export const DEFAULT_OPERATIONAL_EXPENSES: Record<string, number> = {
  "Contabilitate": 0,
  "ECR": 0,
  "ISU": 0,
  "Chirie": 0,
  "Protectia Muncii": 0
};

export const loadReport = async (date: Date): Promise<{
  revenueItems: Record<string, number>;
  costOfGoodsItems: Record<string, number>;
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  operationalExpenses: Record<string, number>;
  utilitiesExpenses: Record<string, number>;
  otherExpenses: Record<string, number>;
  budget?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  };
  bucatarieItems: Record<string, number>;
  tazzItems: Record<string, number>;
  barItems: Record<string, number>;
} | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not logged in.');
      return null;
    }

    const formattedDate = formatMonth(date);
    
    const { data, error } = await supabase
      .from('pl_reports')
      .select('*')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading report:', error);
      return null;
    }
    
    if (data) {
      // Extract the subcategory items from revenue_items
      const bucatarie: Record<string, number> = {};
      const tazz: Record<string, number> = {};
      const bar: Record<string, number> = {};
      
      const bucatarieKeys = Object.keys(DEFAULT_BUCATARIE_ITEMS);
      const tazzKeys = Object.keys(DEFAULT_TAZZ_ITEMS);
      
      if (data.revenue_items) {
        const revenueItems = data.revenue_items as Record<string, number>;
        Object.entries(revenueItems).forEach(([key, value]) => {
          if (bucatarieKeys.includes(key)) {
            bucatarie[key] = typeof value === 'number' ? value : 0;
          } else if (tazzKeys.includes(key)) {
            tazz[key] = typeof value === 'number' ? value : 0;
          } else {
            bar[key] = typeof value === 'number' ? value : 0;
          }
        });
      }

      return {
        revenueItems: (data.revenue_items as Record<string, number>) || {},
        costOfGoodsItems: (data.cost_of_goods_items as Record<string, number>) || DEFAULT_EMPTY_COGS_ITEMS,
        salaryExpenses: (data.salary_expenses as Record<string, number>) || DEFAULT_SALARY_EXPENSES,
        distributorExpenses: (data.distributor_expenses as Record<string, number>) || DEFAULT_DISTRIBUTOR_EXPENSES,
        operationalExpenses: (data.operational_expenses as Record<string, number>) || DEFAULT_OPERATIONAL_EXPENSES,
        utilitiesExpenses: (data.utilities_expenses as Record<string, number>) || DEFAULT_UTILITIES_EXPENSES,
        otherExpenses: (data.other_expenses as Record<string, number>) || {},
        budget: data.budget as {
          targetRevenue: number;
          targetExpenses: number;
          targetProfit: number;
        } | undefined,
        bucatarieItems: bucatarie,
        tazzItems: tazz,
        barItems: bar
      };
    }
    
    return {
      revenueItems: {},
      costOfGoodsItems: DEFAULT_EMPTY_COGS_ITEMS,
      salaryExpenses: DEFAULT_SALARY_EXPENSES,
      distributorExpenses: DEFAULT_DISTRIBUTOR_EXPENSES,
      operationalExpenses: DEFAULT_OPERATIONAL_EXPENSES,
      utilitiesExpenses: DEFAULT_UTILITIES_EXPENSES,
      otherExpenses: {},
      budget: undefined,
      bucatarieItems: DEFAULT_BUCATARIE_ITEMS,
      tazzItems: DEFAULT_TAZZ_ITEMS,
      barItems: DEFAULT_BAR_ITEMS
    };
    
  } catch (error) {
    console.error('Error loading report:', error);
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
  }
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not logged in.');
      return null;
    }
    
    const formattedDate = formatMonth(date);
    
    // Check if a report already exists for this month
    const { data: existingReport, error: fetchError } = await supabase
      .from('pl_reports')
      .select('id')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking for existing report:', fetchError);
      return null;
    }
    
    if (existingReport) {
      // Update existing report
      const { error: updateError } = await supabase
        .from('pl_reports')
        .update({
          revenue_items: revenueItems,
          cost_of_goods_items: costOfGoodsItems || DEFAULT_EMPTY_COGS_ITEMS,
          salary_expenses: salaryExpenses,
          distributor_expenses: distributorExpenses,
          utilities_expenses: utilitiesExpenses,
          operational_expenses: operationalExpenses,
          other_expenses: otherExpenses,
          budget: budget || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReport.id);
      
      if (updateError) {
        console.error('Error updating report:', updateError);
        return null;
      }
      
      return existingReport.id;
    } else {
      // Create new report
      const { data: newReport, error: insertError } = await supabase
        .from('pl_reports')
        .insert({
          date: formattedDate,
          revenue_items: revenueItems,
          cost_of_goods_items: costOfGoodsItems || DEFAULT_EMPTY_COGS_ITEMS,
          salary_expenses: salaryExpenses,
          distributor_expenses: distributorExpenses,
          utilities_expenses: utilitiesExpenses,
          operational_expenses: operationalExpenses,
          other_expenses: otherExpenses,
          budget: budget || null,
          user_id: user.id
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('Error creating report:', insertError);
        return null;
      }
      
      return newReport.id;
    }
  } catch (error) {
    console.error('Error saving report:', error);
    return null;
  }
};

export const deleteItemFromSupabase = async (
  date: Date,
  category: string,
  itemName: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not logged in.');
      return false;
    }
    
    const formattedDate = formatMonth(date);
    
    // Fetch the report for the given month and user
    const { data: reportData, error: fetchError } = await supabase
      .from('pl_reports')
      .select('revenue_items, salary_expenses, distributor_expenses, utilities_expenses, operational_expenses, other_expenses')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching report:', fetchError);
      return false;
    }
    
    if (!reportData) {
      console.log('No report found for this month.');
      return false;
    }
    
    let items: Record<string, number> | undefined = undefined;
    let dataField = '';
    
    switch (category) {
      case 'revenueItems':
        items = reportData.revenue_items as Record<string, number>;
        dataField = 'revenue_items';
        break;
      case 'salaryExpenses':
        items = reportData.salary_expenses as Record<string, number>;
        dataField = 'salary_expenses';
        break;
      case 'distributorExpenses':
        items = reportData.distributor_expenses as Record<string, number>;
        dataField = 'distributor_expenses';
        break;
      case 'utilitiesExpenses':
        items = reportData.utilities_expenses as Record<string, number>;
        dataField = 'utilities_expenses';
        break;
      case 'operationalExpenses':
        items = reportData.operational_expenses as Record<string, number>;
        dataField = 'operational_expenses';
        break;
      case 'otherExpenses':
        items = reportData.other_expenses as Record<string, number>;
        dataField = 'other_expenses';
        break;
      case 'bucatarieItems':
      case 'tazzItems':
      case 'barItems':
        items = reportData.revenue_items as Record<string, number>;
        dataField = 'revenue_items';
        break;
      default:
        console.error('Invalid category:', category);
        return false;
    }
    
    if (!items || !(itemName in items)) {
      console.log('Item not found in the specified category.');
      return false;
    }
    
    const updatedItems = { ...items };
    delete updatedItems[itemName];
    
    const updatePayload: Record<string, any> = {
      [dataField]: updatedItems,
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('pl_reports')
      .update(updatePayload)
      .eq('date', formattedDate)
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating report:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    return false;
  }
};

export const addItemToSupabase = async (
  date: Date,
  category: string,
  itemName: string,
  value: number
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not logged in.');
      return false;
    }
    
    const formattedDate = formatMonth(date);
    
    // Fetch the report for the given month and user
    const { data: reportData, error: fetchError } = await supabase
      .from('pl_reports')
      .select('revenue_items, salary_expenses, distributor_expenses, utilities_expenses, operational_expenses, other_expenses')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching report:', fetchError);
      return false;
    }
    
    // Create a new report if none exists
    if (!reportData) {
      const defaultReport = {
        date: formattedDate,
        user_id: user.id,
        revenue_items: {},
        cost_of_goods_items: DEFAULT_EMPTY_COGS_ITEMS,
        salary_expenses: DEFAULT_SALARY_EXPENSES,
        distributor_expenses: DEFAULT_DISTRIBUTOR_EXPENSES,
        utilities_expenses: DEFAULT_UTILITIES_EXPENSES,
        operational_expenses: DEFAULT_OPERATIONAL_EXPENSES,
        other_expenses: {}
      };
      
      if (category === 'bucatarieItems' || category === 'tazzItems' || category === 'barItems') {
        defaultReport.revenue_items = {
          ...defaultReport.revenue_items,
          [itemName]: value
        };
      } else {
        const field = category.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
        defaultReport[field] = {
          [itemName]: value
        };
      }
      
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert(defaultReport);
      
      if (insertError) {
        console.error('Error creating report with new item:', insertError);
        return false;
      }
      
      return true;
    }
    
    // Handle updating existing report
    let updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (category === 'bucatarieItems' || category === 'tazzItems' || category === 'barItems') {
      // For subcategories of revenue, we update the revenue_items
      const currentItems = reportData.revenue_items as Record<string, number> || {};
      updatePayload.revenue_items = {
        ...currentItems,
        [itemName]: value
      };
    } else {
      // For other categories, we update the specific category
      let field = '';
      let currentItems: Record<string, number> = {};
      
      switch (category) {
        case 'revenueItems':
          field = 'revenue_items';
          currentItems = reportData.revenue_items as Record<string, number> || {};
          break;
        case 'salaryExpenses':
          field = 'salary_expenses';
          currentItems = reportData.salary_expenses as Record<string, number> || {};
          break;
        case 'distributorExpenses':
          field = 'distributor_expenses';
          currentItems = reportData.distributor_expenses as Record<string, number> || {};
          break;
        case 'utilitiesExpenses':
          field = 'utilities_expenses';
          currentItems = reportData.utilities_expenses as Record<string, number> || {};
          break;
        case 'operationalExpenses':
          field = 'operational_expenses';
          currentItems = reportData.operational_expenses as Record<string, number> || {};
          break;
        case 'otherExpenses':
          field = 'other_expenses';
          currentItems = reportData.other_expenses as Record<string, number> || {};
          break;
        default:
          console.error('Invalid category:', category);
          return false;
      }
      
      updatePayload[field] = {
        ...currentItems,
        [itemName]: value
      };
    }
    
    const { error: updateError } = await supabase
      .from('pl_reports')
      .update(updatePayload)
      .eq('date', formattedDate)
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating report:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding item:', error);
    return false;
  }
};

export const updateItemInSupabase = async (
  date: Date,
  category: string,
  itemName: string,
  value: number
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not logged in.');
      return false;
    }
    
    const formattedDate = formatMonth(date);
    
    // Fetch the report for the given month and user
    const { data: reportData, error: fetchError } = await supabase
      .from('pl_reports')
      .select('revenue_items, salary_expenses, distributor_expenses, utilities_expenses, operational_expenses, other_expenses')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching report:', fetchError);
      return false;
    }
    
    if (!reportData) {
      // If no report exists, create one with the item
      return await addItemToSupabase(date, category, itemName, value);
    }
    
    let items: Record<string, number> = {};
    let field = '';
    
    switch (category) {
      case 'revenueItems':
        field = 'revenue_items';
        items = reportData.revenue_items as Record<string, number> || {};
        break;
      case 'salaryExpenses':
        field = 'salary_expenses';
        items = reportData.salary_expenses as Record<string, number> || {};
        break;
      case 'distributorExpenses':
        field = 'distributor_expenses';
        items = reportData.distributor_expenses as Record<string, number> || {};
        break;
      case 'utilitiesExpenses':
        field = 'utilities_expenses';
        items = reportData.utilities_expenses as Record<string, number> || {};
        break;
      case 'operationalExpenses':
        field = 'operational_expenses';
        items = reportData.operational_expenses as Record<string, number> || {};
        break;
      case 'otherExpenses':
        field = 'other_expenses';
        items = reportData.other_expenses as Record<string, number> || {};
        break;
      case 'bucatarieItems':
      case 'tazzItems':
      case 'barItems':
        field = 'revenue_items';
        items = reportData.revenue_items as Record<string, number> || {};
        break;
      default:
        console.error('Invalid category:', category);
        return false;
    }
    
    const updatedItems = { ...items, [itemName]: value };
    
    const updatePayload: Record<string, any> = {
      [field]: updatedItems,
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('pl_reports')
      .update(updatePayload)
      .eq('date', formattedDate)
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating report:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating item:', error);
    return false;
  }
};

export const renameItemInSupabase = async (
  date: Date,
  category: string,
  oldName: string,
  newName: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not logged in.');
      return false;
    }
    
    const formattedDate = formatMonth(date);
    
    // Fetch the report for the given month and user
    const { data: reportData, error: fetchError } = await supabase
      .from('pl_reports')
      .select('revenue_items, salary_expenses, distributor_expenses, utilities_expenses, operational_expenses, other_expenses')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching report:', fetchError);
      return false;
    }
    
    if (!reportData) {
      console.log('No report found for this month.');
      return false;
    }
    
    let items: Record<string, number> = {};
    let field = '';
    
    switch (category) {
      case 'revenueItems':
        field = 'revenue_items';
        items = reportData.revenue_items as Record<string, number> || {};
        break;
      case 'salaryExpenses':
        field = 'salary_expenses';
        items = reportData.salary_expenses as Record<string, number> || {};
        break;
      case 'distributorExpenses':
        field = 'distributor_expenses';
        items = reportData.distributor_expenses as Record<string, number> || {};
        break;
      case 'utilitiesExpenses':
        field = 'utilities_expenses';
        items = reportData.utilities_expenses as Record<string, number> || {};
        break;
      case 'operationalExpenses':
        field = 'operational_expenses';
        items = reportData.operational_expenses as Record<string, number> || {};
        break;
      case 'otherExpenses':
        field = 'other_expenses';
        items = reportData.other_expenses as Record<string, number> || {};
        break;
      case 'bucatarieItems':
      case 'tazzItems':
      case 'barItems':
        field = 'revenue_items';
        items = reportData.revenue_items as Record<string, number> || {};
        break;
      default:
        console.error('Invalid category:', category);
        return false;
    }
    
    if (!(oldName in items)) {
      console.log('Item to rename not found in the specified category.');
      return false;
    }
    
    const updatedItems = { ...items };
    const value = updatedItems[oldName];
    delete updatedItems[oldName];
    updatedItems[newName] = value;
    
    const updatePayload: Record<string, any> = {
      [field]: updatedItems,
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('pl_reports')
      .update(updatePayload)
      .eq('date', formattedDate)
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating report:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error renaming item:', error);
    return false;
  }
};

export const addOrUpdateItemInSubcategory = async (
  date: Date,
  subcategory: 'bucatarieItems' | 'tazzItems' | 'barItems',
  itemName: string,
  value: number
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not logged in.');
      return false;
    }
    
    const { data: report } = await supabase
      .from('pl_reports')
      .select('revenue_items')
      .eq('date', formatMonth(date))
      .eq('user_id', user.id)
      .maybeSingle();
    
    const revenueItems = (report?.revenue_items as Record<string, number>) || {};
    
    // Update the item value
    revenueItems[itemName] = value;
    
    // Save to database
    const { error } = await supabase
      .from('pl_reports')
      .update({
        revenue_items: revenueItems,
        updated_at: new Date().toISOString()
      })
      .eq('date', formatMonth(date))
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating item in subcategory:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating item in subcategory:', error);
    return false;
  }
};

export const updateAllReportsWithDefaultSalaries = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not logged in.');
      return;
    }
    
    // Get all reports for the user
    const { data: reports, error: fetchError } = await supabase
      .from('pl_reports')
      .select('id, salary_expenses, cost_of_goods_items')
      .eq('user_id', user.id);
    
    if (fetchError) {
      console.error('Error fetching reports:', fetchError);
      return;
    }
    
    // Update each report with default salaries if they don't exist
    for (const report of reports) {
      if (!report.salary_expenses) {
        const { error: updateError } = await supabase
          .from('pl_reports')
          .update({
            salary_expenses: DEFAULT_SALARY_EXPENSES,
            cost_of_goods_items: report.cost_of_goods_items || DEFAULT_EMPTY_COGS_ITEMS,
            updated_at: new Date().toISOString()
          })
          .eq('id', report.id);
        
        if (updateError) {
          console.error('Error updating report with default salaries:', updateError);
        }
      }
    }
  } catch (error) {
    console.error('Error updating reports with default salaries:', error);
  }
};

// Add handleAddRevenueItem function to export list so it can be imported in Index.tsx
export const handleAddRevenueItem = async (
  date: Date,
  subcategory: 'bucatarieItems' | 'tazzItems' | 'barItems',
  name: string,
  value: number = 0
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not logged in.');
      return false;
    }
    
    const formattedDate = formatMonth(date);
    
    // Fetch the report for the given month and user
    const { data: reportData, error: fetchError } = await supabase
      .from('pl_reports')
      .select('revenue_items')
      .eq('date', formattedDate)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching report:', fetchError);
      return false;
    }
    
    // Create report if it doesn't exist
    if (!reportData) {
      const defaultRevenue: Record<string, number> = {
        [name]: value
      };
      
      const { error: insertError } = await supabase
        .from('pl_reports')
        .insert({
          date: formattedDate,
          user_id: user.id,
          revenue_items: defaultRevenue,
          cost_of_goods_items: DEFAULT_EMPTY_COGS_ITEMS,
          salary_expenses: DEFAULT_SALARY_EXPENSES,
          distributor_expenses: DEFAULT_DISTRIBUTOR_EXPENSES,
          utilities_expenses: DEFAULT_UTILITIES_EXPENSES,
          operational_expenses: DEFAULT_OPERATIONAL_EXPENSES,
          other_expenses: {}
        });
      
      if (insertError) {
        console.error('Error creating report with new item:', insertError);
        return false;
      }
      
      return true;
    }
    
    // Update existing report
    const revenueItems = reportData.revenue_items as Record<string, number> || {};
    revenueItems[name] = value;
    
    const { error: updateError } = await supabase
      .from('pl_reports')
      .update({
        revenue_items: revenueItems,
        updated_at: new Date().toISOString()
      })
      .eq('date', formattedDate)
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating report:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding item to subcategory:', error);
    return false;
  }
};
