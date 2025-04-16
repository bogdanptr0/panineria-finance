
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters";

interface CostOfGoodsSectionProps {
  cogsItems: Record<string, number>;
  onUpdateItem: (name: string, value: number) => void;
  totalCogs: number;
}

const CostOfGoodsSection = ({ cogsItems, onUpdateItem, totalCogs }: CostOfGoodsSectionProps) => {
  const handleInputChange = (name: string, valueStr: string) => {
    const value = valueStr === "" ? 0 : parseFloat(valueStr);
    onUpdateItem(name, value);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-800 text-white font-bold p-3">
        <h2>COSTUL BUNURILOR VANDUTE(CoGS)</h2>
      </div>
      <div className="p-1">
        {Object.entries(cogsItems).map(([name, value]) => (
          <div key={name} className="border-b flex justify-between items-center p-2">
            <span className="text-gray-800">{name}</span>
            <div className="flex items-center w-32">
              <span className="mr-2 text-gray-600">RON</span>
              <Input
                type="number"
                value={value || ""}
                onChange={(e) => handleInputChange(name, e.target.value)}
                className="text-right"
              />
            </div>
          </div>
        ))}

        <div className="bg-gray-200 p-2 flex justify-between items-center font-semibold">
          <span>TOTAL</span>
          <span>{formatCurrency(totalCogs)}</span>
        </div>
      </div>
    </div>
  );
};

export default CostOfGoodsSection;
