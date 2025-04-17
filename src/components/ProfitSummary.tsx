
import React from "react";
import { formatCurrency } from "@/lib/formatters";

interface ProfitSummaryProps {
  title: string;
  revenue: number;
  expenses: number;
  profit: number;
}

const ProfitSummary = ({ title, revenue, expenses, profit }: ProfitSummaryProps) => {
  const isProfitable = profit > 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-800 text-white font-bold p-3">
        <h2>{title}</h2>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Total Incasari</h3>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(revenue)}</p>
        </div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Total Cheltuieli</h3>
          <p className="text-lg font-semibold text-red-600">{formatCurrency(expenses)}</p>
        </div>
        <hr />
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Profit Net</h3>
          <p className={`text-lg font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(profit)}
          </p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="mb-2">
            <span className="font-semibold">Rentabilitate:</span> {revenue > 0 ? `${((profit / revenue) * 100).toFixed(2)}%` : 'N/A'}
          </div>
          
          <div>
            <span className="font-semibold">Cheltuieli relative:</span> {revenue > 0 ? `${((expenses / revenue) * 100).toFixed(2)}%` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitSummary;
