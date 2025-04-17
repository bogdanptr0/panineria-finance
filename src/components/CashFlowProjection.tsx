
import React, { useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { addMonths, format } from "date-fns";

export interface CashFlowProjectionProps {
  currentRevenue: number;
  currentExpenses: number;
  growthRate: number;
}

const CashFlowProjection = ({ currentRevenue, currentExpenses, growthRate }: CashFlowProjectionProps) => {
  const [projectionMonths, setProjectionMonths] = useState(6);
  const [revenueGrowthRate, setRevenueGrowthRate] = useState(growthRate);
  const [expenseGrowthRate, setExpenseGrowthRate] = useState(growthRate * 0.8); // Expenses grow slower than revenue by default
  
  // Generate projection data
  const generateProjectionData = () => {
    const data = [];
    const currentDate = new Date();
    let projectedRevenue = currentRevenue;
    let projectedExpenses = currentExpenses;
    
    for (let i = 0; i < projectionMonths; i++) {
      const projectionMonth = addMonths(currentDate, i);
      
      data.push({
        name: format(projectionMonth, 'MMM yy'),
        revenue: projectedRevenue,
        expenses: projectedExpenses,
        profit: projectedRevenue - projectedExpenses
      });
      
      // Compound growth for next month
      projectedRevenue = projectedRevenue * (1 + revenueGrowthRate);
      projectedExpenses = projectedExpenses * (1 + expenseGrowthRate);
    }
    
    return data;
  };
  
  const projectionData = generateProjectionData();
  
  // Calculate final values
  const finalProjectedRevenue = projectionData[projectionData.length - 1].revenue;
  const finalProjectedExpenses = projectionData[projectionData.length - 1].expenses;
  const finalProjectedProfit = finalProjectedRevenue - finalProjectedExpenses;
  
  // Calculate growth percentages
  const revenueGrowthPercent = ((finalProjectedRevenue - currentRevenue) / currentRevenue) * 100;
  const profitGrowthPercent = currentRevenue - currentExpenses !== 0 
    ? ((finalProjectedProfit - (currentRevenue - currentExpenses)) / (currentRevenue - currentExpenses)) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Proiecția Fluxului de Numerar</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Perioadă de proiecție (luni)
          </label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={projectionMonths}
            onChange={(e) => setProjectionMonths(Number(e.target.value))}
          >
            <option value={3}>3 luni</option>
            <option value={6}>6 luni</option>
            <option value={12}>12 luni</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rata de creștere a veniturilor (%)
          </label>
          <input 
            type="number" 
            min="-20" 
            max="50" 
            step="0.5"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={revenueGrowthRate * 100}
            onChange={(e) => setRevenueGrowthRate(Number(e.target.value) / 100)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rata de creștere a cheltuielilor (%)
          </label>
          <input 
            type="number" 
            min="-20" 
            max="50" 
            step="0.5"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={expenseGrowthRate * 100}
            onChange={(e) => setExpenseGrowthRate(Number(e.target.value) / 100)}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={projectionData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="Încasări" stroke="#82ca9d" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="expenses" name="Cheltuieli" stroke="#ff7f0e" />
            <Line type="monotone" dataKey="profit" name="Profit" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-1">Venituri Proiectate</h3>
          <div className="text-lg font-bold">{formatCurrency(finalProjectedRevenue)}</div>
          <div className={`text-sm ${revenueGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenueGrowthPercent >= 0 ? '▲' : '▼'} {Math.abs(revenueGrowthPercent).toFixed(1)}% în {projectionMonths} luni
          </div>
        </div>
        
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-1">Cheltuieli Proiectate</h3>
          <div className="text-lg font-bold">{formatCurrency(finalProjectedExpenses)}</div>
          <div className="text-sm text-gray-600">
            {(finalProjectedExpenses / finalProjectedRevenue * 100).toFixed(1)}% din venituri
          </div>
        </div>
        
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-1">Profit Proiectat</h3>
          <div className="text-lg font-bold">{formatCurrency(finalProjectedProfit)}</div>
          <div className={`text-sm ${profitGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitGrowthPercent >= 0 ? '▲' : '▼'} {Math.abs(profitGrowthPercent).toFixed(1)}% în {projectionMonths} luni
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Bazat pe ratele de creștere actuale, afacerea ar putea genera un profit 
          de aproximativ {formatCurrency(finalProjectedProfit)} în următoarele {projectionMonths} luni, 
          reprezentând o marja de profit 
          de {(finalProjectedProfit / finalProjectedRevenue * 100).toFixed(1)}%.
        </p>
      </div>
    </div>
  );
};

export default CashFlowProjection;
