
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/formatters";

interface ProductProfitabilityProps {
  revenueItems: Record<string, number>;
  revenueSubsections: {
    title: string;
    items: string[];
  }[];
}

// Define the tooltip props interface explicitly
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="font-medium">{label}</p>
        <p className="text-sm">{formatCurrency(payload[0]?.value)}</p>
      </div>
    );
  }
  return null;
};

const ProductProfitability = ({ revenueItems, revenueSubsections }: ProductProfitabilityProps) => {
  const [selectedSection, setSelectedSection] = useState(revenueSubsections[0]?.title || '');
  
  const getItemsForSection = (section: string) => {
    const subsection = revenueSubsections.find(sub => sub.title === section);
    if (!subsection) return [];
    
    return subsection.items
      .map(item => ({
        name: item,
        value: revenueItems[item] || 0
      }))
      .sort((a, b) => b.value - a.value);
  };
  
  const topProducts = getItemsForSection(selectedSection);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Revenue breakdown by product</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 overflow-x-auto pb-2">
          {revenueSubsections.map(section => (
            <button
              key={section.title}
              onClick={() => setSelectedSection(section.title)}
              className={`mr-2 px-3 py-1 rounded-full text-sm ${
                selectedSection === section.title 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProducts.slice(0, 5)}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductProfitability;
