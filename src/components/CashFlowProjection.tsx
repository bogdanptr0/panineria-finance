
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/formatters";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface CashFlowProjectionProps {
  currentMonthRevenue: number;
  currentMonthExpenses: number;
  estimatedGrowthRate: number;
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

const CashFlowProjection = ({
  currentMonthRevenue,
  currentMonthExpenses,
  estimatedGrowthRate
}: CashFlowProjectionProps) => {
  const generateProjectionData = () => {
    const data = [];
    const months = 6; // Project for 6 months
    
    let revenue = currentMonthRevenue;
    let expenses = currentMonthExpenses;
    
    const currentDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const projectionDate = new Date(currentDate);
      projectionDate.setMonth(currentDate.getMonth() + i);
      
      const monthName = projectionDate.toLocaleDateString('en-US', { month: 'short' });
      
      data.push({
        month: `${monthName}`,
        revenue,
        expenses,
        cashFlow: revenue - expenses
      });
      
      // Apply growth rate for next month
      revenue = revenue * (1 + estimatedGrowthRate);
      expenses = expenses * (1 + estimatedGrowthRate * 0.5); // Assume expenses grow at half the rate of revenue
    }
    
    return data;
  };
  
  const projectionData = generateProjectionData();
  
  const totalProjectedCashFlow = projectionData.reduce((sum, item) => sum + item.cashFlow, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Projection</CardTitle>
        <CardDescription>Estimated future cash flow based on current performance and {estimatedGrowthRate * 100}% growth rate</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={projectionData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
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
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ff7300" />
              <Line type="monotone" dataKey="cashFlow" name="Cash Flow" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center font-medium p-4 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-500 mb-1">Total Projected Cash Flow (6 months)</div>
          <div className="text-2xl">{formatCurrency(totalProjectedCashFlow)}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowProjection;
