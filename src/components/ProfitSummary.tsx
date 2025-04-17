
import { formatCurrency } from "@/lib/formatters";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

interface ProfitSummaryProps {
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
}

const ProfitSummary = ({ grossProfit, totalExpenses, netProfit }: ProfitSummaryProps) => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-900 text-white font-bold p-4 flex justify-between items-center">
        <h2 className="text-xl flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          PROFIT NET
        </h2>
        <div>
          <p className="text-xs mb-1 italic text-right">Profit brut minus cheltuieli</p>
          <p className="text-xl font-bold">{formatCurrency(netProfit)}</p>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-md border border-green-100">
            <div className="flex items-center text-sm text-green-700 font-semibold mb-1">
              <ArrowUp className="h-4 w-4 mr-1 text-green-600" />
              Profit Brut
            </div>
            <div className="text-lg font-bold text-green-800">{formatCurrency(grossProfit)}</div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md border border-red-100">
            <div className="flex items-center text-sm text-red-700 font-semibold mb-1">
              <ArrowDown className="h-4 w-4 mr-1 text-red-600" />
              Total Cheltuieli
            </div>
            <div className="text-lg font-bold text-red-800">{formatCurrency(totalExpenses)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitSummary;
