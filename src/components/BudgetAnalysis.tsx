
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { calculateTotal } from '@/lib/utils';

interface BudgetAnalysisProps {
  selectedMonth: Date;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
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
  onBudgetSave: (budget: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  }) => void;
}

const BudgetAnalysis = ({
  selectedMonth,
  totalRevenue,
  totalExpenses,
  netProfit,
  revenueItems,
  costOfGoodsItems,
  salaryExpenses,
  distributorExpenses,
  operationalExpenses,
  budget,
  onBudgetSave
}: BudgetAnalysisProps) => {
  const [targetRevenue, setTargetRevenue] = useState<number>(budget?.targetRevenue || 0);
  const [targetExpenses, setTargetExpenses] = useState<number>(budget?.targetExpenses || 0);
  const [targetProfit, setTargetProfit] = useState<number>(budget?.targetProfit || 0);

  const handleSaveBudget = () => {
    onBudgetSave({
      targetRevenue,
      targetExpenses,
      targetProfit
    });
  };

  const revenueVariance = totalRevenue - targetRevenue;
  const revenueVariancePercent = targetRevenue ? (revenueVariance / targetRevenue) * 100 : 0;
  
  const expensesVariance = totalExpenses - targetExpenses;
  const expensesVariancePercent = targetExpenses ? (expensesVariance / targetExpenses) * 100 : 0;
  
  const profitVariance = netProfit - targetProfit;
  const profitVariancePercent = targetProfit ? (profitVariance / targetProfit) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Actual Analysis</CardTitle>
        <CardDescription>Compare actual performance against budget targets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Target Revenue</label>
            <Input
              type="number"
              min="0"
              value={targetRevenue}
              onChange={(e) => setTargetRevenue(Number(e.target.value))}
              className="mb-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Target Expenses</label>
            <Input
              type="number"
              min="0"
              value={targetExpenses}
              onChange={(e) => setTargetExpenses(Number(e.target.value))}
              className="mb-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Target Profit</label>
            <Input
              type="number"
              min="0"
              value={targetProfit}
              onChange={(e) => setTargetProfit(Number(e.target.value))}
              className="mb-2"
            />
          </div>
        </div>
        
        <div className="flex justify-end mb-6">
          <Button onClick={handleSaveBudget}>
            Save Budget
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead>% Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Revenue</TableCell>
              <TableCell>{formatCurrency(targetRevenue)}</TableCell>
              <TableCell>{formatCurrency(totalRevenue)}</TableCell>
              <TableCell className={revenueVariance >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(revenueVariance)}
              </TableCell>
              <TableCell className={revenueVariance >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(revenueVariancePercent)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Expenses</TableCell>
              <TableCell>{formatCurrency(targetExpenses)}</TableCell>
              <TableCell>{formatCurrency(totalExpenses)}</TableCell>
              <TableCell className={expensesVariance <= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(expensesVariance)}
              </TableCell>
              <TableCell className={expensesVariance <= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(expensesVariancePercent)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Profit</TableCell>
              <TableCell>{formatCurrency(targetProfit)}</TableCell>
              <TableCell>{formatCurrency(netProfit)}</TableCell>
              <TableCell className={profitVariance >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(profitVariance)}
              </TableCell>
              <TableCell className={profitVariance >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(profitVariancePercent)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <Separator className="my-6" />
        
        <div className="text-sm text-gray-500">
          <p>Variance = Actual - Budget</p>
          <p>% Variance = (Variance / Budget) * 100</p>
          <p>Green values indicate positive performance against budget.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetAnalysis;
