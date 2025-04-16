
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to verify if data has been successfully synced with Supabase
 * @param dateKey The date key in format YYYY-MM
 * @returns Promise with boolean indicating if data exists
 */
export const verifyDataSync = async (dateKey: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('pl_reports')
      .select('date')
      .eq('date', dateKey)
      .maybeSingle();
    
    if (error) {
      console.error("Error verifying data sync:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error in verifyDataSync:", error);
    return false;
  }
};
