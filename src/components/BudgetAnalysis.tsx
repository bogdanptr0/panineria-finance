
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from "@/lib/formatters";

interface BudgetAnalysisProps {
  selectedMonth: Date;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  budget?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  };
  onBudgetUpdate: (budget: {
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
  budget,
  onBudgetUpdate
}: BudgetAnalysisProps) => {
  const [targetRevenue, setTargetRevenue] = useState(budget?.targetRevenue || 30000);
  const [targetExpenses, setTargetExpenses] = useState(budget?.targetExpenses || 25000);
  const [targetProfit, setTargetProfit] = useState(budget?.targetProfit || 5000);
  
  useEffect(() => {
    if (budget) {
      setTargetRevenue(budget.targetRevenue);
      setTargetExpenses(budget.targetExpenses);
      setTargetProfit(budget.targetProfit);
    }
  }, [budget]);
  
  const handleSaveBudget = () => {
    onBudgetUpdate({
      targetRevenue,
      targetExpenses,
      targetProfit
    });
  };
  
  // Calculate variance (actual vs budget)
  const revenueVariance = totalRevenue - targetRevenue;
  const expensesVariance = totalExpenses - targetExpenses;
  const profitVariance = netProfit - targetProfit;
  
  const revenueVariancePercent = targetRevenue ? (revenueVariance / targetRevenue) * 100 : 0;
  const expensesVariancePercent = targetExpenses ? (expensesVariance / targetExpenses) * 100 : 0;
  const profitVariancePercent = targetProfit ? (profitVariance / targetProfit) * 100 : 0;
  
  // Prepare data for charts
  const budgetVsActualData = [
    { name: 'Revenue', budget: targetRevenue, actual: totalRevenue },
    { name: 'Expenses', budget: targetExpenses, actual: totalExpenses },
    { name: 'Profit', budget: targetProfit, actual: netProfit }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Set Budget Targets</h3>
              
              <div className="space-y-2">
                <label htmlFor="targetRevenue" className="text-sm text-gray-600">Target Revenue</label>
                <Input
                  id="targetRevenue"
                  type="number"
                  value={targetRevenue}
                  onChange={(e) => setTargetRevenue(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="targetExpenses" className="text-sm text-gray-600">Target Expenses</label>
                <Input
                  id="targetExpenses"
                  type="number"
                  value={targetExpenses}
                  onChange={(e) => setTargetExpenses(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="targetProfit" className="text-sm text-gray-600">Target Profit</label>
                <Input
                  id="targetProfit"
                  type="number"
                  value={targetProfit}
                  onChange={(e) => setTargetProfit(Number(e.target.value))}
                />
              </div>
              
              <Button onClick={handleSaveBudget}>Save Budget</Button>
            </div>
            
            <div className="col-span-2">
              <h3 className="font-medium mb-4">Budget vs. Actual</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">Revenue</div>
                    <div className="mt-1 font-semibold">{formatCurrency(totalRevenue)}</div>
                    <div className={`text-xs mt-1 ${revenueVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {revenueVariance >= 0 ? '+' : ''}{formatCurrency(revenueVariance)} ({revenueVariancePercent.toFixed(1)}%)
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">Expenses</div>
                    <div className="mt-1 font-semibold">{formatCurrency(totalExpenses)}</div>
                    <div className={`text-xs mt-1 ${expensesVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {expensesVariance >= 0 ? '+' : ''}{formatCurrency(expensesVariance)} ({expensesVariancePercent.toFixed(1)}%)
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">Profit</div>
                    <div className="mt-1 font-semibold">{formatCurrency(netProfit)}</div>
                    <div className={`text-xs mt-1 ${profitVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitVariance >= 0 ? '+' : ''}{formatCurrency(profitVariance)} ({profitVariancePercent.toFixed(1)}%)
                    </div>
                  </div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Achieved', value: netProfit > 0 ? netProfit : 0 },
                          { name: 'Remaining', value: targetProfit - netProfit > 0 ? targetProfit - netProfit : 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {budgetVsActualData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetAnalysis;
