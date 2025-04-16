
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Download, Printer, Save } from "lucide-react";
import { saveReport, exportToCsv, exportToPdf, PLReport } from "@/lib/persistence";
import { useToast } from "@/components/ui/use-toast";

interface ExportToolsProps {
  selectedMonth: Date;
  revenueItems: Record<string, number>;
  costOfGoodsItems: Record<string, number>;
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  operationalExpenses: Record<string, number>;
  budget?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  };
}

const ExportTools = ({
  selectedMonth,
  revenueItems,
  costOfGoodsItems,
  salaryExpenses,
  distributorExpenses,
  operationalExpenses,
  budget
}: ExportToolsProps) => {
  const { toast } = useToast();
  
  const handleSave = () => {
    saveReport(selectedMonth, {
      revenueItems,
      costOfGoodsItems,
      salaryExpenses,
      distributorExpenses,
      operationalExpenses,
      budget
    });
    
    toast({
      title: "Saved",
      description: "Report has been saved successfully.",
    });
  };
  
  const handleExportCsv = () => {
    const dateKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    
    const report: PLReport = {
      date: dateKey,
      revenueItems,
      costOfGoodsItems,
      salaryExpenses,
      distributorExpenses,
      operationalExpenses,
      budget
    };
    
    exportToCsv(report);
  };
  
  const handleExportPdf = () => {
    exportToPdf();
  };
  
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleSave} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        <span>Save</span>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExportCsv}>
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPdf}>
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button variant="outline" onClick={handleExportPdf} className="flex items-center gap-2">
        <Printer className="h-4 w-4" />
        <span>Print</span>
      </Button>
    </div>
  );
};

export default ExportTools;
