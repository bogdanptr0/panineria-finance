
import React from "react";
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface DataItem {
  name: string;
  value: number;
}

export interface DataVisualizationProps {
  revenueCategories: DataItem[];
  expenseCategories: DataItem[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const DataVisualization = ({ revenueCategories, expenseCategories }: DataVisualizationProps) => {
  const totalRevenue = revenueCategories.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses = expenseCategories.reduce((sum, item) => sum + item.value, 0);
  
  // Add percentage to each data item
  const revenueWithPercent = revenueCategories.map(item => ({
    ...item,
    percent: totalRevenue ? ((item.value / totalRevenue) * 100).toFixed(1) + '%' : '0%'
  }));
  
  const expensesWithPercent = expenseCategories.map(item => ({
    ...item,
    percent: totalExpenses ? ((item.value / totalExpenses) * 100).toFixed(1) + '%' : '0%'
  }));
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show tiny slices

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
          <p>{((payload[0].value / (payload[0].name.includes("Cheltuieli") ? totalExpenses : totalRevenue)) * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6 text-center">Analiza Financiară</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Distribuția Încasărilor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueWithPercent}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueWithPercent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4">
            <h4 className="font-semibold">Total Încasări: {formatCurrency(totalRevenue)}</h4>
            {revenueWithPercent.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>{formatCurrency(item.value)} ({item.percent})</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Distribuția Cheltuielilor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesWithPercent}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {expensesWithPercent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4">
            <h4 className="font-semibold">Total Cheltuieli: {formatCurrency(totalExpenses)}</h4>
            {expensesWithPercent.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>{formatCurrency(item.value)} ({item.percent})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-center mb-4">Comparație Încasări vs Cheltuieli</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: 'Încasări', value: totalRevenue },
              { name: 'Cheltuieli', value: totalExpenses },
              { name: 'Profit', value: totalRevenue - totalExpenses }
            ]}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Valoare (RON)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DataVisualization;
