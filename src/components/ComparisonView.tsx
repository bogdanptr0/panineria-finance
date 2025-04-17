
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercentage, calculatePercentageChange } from "@/lib/formatters";
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths } from 'date-fns';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface ComparisonData {
  revenue: number;
  expenses: number;
  profit: number;
}

interface ComparisonViewProps {
  currentMonthData: ComparisonData;
}

// Define custom tooltip props
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
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ComparisonView = ({ currentMonthData }: ComparisonViewProps) => {
  const [previousMonthData, setPreviousMonthData] = useState<ComparisonData>({
    revenue: 0,
    expenses: 0,
    profit: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPreviousMonthData = async () => {
      try {
        const currentDate = new Date();
        const previousMonth = subMonths(currentDate, 1);
        const formattedDate = format(previousMonth, "yyyy-MM");
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("User not authenticated");
          return;
        }
        
        const { data: report, error } = await supabase
          .from('pl_reports')
          .select('*')
          .eq('date', formattedDate)
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') { // No data found
            console.error("Error fetching previous month data:", error);
          }
          setLoading(false);
          return;
        }
        
        if (report) {
          const bucatarieTotal = Object.values(report.bucatarie_items || {}).reduce((sum, value) => sum + (value as number), 0);
          const tazzTotal = Object.values(report.tazz_items || {}).reduce((sum, value) => sum + (value as number), 0);
          const barTotal = Object.values(report.bar_items || {}).reduce((sum, value) => sum + (value as number), 0);
          
          const salaryTotal = Object.values(report.salary_expenses || {}).reduce((sum, value) => sum + (value as number), 0);
          const distributorTotal = Object.values(report.distributor_expenses || {}).reduce((sum, value) => sum + (value as number), 0);
          const utilitiesTotal = Object.values(report.utilities_expenses || {}).reduce((sum, value) => sum + (value as number), 0);
          const operationalTotal = Object.values(report.operational_expenses || {}).reduce((sum, value) => sum + (value as number), 0);
          const otherTotal = Object.values(report.other_expenses || {}).reduce((sum, value) => sum + (value as number), 0);
          
          const totalRevenue = bucatarieTotal + tazzTotal + barTotal;
          const totalExpenses = salaryTotal + distributorTotal + utilitiesTotal + operationalTotal + otherTotal;
          
          setPreviousMonthData({
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit: totalRevenue - totalExpenses
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchPreviousMonthData:", error);
        setLoading(false);
      }
    };
    
    fetchPreviousMonthData();
  }, []);
  
  const revenueChange = calculatePercentageChange(currentMonthData.revenue, previousMonthData.revenue);
  const expensesChange = calculatePercentageChange(currentMonthData.expenses, previousMonthData.expenses);
  const profitChange = calculatePercentageChange(currentMonthData.profit, previousMonthData.profit);
  
  const data = [
    {
      name: "Revenue",
      previous: previousMonthData.revenue,
      current: currentMonthData.revenue
    },
    {
      name: "Expenses",
      previous: previousMonthData.expenses,
      current: currentMonthData.expenses
    },
    {
      name: "Profit",
      previous: previousMonthData.profit,
      current: currentMonthData.profit
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Month-over-Month Comparison</CardTitle>
        <CardDescription>Compare current month with previous month</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="h-[250px] mb-4">
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
                  <Bar dataKey="previous" name="Previous Month" fill="#8884d8" />
                  <Bar dataKey="current" name="Current Month" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-md bg-gray-50">
                <div className="font-medium mb-1">Revenue</div>
                <div className={`text-sm ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(revenueChange)}
                </div>
              </div>
              
              <div className="text-center p-3 rounded-md bg-gray-50">
                <div className="font-medium mb-1">Expenses</div>
                <div className={`text-sm ${expensesChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(expensesChange)}
                </div>
              </div>
              
              <div className="text-center p-3 rounded-md bg-gray-50">
                <div className="font-medium mb-1">Profit</div>
                <div className={`text-sm ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(profitChange)}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparisonView;
