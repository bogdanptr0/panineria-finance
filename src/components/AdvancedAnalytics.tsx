
import ProductProfitability from "@/components/ProductProfitability";
import LaborAnalysis from "@/components/LaborAnalysis";
import ComparisonView from "@/components/ComparisonView";
import BudgetAnalysis from "@/components/BudgetAnalysis";
import CashFlowProjection from "@/components/CashFlowProjection";
import { useReport } from "@/context/ReportContext";

const AdvancedAnalytics = () => {
  const {
    selectedMonth,
    getRevenueItems,
    totalRevenue,
    totalExpenses,
    netProfit,
    budget,
    salaryExpenses,
    updateBudget
  } = useReport();

  return (
    <div className="space-y-8">
      <ProductProfitability 
        revenueItems={getRevenueItems()}
        costOfGoodsItems={{}}
      />
      
      <LaborAnalysis 
        salaryExpenses={salaryExpenses}
        totalRevenue={totalRevenue}
      />
      
      <ComparisonView 
        currentMonth={selectedMonth}
        currentReport={{
          totalRevenue,
          totalCogs: 0,
          grossProfit: totalRevenue,
          totalExpenses,
          netProfit
        }}
      />
      
      <BudgetAnalysis 
        selectedMonth={selectedMonth}
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        budget={budget}
        onBudgetUpdate={updateBudget}
      />
      
      <CashFlowProjection 
        currentRevenue={totalRevenue}
        currentExpenses={totalExpenses}
      />
    </div>
  );
};

export default AdvancedAnalytics;
