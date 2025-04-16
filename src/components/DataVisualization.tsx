
import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DataVisualizationProps {
  revenueItems: Record<string, number>;
  costOfGoodsItems: Record<string, number>;
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  operationalExpenses: Record<string, number>;
  grossProfit: number;
  netProfit: number;
  totalExpenses: number;
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", 
  "#82CA9D", "#FF6B6B", "#6B66FF", "#FFD700", "#FF69B4"
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
        <p className="font-bold">{label}</p>
        <p className="text-sm">{`${payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const DataVisualization = ({
  revenueItems,
  costOfGoodsItems,
  salaryExpenses,
  distributorExpenses,
  operationalExpenses,
  grossProfit,
  netProfit,
  totalExpenses
}: DataVisualizationProps) => {
  const [currentTab, setCurrentTab] = useState("revenue");

  // Prepare revenue data
  const revenueData = Object.entries(revenueItems).map(([name, value]) => ({
    name,
    value
  }));

  // Prepare expense data
  const expenseData = [
    ...Object.entries(salaryExpenses).map(([name, value]) => ({
      name: `Salary: ${name}`,
      value,
      category: "Salary"
    })),
    ...Object.entries(distributorExpenses).map(([name, value]) => ({
      name: `Distributor: ${name}`,
      value,
      category: "Distributor"
    })),
    ...Object.entries(operationalExpenses).map(([name, value]) => ({
      name: `Operational: ${name}`,
      value,
      category: "Operational"
    }))
  ];

  // Prepare profit data
  const profitData = [
    { name: "Gross Profit", value: grossProfit },
    { name: "Total Expenses", value: totalExpenses },
    { name: "Net Profit", value: netProfit }
  ];

  // Prepare category summary data
  const categorySummary = [
    { name: "Revenue", value: Object.values(revenueItems).reduce((sum, val) => sum + val, 0) },
    { name: "CoGS", value: Object.values(costOfGoodsItems).reduce((sum, val) => sum + val, 0) },
    { name: "Salary", value: Object.values(salaryExpenses).reduce((sum, val) => sum + val, 0) },
    { name: "Distributor", value: Object.values(distributorExpenses).reduce((sum, val) => sum + val, 0) },
    { name: "Operational", value: Object.values(operationalExpenses).reduce((sum, val) => sum + val, 0) }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Data Visualization</h2>
      
      <Tabs defaultValue="revenue" onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="p-1">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Revenue" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses" className="p-1">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Expense" fill="#FF5252" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="profit" className="p-1">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Amount" fill="#2196F3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="summary" className="p-1">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySummary}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVisualization;
