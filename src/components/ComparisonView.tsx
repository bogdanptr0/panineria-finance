
import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate, formatPercentage, calculatePercentageChange } from '@/lib/formatters';
import { PLReport } from '@/lib/reportTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface ComparisonViewProps {
  currentMonth: Date;
  currentReport: {
    totalRevenue: number;
    totalCogs: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
  };
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ currentMonth, currentReport }) => {
  const [prevMonthReport, setPrevMonthReport] = useState<PLReport | null>(null);
  const [prevYearReport, setPrevYearReport] = useState<PLReport | null>(null);
  
  // Get the previous month's date
  const getPrevMonthDate = (date: Date) => {
    const prevMonth = new Date(date);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth;
  };
  
  // Get the same month from previous year
  const getPrevYearDate = (date: Date) => {
    const prevYear = new Date(date);
    prevYear.setFullYear(prevYear.getFullYear() - 1);
    return prevYear;
  };
  
  const renderComparison = (current: number, previous: number | undefined, label: string) => {
    if (previous === undefined) return null;
    
    const change = calculatePercentageChange(current, previous);
    const isPositive = change > 0;
    
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">{label}:</span>
        <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
          {formatPercentage(Math.abs(change))}
        </span>
      </div>
    );
  };
  
  // Calculate month-to-month changes
  const calculateMoMChanges = () => {
    if (!prevMonthReport) return null;
    
    const revenueChange = renderComparison(currentReport.totalRevenue, prevMonthReport.totalRevenue, "MoM Revenue");
    const expensesChange = renderComparison(currentReport.totalExpenses, prevMonthReport.totalExpenses, "MoM Expenses");
    const profitChange = renderComparison(currentReport.netProfit, prevMonthReport.netProfit, "MoM Profit");
    
    return (
      <div className="space-y-2 mt-4">
        {revenueChange}
        {expensesChange}
        {profitChange}
      </div>
    );
  };
  
  // Calculate year-over-year changes
  const calculateYoYChanges = () => {
    if (!prevYearReport) return null;
    
    const revenueChange = renderComparison(currentReport.totalRevenue, prevYearReport.totalRevenue, "YoY Revenue");
    const expensesChange = renderComparison(currentReport.totalExpenses, prevYearReport.totalExpenses, "YoY Expenses");
    const profitChange = renderComparison(currentReport.netProfit, prevYearReport.netProfit, "YoY Profit");
    
    return (
      <div className="space-y-2 mt-4">
        {revenueChange}
        {expensesChange}
        {profitChange}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mom">
          <TabsList className="mb-4">
            <TabsTrigger value="mom">Month-over-Month</TabsTrigger>
            <TabsTrigger value="yoy">Year-over-Year</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mom">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Comparing {formatDate(currentMonth)} vs {formatDate(getPrevMonthDate(currentMonth))}
              </h3>
              
              {prevMonthReport ? (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Revenue</div>
                      <div className="font-semibold">{formatCurrency(currentReport.totalRevenue)}</div>
                      <div className="text-xs text-gray-500">vs {formatCurrency(prevMonthReport.totalRevenue || 0)}</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Expenses</div>
                      <div className="font-semibold">{formatCurrency(currentReport.totalExpenses)}</div>
                      <div className="text-xs text-gray-500">vs {formatCurrency(prevMonthReport.totalExpenses || 0)}</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Net Profit</div>
                      <div className="font-semibold">{formatCurrency(currentReport.netProfit)}</div>
                      <div className="text-xs text-gray-500">vs {formatCurrency(prevMonthReport.netProfit || 0)}</div>
                    </div>
                  </div>
                  
                  {calculateMoMChanges()}
                </>
              ) : (
                <div className="text-gray-500">No data available for the previous month.</div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="yoy">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Comparing {formatDate(currentMonth)} vs {formatDate(getPrevYearDate(currentMonth))}
              </h3>
              
              {prevYearReport ? (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Revenue</div>
                      <div className="font-semibold">{formatCurrency(currentReport.totalRevenue)}</div>
                      <div className="text-xs text-gray-500">vs {formatCurrency(prevYearReport.totalRevenue || 0)}</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Expenses</div>
                      <div className="font-semibold">{formatCurrency(currentReport.totalExpenses)}</div>
                      <div className="text-xs text-gray-500">vs {formatCurrency(prevYearReport.totalExpenses || 0)}</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Net Profit</div>
                      <div className="font-semibold">{formatCurrency(currentReport.netProfit)}</div>
                      <div className="text-xs text-gray-500">vs {formatCurrency(prevYearReport.netProfit || 0)}</div>
                    </div>
                  </div>
                  
                  {calculateYoYChanges()}
                </>
              ) : (
                <div className="text-gray-500">No data available for the previous year.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ComparisonView;
