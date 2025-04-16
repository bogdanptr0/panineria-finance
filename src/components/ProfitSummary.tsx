
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
    </div>
  );
};

export default ProfitSummary;
