
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { ChartContainer, ChartLegend } from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell, ResponsiveContainer } from "recharts";

interface LaborAnalysisProps {
  salaryExpenses: Record<string, number>;
  totalRevenue: number;
}

const LaborAnalysis = ({ salaryExpenses, totalRevenue }: LaborAnalysisProps) => {
  const totalSalary = Object.values(salaryExpenses).reduce((sum, val) => sum + val, 0);
  const laborPercentage = totalRevenue > 0 ? totalSalary / totalRevenue : 0;
  
  // Industry benchmark (typically 25-35% for restaurants)
  const industryBenchmark = 0.3; // 30%
  
  // Prepare the data for the chart
  const salaryData = Object.entries(salaryExpenses).map(([name, value]) => ({
    name,
    value,
    percentage: totalRevenue > 0 ? value / totalRevenue : 0
  }));
  
  // Calculate metrics
  const laborMetrics = {
    totalSalary,
    laborPercentage,
    status: laborPercentage <= industryBenchmark ? "good" : "high",
    difference: Math.abs(laborPercentage - industryBenchmark)
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Labor Cost Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className={`p-4 rounded-lg ${laborMetrics.status === 'good' ? 'bg-green-50' : 'bg-amber-50'}`}>
            <h3 className="text-lg font-semibold mb-2">Labor Cost Metrics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Total Labor Cost</div>
                <div className="text-2xl font-bold">{formatCurrency(laborMetrics.totalSalary)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Labor as % of Revenue</div>
                <div className="text-2xl font-bold">
                  <span className={laborMetrics.laborPercentage <= industryBenchmark ? "text-green-600" : "text-amber-600"}>
                    {formatPercentage(laborMetrics.laborPercentage)}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Industry Benchmark</div>
                <div className="text-lg">{formatPercentage(industryBenchmark)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className={`text-lg font-medium ${laborMetrics.status === 'good' ? 'text-green-600' : 'text-amber-600'}`}>
                  {laborMetrics.status === 'good' ? 'Within Industry Average' : 'Above Industry Average'}
                </div>
                <div className="text-sm">
                  {laborMetrics.status === 'good' 
                    ? `${formatPercentage(laborMetrics.difference)} below average`
                    : `${formatPercentage(laborMetrics.difference)} above average`}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Labor Cost Breakdown</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), "Amount"]}
                  labelFormatter={(name) => `Employee: ${name}`}
                />
                <Legend />
                <Bar dataKey="value" name="Salary" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Employee Cost Ratio</h4>
            <div className="space-y-2">
              {salaryData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-indigo-500 mr-2"></div>
                    <span>{item.name}</span>
                  </div>
                  <div className="text-sm">{formatPercentage(item.percentage)} of revenue</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaborAnalysis;
