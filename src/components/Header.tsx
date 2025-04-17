
import { formatDate } from "@/lib/formatters";
import MonthSelector from "./MonthSelector";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

const Header = ({
  selectedMonth,
  onMonthChange
}: HeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center print:hidden">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Raport P&L Panineria</h1>
        <p className="text-gray-600">{formatDate(selectedMonth)}</p>
        {user && (
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <User className="h-3 w-3 mr-1" />
            {user.email}
          </p>
        )}
      </div>
      
      <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
        />
        
        {user && (
          <Button variant="outline" onClick={() => signOut()} className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
