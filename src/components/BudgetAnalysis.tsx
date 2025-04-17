
import React from "react";
import { formatCurrency } from "@/lib/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface BudgetAnalysisProps {
  budgetTargets?: {
    targetRevenue: number;
    targetExpenses: number;
    targetProfit: number;
  };
  actualRevenue: number;
  actualExpenses: number;
  actualProfit: number;
}

const BudgetAnalysis = ({ 
  budgetTargets, 
  actualRevenue, 
  actualExpenses, 
  actualProfit 
}: BudgetAnalysisProps) => {
  // Check if we have budget targets
  const hasBudget = !!budgetTargets;
  
  // Calculate variance from budget
  const revenueVariance = hasBudget 
    ? ((actualRevenue - budgetTargets.targetRevenue) / budgetTargets.targetRevenue) * 100 
    : 0;
    
  const expensesVariance = hasBudget 
    ? ((actualExpenses - budgetTargets.targetExpenses) / budgetTargets.targetExpenses) * 100 
    : 0;
    
  const profitVariance = hasBudget 
    ? ((actualProfit - budgetTargets.targetProfit) / budgetTargets.targetProfit) * 100 
    : 0;
    
  // Prepare comparison data
  const comparisonData = hasBudget 
    ? [
        {
          name: "Încasări",
          actual: actualRevenue,
          target: budgetTargets.targetRevenue,
          variance: revenueVariance
        },
        {
          name: "Cheltuieli",
          actual: actualExpenses,
          target: budgetTargets.targetExpenses,
          variance: expensesVariance
        },
        {
          name: "Profit",
          actual: actualProfit,
          target: budgetTargets.targetProfit,
          variance: profitVariance
        }
      ]
    : [
        {
          name: "Încasări",
          actual: actualRevenue
        },
        {
          name: "Cheltuieli",
          actual: actualExpenses
        },
        {
          name: "Profit",
          actual: actualProfit
        }
      ];
  
  // Get achievement status
  const getAchievementStatus = (variance: number, isExpense = false) => {
    if (!hasBudget) return null;
    
    // For expenses, negative variance is good (under budget)
    if (isExpense) {
      if (variance <= -10) return { text: "Excelent", color: "text-green-600" };
      if (variance < 0) return { text: "Bine", color: "text-green-500" };
      if (variance < 10) return { text: "Aproape de țintă", color: "text-yellow-500" };
      return { text: "Peste buget", color: "text-red-600" };
    }
    
    // For revenue and profit, positive variance is good (over budget)
    if (variance >= 10) return { text: "Excelent", color: "text-green-600" };
    if (variance > 0) return { text: "Bine", color: "text-green-500" };
    if (variance > -10) return { text: "Aproape de țintă", color: "text-yellow-500" };
    return { text: "Sub buget", color: "text-red-600" };
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Analiza Bugetului</h2>
      
      {!hasBudget ? (
        <div className="text-center p-4 bg-gray-100 rounded">
          <p className="mb-2">Nu există un buget definit pentru această lună.</p>
          <p className="text-sm text-gray-600">
            Adăugați obiective de buget pentru a vedea analiza comparativă.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={comparisonData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="actual" name="Actual" fill="#8884d8" />
                <Bar dataKey="target" name="Bugetat" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-1">Încasări</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-gray-600">Actual</div>
                  <div className="font-bold">{formatCurrency(actualRevenue)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bugetat</div>
                  <div className="font-bold">{formatCurrency(budgetTargets.targetRevenue)}</div>
                </div>
              </div>
              <div className="mt-2">
                <div className={`text-sm ${revenueVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueVariance >= 0 ? '▲' : '▼'} {Math.abs(revenueVariance).toFixed(1)}% față de buget
                </div>
                {getAchievementStatus(revenueVariance) && (
                  <div className={`text-xs font-medium ${getAchievementStatus(revenueVariance)?.color}`}>
                    {getAchievementStatus(revenueVariance)?.text}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-1">Cheltuieli</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-gray-600">Actual</div>
                  <div className="font-bold">{formatCurrency(actualExpenses)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bugetat</div>
                  <div className="font-bold">{formatCurrency(budgetTargets.targetExpenses)}</div>
                </div>
              </div>
              <div className="mt-2">
                <div className={`text-sm ${expensesVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {expensesVariance >= 0 ? '▲' : '▼'} {Math.abs(expensesVariance).toFixed(1)}% față de buget
                </div>
                {getAchievementStatus(expensesVariance, true) && (
                  <div className={`text-xs font-medium ${getAchievementStatus(expensesVariance, true)?.color}`}>
                    {getAchievementStatus(expensesVariance, true)?.text}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-1">Profit</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-gray-600">Actual</div>
                  <div className="font-bold">{formatCurrency(actualProfit)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bugetat</div>
                  <div className="font-bold">{formatCurrency(budgetTargets.targetProfit)}</div>
                </div>
              </div>
              <div className="mt-2">
                <div className={`text-sm ${profitVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitVariance >= 0 ? '▲' : '▼'} {Math.abs(profitVariance).toFixed(1)}% față de buget
                </div>
                {getAchievementStatus(profitVariance) && (
                  <div className={`text-xs font-medium ${getAchievementStatus(profitVariance)?.color}`}>
                    {getAchievementStatus(profitVariance)?.text}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>
              {actualProfit >= budgetTargets.targetProfit 
                ? 'Profitul actual a depășit ținta bugetară. Continuați strategia curentă.' 
                : 'Profitul actual este sub ținta bugetară. Reevaluați strategiile de creștere a veniturilor sau de reducere a costurilor.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetAnalysis;
