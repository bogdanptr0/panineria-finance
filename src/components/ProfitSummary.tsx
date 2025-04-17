import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/lib/formatters';

export interface ProfitSummaryProps {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
}

const ProfitSummary: React.FC<ProfitSummaryProps> = ({
  totalRevenue,
  totalExpenses,
  grossProfit,
  netProfit
}) => {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle>Profit Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Revenue:</span>
            <span>{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Expenses:</span>
            <span>{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Gross Profit:</span>
            <span>{formatCurrency(grossProfit)}</span>
          </div>
          <div className="flex justify-between font-semibold text-green-500">
            <span>Net Profit:</span>
            <span>{formatCurrency(netProfit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitSummary;
