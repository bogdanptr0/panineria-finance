
import React from "react";
import { formatCurrency } from "@/lib/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Section {
  title: string;
  items: string[];
}

export interface ProductProfitabilityProps {
  items: Record<string, number>;
  sections: Section[];
}

const ProductProfitability = ({ items, sections }: ProductProfitabilityProps) => {
  // Sort items by value (descending)
  const sortedItems = Object.entries(items)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .slice(0, 10);  // Top 10 items

  // Prepare data for chart
  const chartData = sortedItems.map(([name, value]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    fullName: name,
    value
  }));
  
  // Group items by section
  const sectionData = sections.map(section => {
    const sectionItems = section.items
      .filter(itemName => items[itemName] > 0)
      .map(itemName => ({
        name: itemName,
        value: items[itemName]
      }))
      .sort((a, b) => b.value - a.value);
    
    const total = sectionItems.reduce((sum, item) => sum + item.value, 0);
    
    return {
      title: section.title,
      items: sectionItems,
      total
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md">
          <p className="font-semibold">{payload[0].payload.fullName || label}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Top Produse după Cifra de Afaceri</h2>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Încasări" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sectionData.map((section, index) => (
          <div key={index} className="border rounded p-3">
            <h3 className="font-semibold border-b pb-2 mb-2">{section.title} - {formatCurrency(section.total)}</h3>
            <div className="space-y-1">
              {section.items.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{item.name}</span>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
              {section.items.length > 5 && (
                <div className="text-xs text-gray-500 mt-1">
                  + {section.items.length - 5} more items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductProfitability;
