
import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { addMonths, subMonths, format } from "date-fns";
import { loadReport } from "@/lib/persistence";

export interface ComparisonViewProps {
  currentMonth: Date;
  revenue: number;
  expenses: number;
  profit: number;
}

const ComparisonView = ({ currentMonth, revenue, expenses, profit }: ComparisonViewProps) => {
  const [previousMonthData, setPreviousMonthData] = useState<{ revenue: number; expenses: number; profit: number } | null>(null);
  const [nextMonthData, setNextMonthData] = useState<{ revenue: number; expenses: number; profit: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const prevMonth = subMonths(currentMonth, 1);
      const nextMonth = addMonths(currentMonth, 1);
      
      const prevMonthReport = await loadReport(prevMonth);
      const nextMonthReport = await loadReport(nextMonth);
      
      if (prevMonthReport) {
        const totalBucatarieRevenue = Object.values(prevMonthReport.bucatarieItems).reduce((sum, value) => sum + value, 0);
        const totalTazzRevenue = Object.values(prevMonthReport.tazzItems).reduce((sum, value) => sum + value, 0);
        const totalBarRevenue = Object.values(prevMonthReport.barItems).reduce((sum, value) => sum + value, 0);
        const totalRevenue = totalBucatarieRevenue + totalTazzRevenue + totalBarRevenue;
        
        const totalSalaryExpenses = Object.values(prevMonthReport.salaryExpenses).reduce((sum, value) => sum + value, 0);
        const totalDistributorExpenses = Object.values(prevMonthReport.distributorExpenses).reduce((sum, value) => sum + value, 0);
        const totalUtilitiesExpenses = Object.values(prevMonthReport.utilitiesExpenses).reduce((sum, value) => sum + value, 0);
        const totalOperationalExpenses = Object.values(prevMonthReport.operationalExpenses).reduce((sum, value) => sum + value, 0);
        const totalOtherExpenses = Object.values(prevMonthReport.otherExpenses).reduce((sum, value) => sum + value, 0);
        const totalExpenses = totalSalaryExpenses + totalDistributorExpenses + totalUtilitiesExpenses + totalOperationalExpenses + totalOtherExpenses;
        
        setPreviousMonthData({
          revenue: totalRevenue,
          expenses: totalExpenses,
          profit: totalRevenue - totalExpenses
        });
      } else {
        setPreviousMonthData(null);
      }
      
      if (nextMonthReport) {
        const totalBucatarieRevenue = Object.values(nextMonthReport.bucatarieItems).reduce((sum, value) => sum + value, 0);
        const totalTazzRevenue = Object.values(nextMonthReport.tazzItems).reduce((sum, value) => sum + value, 0);
        const totalBarRevenue = Object.values(nextMonthReport.barItems).reduce((sum, value) => sum + value, 0);
        const totalRevenue = totalBucatarieRevenue + totalTazzRevenue + totalBarRevenue;
        
        const totalSalaryExpenses = Object.values(nextMonthReport.salaryExpenses).reduce((sum, value) => sum + value, 0);
        const totalDistributorExpenses = Object.values(nextMonthReport.distributorExpenses).reduce((sum, value) => sum + value, 0);
        const totalUtilitiesExpenses = Object.values(nextMonthReport.utilitiesExpenses).reduce((sum, value) => sum + value, 0);
        const totalOperationalExpenses = Object.values(nextMonthReport.operationalExpenses).reduce((sum, value) => sum + value, 0);
        const totalOtherExpenses = Object.values(nextMonthReport.otherExpenses).reduce((sum, value) => sum + value, 0);
        const totalExpenses = totalSalaryExpenses + totalDistributorExpenses + totalUtilitiesExpenses + totalOperationalExpenses + totalOtherExpenses;
        
        setNextMonthData({
          revenue: totalRevenue,
          expenses: totalExpenses,
          profit: totalRevenue - totalExpenses
        });
      } else {
        setNextMonthData(null);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [currentMonth]);
  
  // Prepare data for chart
  const chartData = [];
  
  if (previousMonthData) {
    chartData.push({
      name: format(subMonths(currentMonth, 1), 'MMM yy'),
      revenue: previousMonthData.revenue,
      expenses: previousMonthData.expenses,
      profit: previousMonthData.profit
    });
  }
  
  chartData.push({
    name: format(currentMonth, 'MMM yy'),
    revenue: revenue,
    expenses: expenses,
    profit: profit
  });
  
  if (nextMonthData) {
    chartData.push({
      name: format(addMonths(currentMonth, 1), 'MMM yy'),
      revenue: nextMonthData.revenue,
      expenses: nextMonthData.expenses,
      profit: nextMonthData.profit
    });
  }
  
  // Calculate month-over-month changes
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };
  
  const revenueChange = previousMonthData 
    ? calculateChange(revenue, previousMonthData.revenue) 
    : null;
    
  const expensesChange = previousMonthData 
    ? calculateChange(expenses, previousMonthData.expenses) 
    : null;
    
  const profitChange = previousMonthData 
    ? calculateChange(profit, previousMonthData.profit) 
    : null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Comparație Lunară</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" name="Încasări" fill="#82ca9d" />
                <Bar dataKey="expenses" name="Cheltuieli" fill="#ff7f0e" />
                <Bar dataKey="profit" name="Profit" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-1">Încasări</h3>
              <div className="text-lg font-bold">{formatCurrency(revenue)}</div>
              {revenueChange !== null && (
                <div className={`text-sm ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueChange >= 0 ? '▲' : '▼'} {Math.abs(revenueChange).toFixed(1)}% față de luna anterioară
                </div>
              )}
            </div>
            
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-1">Cheltuieli</h3>
              <div className="text-lg font-bold">{formatCurrency(expenses)}</div>
              {expensesChange !== null && (
                <div className={`text-sm ${expensesChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {expensesChange >= 0 ? '▲' : '▼'} {Math.abs(expensesChange).toFixed(1)}% față de luna anterioară
                </div>
              )}
            </div>
            
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-1">Profit</h3>
              <div className="text-lg font-bold">{formatCurrency(profit)}</div>
              {profitChange !== null && (
                <div className={`text-sm ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitChange >= 0 ? '▲' : '▼'} {Math.abs(profitChange).toFixed(1)}% față de luna anterioară
                </div>
              )}
            </div>
          </div>
          
          {previousMonthData && (
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Comparativ cu luna anterioară, afacerea {profit >= previousMonthData.profit 
                  ? 'a înregistrat o creștere în profitabilitate' 
                  : 'a înregistrat o scădere în profitabilitate'}.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComparisonView;
