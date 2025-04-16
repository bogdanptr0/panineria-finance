
import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

const MonthSelector = ({ selectedMonth, onMonthChange }: MonthSelectorProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleMonthChange = (date: Date | undefined) => {
    if (date) {
      onMonthChange(date);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="font-semibold">Perioada:</span>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between w-44"
          >
            {format(selectedMonth, "MMMM yyyy", { locale: ro })}
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedMonth}
            onSelect={handleMonthChange}
            initialFocus
            month={selectedMonth}
            onMonthChange={handleMonthChange}
            captionLayout="dropdown-buttons"
            fromMonth={new Date(2020, 0)}
            toMonth={new Date(2030, 11)}
            defaultMonth={selectedMonth}
            showOutsideDays={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MonthSelector;
