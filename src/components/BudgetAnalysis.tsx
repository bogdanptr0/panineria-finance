
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage, calculatePercentageChange } from '@/lib/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface BudgetAnalysisProps {
  targetRevenue?: number;
  targetExpenses?: number;
  targetProfit?: number;
  actualRevenue: number;
  actualExpenses: number;
  actualProfit: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md">
        <p className="font-semibold">{label}</p>
        {payload.map((item, index) => (
          <p key={index} style={{ color: item.dataKey === 'target' ? '#0284c7' : '#10b981' }}>
            {item.name}: {formatCurrency(item.value)}
          </p>
        ))}
      </div>
    );
  }
  
  return null;
};

const BudgetAnalysis = ({
  targetRevenue = 0,
  targetExpenses = 0,
  targetProfit = 0,
  actualRevenue,
  actualExpenses,
  actualProfit
}: BudgetAnalysisProps) => {
  
  const revenueVariance = targetRevenue ? (actualRevenue - targetRevenue) / targetRevenue : 0;
  const expensesVariance = targetExpenses ? (actualExpenses - targetExpenses) / targetExpenses : 0;
  const profitVariance = targetProfit ? (actualProfit - targetProfit) / targetProfit : 0;
  
  const data = [
    {
      name: 'Revenue',
      target: targetRevenue,
      actual: actualRevenue
    },
    {
      name: 'Expenses',
      target: targetExpenses,
      actual: actualExpenses
    },
    {
      name: 'Profit',
      target: targetProfit,
      actual: actualProfit
    }
  ];
  
  const getVarianceColor = (variance: number) => {
    if (variance > 0) {
      // For revenue and profit, positive variance is good
      return 'text-green-600';
    } else if (variance < 0) {
      // For revenue and profit, negative variance is bad
      return 'text-red-600';
    }
    return 'text-gray-600';
  };
  
  const getExpenseVarianceColor = (variance: number) => {
    if (variance > 0) {
      // For expenses, positive variance (spending more than budgeted) is bad
      return 'text-red-600';
    } else if (variance < 0) {
      // For expenses, negative variance (spending less than budgeted) is good
      return 'text-green-600';
    }
    return 'text-gray-600';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Analysis</CardTitle>
        <CardDescription>Comparison of actual results against budget</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={(props) => {
                // Convert ValueType to number before passing to formatCurrency
                const updatedProps = {
                  ...props,
                  payload: props.payload?.map(item => ({
                    ...item,
                    value: typeof item.value === 'number' ? item.value : 0
                  }))
                };
                return CustomTooltip(updatedProps);
              }} />
              <Legend />
              <Bar dataKey="target" name="Budget" fill="#8884d8" />
              <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-2 border rounded-md">
            <div className="text-sm text-gray-500 mb-1">Revenue</div>
            <div className="text-sm font-medium">Budget: {formatCurrency(targetRevenue)}</div>
            <div className="text-sm font-medium">Actual: {formatCurrency(actualRevenue)}</div>
            <div className={`text-xs mt-1 ${getVarianceColor(revenueVariance)}`}>
              Variance: {formatPercentage(revenueVariance)}
            </div>
          </div>
          
          <div className="p-2 border rounded-md">
            <div className="text-sm text-gray-500 mb-1">Expenses</div>
            <div className="text-sm font-medium">Budget: {formatCurrency(targetExpenses)}</div>
            <div className="text-sm font-medium">Actual: {formatCurrency(actualExpenses)}</div>
            <div className={`text-xs mt-1 ${getExpenseVarianceColor(expensesVariance)}`}>
              Variance: {formatPercentage(expensesVariance)}
            </div>
          </div>
          
          <div className="p-2 border rounded-md">
            <div className="text-sm text-gray-500 mb-1">Profit</div>
            <div className="text-sm font-medium">Budget: {formatCurrency(targetProfit)}</div>
            <div className="text-sm font-medium">Actual: {formatCurrency(actualProfit)}</div>
            <div className={`text-xs mt-1 ${getVarianceColor(profitVariance)}`}>
              Variance: {formatPercentage(profitVariance)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetAnalysis;
