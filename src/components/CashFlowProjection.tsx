
import { useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CashFlowProjectionProps {
  currentRevenue: number;
  currentExpenses: number;
}

const CashFlowProjection = ({ currentRevenue, currentExpenses }: CashFlowProjectionProps) => {
  const [growthRate, setGrowthRate] = useState<number>(5); // 5% default growth rate
  const [costRate, setCostRate] = useState<number>(3); // 3% default cost increase rate
  const [projectionMonths, setProjectionMonths] = useState<number>(6); // Default 6 months
  
  // Generate projection data
  const generateProjectionData = () => {
    const data = [];
    let projectedRevenue = currentRevenue;
    let projectedExpenses = currentExpenses;
    
    const currentDate = new Date();
    
    for (let i = 0; i <= projectionMonths; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() + i);
      const monthYearLabel = date.toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' });
      
      if (i === 0) {
        // Current month
        data.push({
          month: monthYearLabel,
          revenue: projectedRevenue,
          expenses: projectedExpenses,
          cashFlow: projectedRevenue - projectedExpenses
        });
      } else {
        // Apply growth and cost rates
        projectedRevenue = projectedRevenue * (1 + (growthRate / 100));
        projectedExpenses = projectedExpenses * (1 + (costRate / 100));
        
        data.push({
          month: monthYearLabel,
          revenue: projectedRevenue,
          expenses: projectedExpenses,
          cashFlow: projectedRevenue - projectedExpenses
        });
      }
    }
    
    return data;
  };
  
  const projectionData = generateProjectionData();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Cash Flow Projection</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Revenue Growth Rate (%)
          </label>
          <Input 
            type="number" 
            value={growthRate}
            onChange={(e) => setGrowthRate(Number(e.target.value))}
            min="-20"
            max="50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Increase Rate (%)
          </label>
          <Input 
            type="number" 
            value={costRate}
            onChange={(e) => setCostRate(Number(e.target.value))}
            min="-20"
            max="50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Projection Months
          </label>
          <Input 
            type="number" 
            value={projectionMonths}
            onChange={(e) => setProjectionMonths(Number(e.target.value))}
            min="1"
            max="24"
          />
        </div>
      </div>
      
      <div className="h-[400px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4CAF50" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#FF5252" strokeWidth={2} />
            <Line type="monotone" dataKey="cashFlow" name="Cash Flow" stroke="#2196F3" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Projection Summary</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-4 text-sm font-medium border-b pb-1">
            <div>Month</div>
            <div className="text-right">Revenue</div>
            <div className="text-right">Expenses</div>
            <div className="text-right">Cash Flow</div>
          </div>
          
          {projectionData.map((item, index) => (
            <div key={index} className="grid grid-cols-4 text-sm">
              <div>{item.month}</div>
              <div className="text-right">{formatCurrency(item.revenue)}</div>
              <div className="text-right">{formatCurrency(item.expenses)}</div>
              <div className={`text-right font-medium ${item.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(item.cashFlow)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CashFlowProjection;
