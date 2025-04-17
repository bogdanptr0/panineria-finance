
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface DataVisualizationProps {
  revenueItems: Record<string, number>;
  costOfGoodsItems: Record<string, number>;
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  utilitiesExpenses?: Record<string, number>;
  operationalExpenses?: Record<string, number>;
  otherExpenses?: Record<string, number>;
  grossProfit: number;
  netProfit: number;
  totalExpenses: number;
}

const DataVisualization = ({
  revenueItems,
  costOfGoodsItems,
  salaryExpenses,
  distributorExpenses,
  utilitiesExpenses = {},
  operationalExpenses = {},
  otherExpenses = {},
  grossProfit,
  netProfit,
  totalExpenses
}: DataVisualizationProps) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF19B5", "#19FFDF", "#19DBFF", "#198DFF"];

  // Prepare data for charts
  const pieChartData = [
    { name: "Salarii", value: Object.values(salaryExpenses).reduce((a, b) => a + b, 0) },
    { name: "Distribuitori", value: Object.values(distributorExpenses).reduce((a, b) => a + b, 0) },
    { name: "Utilitati", value: Object.values(utilitiesExpenses).reduce((a, b) => a + b, 0) },
    { name: "Operationale", value: Object.values(operationalExpenses).reduce((a, b) => a + b, 0) },
    { name: "Alte", value: Object.values(otherExpenses).reduce((a, b) => a + b, 0) }
  ].filter(item => item.value > 0);

  const revenueData = Object.entries(revenueItems)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 12) + "..." : name,
      value
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Calculate profitability metrics
  const profitMargin = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
  
  // Prepare summary data for bar chart
  const summaryData = [
    { name: "Venituri", value: grossProfit },
    { name: "Cheltuieli", value: totalExpenses },
    { name: "Profit Net", value: netProfit }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vizualizare Date</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Rezumat Financiar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="#8884d8">
                    {summaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Structura Cheltuieli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Produse După Venituri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value.toLocaleString()}`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="#8884d8">
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[600px] mx-auto">
          <TabsTrigger value="overview">Rezumat</TabsTrigger>
          <TabsTrigger value="revenue">Venituri</TabsTrigger>
          <TabsTrigger value="expenses">Cheltuieli</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-center text-lg text-blue-600">Venituri Totale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-center">{formatCurrency(grossProfit)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-center text-lg text-red-600">Cheltuieli Totale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-center">{formatCurrency(totalExpenses)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-center text-lg text-green-600">Profit Net</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-center">{formatCurrency(netProfit)}</p>
                <p className="text-sm text-center text-gray-500 mt-2">
                  Marja de profit: {profitMargin.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue">
          <div className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Detalii Venituri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="value" name="Venituri" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses">
          <div className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Detalii Cheltuieli</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({name, value}) => `${name}: ${formatCurrency(value)}`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVisualization;
