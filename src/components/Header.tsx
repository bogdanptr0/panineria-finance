
import React, { useState } from "react";
import { formatDate } from "@/lib/formatters";
import MonthSelector from "@/components/MonthSelector";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

const Header = ({ selectedMonth, onMonthChange }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  return (
    <div className="mb-8 print:mb-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold print:text-xl">
          Report for {formatDate(selectedMonth)}
        </h1>
        <div className="print:hidden flex items-center gap-4">
          <MonthSelector 
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
          />
          
          {user && (
            <Button 
              onClick={handleLogout} 
              disabled={isLogoutLoading}
              variant="outline"
              size="sm"
            >
              {isLogoutLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="print:hidden bg-blue-50 p-4 rounded-lg mb-8">
        <p className="text-blue-800">
          Selectați luna din calendar pentru a vizualiza raportul corespunzător.
        </p>
      </div>
    </div>
  );
};

export default Header;
