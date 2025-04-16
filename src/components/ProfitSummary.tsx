
import { formatCurrency } from "@/lib/formatters";

interface ProfitSummaryProps {
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
}

const ProfitSummary = ({ grossProfit, totalExpenses, netProfit }: ProfitSummaryProps) => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-900 text-white font-bold p-4 flex justify-between items-center">
        <h2 className="text-xl">PROFIT NET</h2>
        <div>
          <p className="text-xs mb-1 italic text-right">Profit brut minus cheltuieli</p>
          <p className="text-xl font-bold">{formatCurrency(netProfit)}</p>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-md border border-green-100">
            <div className="text-sm text-green-700 font-semibold mb-1">Profit Brut</div>
            <div className="text-lg font-bold text-green-800">{formatCurrency(grossProfit)}</div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md border border-red-100">
            <div className="text-sm text-red-700 font-semibold mb-1">Total Cheltuieli</div>
            <div className="text-lg font-bold text-red-800">{formatCurrency(totalExpenses)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitSummary;
