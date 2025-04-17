
import React from "react";
import { formatCurrency } from "@/lib/formatters";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface LaborAnalysisProps {
  salaries: Record<string, number>;
  totalSalaries: number;
  revenue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const LaborAnalysis = ({ salaries, totalSalaries, revenue }: LaborAnalysisProps) => {
  const laborPercentage = revenue > 0 ? (totalSalaries / revenue) * 100 : 0;
  
  // Convert salaries to chart data
  const salaryData = Object.entries(salaries)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalSalaries > 0 ? ((value / totalSalaries) * 100).toFixed(1) + '%' : '0%'
    }))
    .sort((a, b) => b.value - a.value);
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show very small slices

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
          <p>{((payload[0].value / totalSalaries) * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Analiza Cheltuielilor cu Personalul</h2>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={salaryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {salaryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Distribuția Salariilor</h3>
          <div className="space-y-1">
            {salaryData.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>{formatCurrency(item.value)} ({item.percentage})</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Indicatori Cheie</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Total Salarii:</span>
                <span className="font-medium">{formatCurrency(totalSalaries)}</span>
              </div>
              <div className="flex justify-between">
                <span>Procent din Încasări:</span>
                <span className="font-medium">{laborPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Încasări per Angajat:</span>
                <span className="font-medium">
                  {salaryData.length > 0 
                    ? formatCurrency(revenue / salaryData.length) 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Optimizare</h3>
            <div className="text-sm">
              {laborPercentage > 30 ? (
                <p className="text-red-600">
                  Procentul cheltuielilor cu personalul ({laborPercentage.toFixed(1)}%) este peste pragul recomandat de 30%.
                  Considerați optimizarea structurii de personal.
                </p>
              ) : (
                <p className="text-green-600">
                  Procentul cheltuielilor cu personalul ({laborPercentage.toFixed(1)}%) este într-o zonă optimă (sub 30%).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaborAnalysis;
