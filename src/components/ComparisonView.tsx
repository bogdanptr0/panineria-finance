
import { useEffect, useState } from "react";
import { getAllReports, PLReport } from "@/lib/persistence";
import { formatCurrency, formatPercentage, calculatePercentageChange } from "@/lib/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ComparisonViewProps {
  currentMonth?: Date;
  currentReport?: {
    totalRevenue: number;
    totalCogs: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
  };
}

interface TrendDataItem {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

const ComparisonView = ({ 
  currentMonth = new Date(), 
  currentReport = {
    totalRevenue: 0,
    totalCogs: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netProfit: 0
  } 
}: ComparisonViewProps) => {
  const [reports, setReports] = useState<PLReport[]>([]);
  const [trendData, setTrendData] = useState<TrendDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const allReports = await getAllReports();
        setReports(allReports);
        
        // Transform reports into trend data
        const transformedData = allReports.map(report => {
          const totalRevenue = Object.values(report.revenueItems).reduce((sum, val) => sum + Number(val), 0);
          const totalCogs = Object.values(report.costOfGoodsItems).reduce((sum, val) => sum + Number(val), 0);
          const grossProfit = totalRevenue - totalCogs;
          
          const totalSalary = Object.values(report.salaryExpenses).reduce((sum, val) => sum + Number(val), 0);
          const totalDistributor = Object.values(report.distributorExpenses).reduce((sum, val) => sum + Number(val), 0);
          const totalUtilities = Object.values(report.utilitiesExpenses || {}).reduce((sum, val) => sum + Number(val), 0);
          const totalOperational = Object.values(report.operationalExpenses || {}).reduce((sum, val) => sum + Number(val), 0);
          const totalOther = Object.values(report.otherExpenses || {}).reduce((sum, val) => sum + Number(val), 0);
          const totalExpenses = totalSalary + totalDistributor + totalUtilities + totalOperational + totalOther;
          
          const netProfit = grossProfit - totalExpenses;
          
          return {
            month: report.date,
            revenue: totalRevenue,
            cogs: totalCogs,
            grossProfit,
            expenses: totalExpenses,
            netProfit
          };
        });
        
        setTrendData(transformedData);
      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadReports();
  }, [currentMonth]);

  // Find previous month report
  const currentMonthKey = currentMonth ? 
    `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}` : 
    '';
  
  // Find the previous month's data
  const previousMonth = currentMonth ? new Date(currentMonth) : new Date();
  if (currentMonth) {
    previousMonth.setMonth(previousMonth.getMonth() - 1);
  }
  const previousMonthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
  
  const previousReport = reports.find(r => r.date === previousMonthKey);
  
  // Calculate previous month metrics if available
  let previousMonthMetrics = null;
  if (previousReport) {
    const totalRevenue = Object.values(previousReport.revenueItems).reduce((sum, val) => sum + Number(val), 0);
    const totalCogs = Object.values(previousReport.costOfGoodsItems).reduce((sum, val) => sum + Number(val), 0);
    const grossProfit = totalRevenue - totalCogs;
    
    const totalSalary = Object.values(previousReport.salaryExpenses).reduce((sum, val) => sum + Number(val), 0);
    const totalDistributor = Object.values(previousReport.distributorExpenses).reduce((sum, val) => sum + Number(val), 0);
    const totalUtilities = Object.values(previousReport.utilitiesExpenses || {}).reduce((sum, val) => sum + Number(val), 0);
    const totalOperational = Object.values(previousReport.operationalExpenses || {}).reduce((sum, val) => sum + Number(val), 0);
    const totalOther = Object.values(previousReport.otherExpenses || {}).reduce((sum, val) => sum + Number(val), 0);
    const totalExpenses = totalSalary + totalDistributor + totalUtilities + totalOperational + totalOther;
    
    const netProfit = grossProfit - totalExpenses;
    
    previousMonthMetrics = {
      totalRevenue,
      totalCogs,
      grossProfit,
      totalExpenses,
      netProfit
    };
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Comparison View</h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-500">
          Loading comparison data...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-gray-500 italic mb-4">No historical data available for comparison</div>
      ) : previousMonthMetrics ? (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Month-over-Month Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-md border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Revenue</span>
                {calculatePercentageChange(currentReport.totalRevenue, previousMonthMetrics.totalRevenue) >= 0 ? (
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      {formatPercentage(calculatePercentageChange(currentReport.totalRevenue, previousMonthMetrics.totalRevenue))}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      {formatPercentage(Math.abs(calculatePercentageChange(currentReport.totalRevenue, previousMonthMetrics.totalRevenue)))}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold">{formatCurrency(currentReport.totalRevenue)}</div>
                <div className="text-xs text-gray-500">Previous: {formatCurrency(previousMonthMetrics.totalRevenue)}</div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-md border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Expenses</span>
                {calculatePercentageChange(currentReport.totalExpenses, previousMonthMetrics.totalExpenses) <= 0 ? (
                  <div className="flex items-center text-green-600">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      {formatPercentage(Math.abs(calculatePercentageChange(currentReport.totalExpenses, previousMonthMetrics.totalExpenses)))}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      {formatPercentage(calculatePercentageChange(currentReport.totalExpenses, previousMonthMetrics.totalExpenses))}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold">{formatCurrency(currentReport.totalExpenses)}</div>
                <div className="text-xs text-gray-500">Previous: {formatCurrency(previousMonthMetrics.totalExpenses)}</div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-md border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Net Profit</span>
                {calculatePercentageChange(currentReport.netProfit, previousMonthMetrics.netProfit) >= 0 ? (
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      {formatPercentage(calculatePercentageChange(currentReport.netProfit, previousMonthMetrics.netProfit))}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      {formatPercentage(Math.abs(calculatePercentageChange(currentReport.netProfit, previousMonthMetrics.netProfit)))}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold">{formatCurrency(currentReport.netProfit)}</div>
                <div className="text-xs text-gray-500">Previous: {formatCurrency(previousMonthMetrics.netProfit)}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 italic mb-4">No previous month data available for comparison</div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Profit Trend</h3>
        <div className="h-[300px]">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4CAF50" name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#FF5252" name="Expenses" />
                <Line type="monotone" dataKey="netProfit" stroke="#2196F3" name="Net Profit" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No historical data available for trend analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
