
import { useState } from "react";
import { formatCurrency, formatPercentage, calculatePercentageChange } from "@/lib/formatters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveReport } from "@/lib/persistence";

interface BudgetAnalysisProps {
  selectedMonth: Date;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueItems: Record<string, number>;
  costOfGoodsItems: Record<string, number>;
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  operationalExpenses: Record<string, number>;
  budget?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  };
  onBudgetSave: (budget: { targetRevenue: number, targetExpenses: number, targetProfit: number }) => void;
}

const BudgetAnalysis = ({ 
  selectedMonth,
  totalRevenue,
  totalExpenses,
  netProfit,
  revenueItems,
  costOfGoodsItems,
  salaryExpenses,
  distributorExpenses,
  operationalExpenses,
  budget,
  onBudgetSave
}: BudgetAnalysisProps) => {
  const [targetRevenue, setTargetRevenue] = useState<number>(budget?.targetRevenue || totalRevenue || 0);
  const [targetExpenses, setTargetExpenses] = useState<number>(budget?.targetExpenses || totalExpenses || 0);
  const [targetProfit, setTargetProfit] = useState<number>(budget?.targetProfit || netProfit || 0);
  const [isEditing, setIsEditing] = useState<boolean>(!budget);
  
  const handleSaveBudget = () => {
    const newBudget = {
      targetRevenue,
      targetExpenses,
      targetProfit
    };
    
    onBudgetSave(newBudget);
    
    // Save to persistence
    saveReport(selectedMonth, {
      revenueItems,
      costOfGoodsItems,
      salaryExpenses,
      distributorExpenses,
      operationalExpenses,
      budget: newBudget
    });
    
    setIsEditing(false);
  };
  
  // Calculate variances
  const revenueVariance = budget ? totalRevenue - budget.targetRevenue : 0;
  const revenueVariancePercentage = budget && budget.targetRevenue !== 0 
    ? calculatePercentageChange(totalRevenue, budget.targetRevenue)
    : 0;
    
  const expensesVariance = budget ? totalExpenses - budget.targetExpenses : 0;
  const expensesVariancePercentage = budget && budget.targetExpenses !== 0 
    ? calculatePercentageChange(totalExpenses, budget.targetExpenses)
    : 0;
    
  const profitVariance = budget ? netProfit - budget.targetProfit : 0;
  const profitVariancePercentage = budget && budget.targetProfit !== 0 
    ? calculatePercentageChange(netProfit, budget.targetProfit)
    : 0;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Budget vs. Actual Analysis</h2>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Budget
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-semibold">Set Budget Targets</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Revenue</label>
              <Input 
                type="number" 
                value={targetRevenue}
                onChange={(e) => setTargetRevenue(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Expenses</label>
              <Input 
                type="number" 
                value={targetExpenses}
                onChange={(e) => setTargetExpenses(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Profit</label>
              <Input 
                type="number" 
                value={targetProfit}
                onChange={(e) => setTargetProfit(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveBudget}>Save Budget</Button>
          </div>
        </div>
      ) : budget ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Revenue</h3>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="text-lg font-medium">{formatCurrency(budget.targetRevenue)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Actual</div>
                  <div className="text-lg font-medium">{formatCurrency(totalRevenue)}</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <div className="text-sm text-gray-500">Variance</div>
                <div className={`text-lg font-medium flex items-center ${revenueVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(revenueVariance)}
                  <span className="text-xs ml-2">
                    ({revenueVariance >= 0 ? '+' : ''}{formatPercentage(revenueVariancePercentage)})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Expenses</h3>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="text-lg font-medium">{formatCurrency(budget.targetExpenses)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Actual</div>
                  <div className="text-lg font-medium">{formatCurrency(totalExpenses)}</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <div className="text-sm text-gray-500">Variance</div>
                <div className={`text-lg font-medium flex items-center ${expensesVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(expensesVariance)}
                  <span className="text-xs ml-2">
                    ({expensesVariance >= 0 ? '+' : ''}{formatPercentage(expensesVariancePercentage)})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Profit</h3>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="text-lg font-medium">{formatCurrency(budget.targetProfit)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Actual</div>
                  <div className="text-lg font-medium">{formatCurrency(netProfit)}</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <div className="text-sm text-gray-500">Variance</div>
                <div className={`text-lg font-medium flex items-center ${profitVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profitVariance)}
                  <span className="text-xs ml-2">
                    ({profitVariance >= 0 ? '+' : ''}{formatPercentage(profitVariancePercentage)})
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="space-y-1 text-sm">
              {revenueVariance >= 0 ? (
                <p className="text-green-700">Revenue is {formatPercentage(Math.abs(revenueVariancePercentage))} above target ({formatCurrency(revenueVariance)} more than budgeted)</p>
              ) : (
                <p className="text-red-700">Revenue is {formatPercentage(Math.abs(revenueVariancePercentage))} below target ({formatCurrency(Math.abs(revenueVariance))} less than budgeted)</p>
              )}
              
              {expensesVariance <= 0 ? (
                <p className="text-green-700">Expenses are {formatPercentage(Math.abs(expensesVariancePercentage))} below target ({formatCurrency(Math.abs(expensesVariance))} less than budgeted)</p>
              ) : (
                <p className="text-red-700">Expenses are {formatPercentage(Math.abs(expensesVariancePercentage))} above target ({formatCurrency(expensesVariance)} more than budgeted)</p>
              )}
              
              {profitVariance >= 0 ? (
                <p className="text-green-700">Profit is {formatPercentage(Math.abs(profitVariancePercentage))} above target ({formatCurrency(profitVariance)} more than budgeted)</p>
              ) : (
                <p className="text-red-700">Profit is {formatPercentage(Math.abs(profitVariancePercentage))} below target ({formatCurrency(Math.abs(profitVariance))} less than budgeted)</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 italic">
          No budget set for this month. Click "Edit Budget" to set targets.
        </div>
      )}
    </div>
  );
};

export default BudgetAnalysis;
