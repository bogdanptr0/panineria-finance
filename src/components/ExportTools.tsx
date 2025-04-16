
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownToLine, FileText } from 'lucide-react';
import { exportToCsv, exportToPdf, PLReport } from '@/lib/persistence';
import { formatDate } from '@/lib/formatters';

interface ExportToolsProps {
  selectedMonth: Date;
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

const ExportTools = ({
  selectedMonth,
  revenueItems,
  costOfGoodsItems,
  salaryExpenses,
  distributorExpenses,
  utilitiesExpenses,
  operationalExpenses,
  otherExpenses,
  budget
}: ExportToolsProps) => {
  const handleExportToCsv = () => {
    const dateKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    
    const report: PLReport = {
      date: dateKey,
      revenueItems,
      costOfGoodsItems,
      salaryExpenses,
      distributorExpenses,
      utilitiesExpenses,
      operationalExpenses,
      otherExpenses
    };
    
    if (budget) {
      report.budget = budget;
    }
    
    exportToCsv(report);
  };

  const handleExportToPdf = () => {
    exportToPdf();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>Download your report in different formats</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Button 
          onClick={handleExportToCsv}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          <span>Export to CSV</span>
        </Button>
        <Button 
          onClick={handleExportToPdf}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowDownToLine className="h-4 w-4" />
          <span>Export to PDF</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportTools;
