
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface LaborAnalysisProps {
  salaryExpenses: Record<string, number>;
  totalSalaries: number;
  totalRevenue: number;
}

// Define the tooltip props interface explicitly
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
        <p className="font-medium">{payload[0]?.name}</p>
        <p className="text-sm">{formatCurrency(payload[0]?.value)}</p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const LaborAnalysis = ({ salaryExpenses, totalSalaries, totalRevenue }: LaborAnalysisProps) => {
  const laborPercentage = totalRevenue > 0 ? (totalSalaries / totalRevenue) : 0;
  
  const data = Object.entries(salaryExpenses).map(([name, amount]) => ({
    name,
    value: amount
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Labor Analysis</CardTitle>
        <CardDescription>Labor cost breakdown and percentage of revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500">Total Labor Cost</div>
            <div className="text-lg font-bold">{formatCurrency(totalSalaries)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500">Labor as % of Revenue</div>
            <div className="text-lg font-bold">{formatPercentage(laborPercentage)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaborAnalysis;
