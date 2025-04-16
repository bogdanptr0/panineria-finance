
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProductProfitabilityProps {
  revenueItems: Record<string, number>;
  costOfGoodsItems?: Record<string, number>;
  totalRevenue?: number;
  totalExpenses?: number;
  netProfit?: number;
}

const ProductProfitability = ({ revenueItems, costOfGoodsItems = {} }: ProductProfitabilityProps) => {
  // Calculate profitability metrics for each product
  const products = Object.keys(revenueItems).filter(name => 
    costOfGoodsItems && costOfGoodsItems.hasOwnProperty(name)
  );
  
  const productMetrics = products.map(name => {
    const revenue = revenueItems[name] || 0;
    const cost = costOfGoodsItems?.[name] || 0;
    const profit = revenue - cost;
    const margin = revenue > 0 ? profit / revenue : 0;
    
    return {
      name,
      revenue,
      profit,
      margin
    };
  });
  
  // Sort products by profit margin (descending)
  const sortedProducts = [...productMetrics].sort((a, b) => b.margin - a.margin);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Product Profitability</h2>
      
      {sortedProducts.length > 0 ? (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map(product => (
                <TableRow key={product.name}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={product.profit >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(product.profit)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={product.margin >= 0.3 ? "text-green-600" : product.margin >= 0.15 ? "text-amber-600" : "text-red-600"}>
                      {formatPercentage(product.margin)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>* Products are sorted by profit margin (highest to lowest)</p>
            <p>* Only products with both revenue and cost data are shown</p>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 italic">
          No matching products found. Ensure product names match between revenue and cost sections.
        </div>
      )}
    </div>
  );
};

export default ProductProfitability;
