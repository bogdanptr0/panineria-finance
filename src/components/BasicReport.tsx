
import { formatCurrency } from "@/lib/formatters";
import RevenueSection from "@/components/RevenueSection";
import ExpensesSection from "@/components/ExpensesSection";
import ProfitSummary from "@/components/ProfitSummary";
import DataVisualization from "@/components/DataVisualization";
import { useReport } from "@/context/ReportContext";

const BasicReport = () => {
  const {
    getRevenueItems,
    handleRevenueUpdate,
    totalRevenue,
    handleRevenueRename,
    handleAddRevenue,
    handleDeleteRevenue,
    salaryExpenses,
    handleSalaryUpdate,
    totalSalaryExpenses,
    handleSalaryRename,
    handleAddSalary,
    handleDeleteSalary,
    distributorExpenses,
    handleDistributorUpdate,
    totalDistributorExpenses,
    handleDistributorRename,
    handleAddDistributor,
    handleDeleteDistributor,
    utilitiesExpenses,
    operationalExpenses,
    otherExpenses,
    totalUtilitiesExpenses,
    totalOperationalExpenses,
    totalOtherExpenses,
    handleUtilitiesUpdate,
    handleOperationalUpdate,
    handleOtherExpensesUpdate,
    handleUtilitiesRename,
    handleOperationalRename,
    handleOtherExpensesRename,
    handleSubsectionAddItem,
    handleDeleteOperationalItem,
    grossProfit,
    totalExpenses,
    netProfit,
    bucatarieItems,
    barItems
  } = useReport();

  const operationalExpensesSubsections = [
    {
      title: "Utilitati",
      items: Object.keys(utilitiesExpenses)
    },
    {
      title: "Operationale",
      items: Object.keys(operationalExpenses)
    },
    {
      title: "Alte Cheltuieli",
      items: Object.keys(otherExpenses)
    }
  ];

  const revenueSubsections = [
    {
      title: "Bucatarie",
      items: Object.keys(bucatarieItems)
    },
    {
      title: "Bar",
      items: Object.keys(barItems)
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
        <div className="space-y-6">
          <RevenueSection 
            revenueItems={getRevenueItems()}
            onUpdateItem={handleRevenueUpdate}
            totalRevenue={totalRevenue}
            onRenameItem={handleRevenueRename}
            onAddItem={handleAddRevenue}
            onDeleteItem={handleDeleteRevenue}
            subsections={revenueSubsections}
          />
          
          <div className="bg-gray-100 p-4 rounded-md print:break-after-page">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-lg">PROFIT BRUT</span>
              <span className="text-lg">{formatCurrency(grossProfit)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ExpensesSection 
            title="CHELTUIELI SALARIALE"
            items={salaryExpenses}
            onUpdateItem={handleSalaryUpdate}
            totalExpenses={totalSalaryExpenses}
            onRenameItem={handleSalaryRename}
            onAddItem={handleAddSalary}
            onDeleteItem={handleDeleteSalary}
          />
          
          <ExpensesSection 
            title="CHELTUIELI DISTRIBUITORI"
            items={distributorExpenses}
            onUpdateItem={handleDistributorUpdate}
            totalExpenses={totalDistributorExpenses}
            onRenameItem={handleDistributorRename}
            onAddItem={handleAddDistributor}
            onDeleteItem={handleDeleteDistributor}
          />
          
          <ExpensesSection 
            title="CHELTUIELI OPERATIONALE"
            items={{
              ...utilitiesExpenses,
              ...operationalExpenses,
              ...otherExpenses
            }}
            onUpdateItem={(name, value) => {
              if (operationalExpensesSubsections[0].items.includes(name)) {
                handleUtilitiesUpdate(name, value);
              } else if (operationalExpensesSubsections[1].items.includes(name)) {
                handleOperationalUpdate(name, value);
              } else {
                handleOtherExpensesUpdate(name, value);
              }
            }}
            totalExpenses={totalUtilitiesExpenses + totalOperationalExpenses + totalOtherExpenses}
            onRenameItem={(oldName, newName) => {
              if (operationalExpensesSubsections[0].items.includes(oldName)) {
                handleUtilitiesRename(oldName, newName);
              } else if (operationalExpensesSubsections[1].items.includes(oldName)) {
                handleOperationalRename(oldName, newName);
              } else {
                handleOtherExpensesRename(oldName, newName);
              }
            }}
            onAddItem={(name, subsectionTitle) => {
              handleSubsectionAddItem(subsectionTitle || "Alte Cheltuieli", name);
            }}
            onDeleteItem={handleDeleteOperationalItem}
            subsections={operationalExpensesSubsections}
          />
          
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-lg">TOTAL CHELTUIELI</span>
              <span className="text-lg">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      <ProfitSummary 
        grossProfit={grossProfit} 
        totalExpenses={totalExpenses} 
        netProfit={netProfit} 
      />
      
      <div className="mt-8">
        <DataVisualization 
          revenueItems={getRevenueItems()}
          costOfGoodsItems={{}}
          salaryExpenses={salaryExpenses}
          distributorExpenses={distributorExpenses}
          utilitiesExpenses={utilitiesExpenses}
          operationalExpenses={operationalExpenses}
          otherExpenses={otherExpenses}
          grossProfit={grossProfit}
          netProfit={netProfit}
          totalExpenses={totalExpenses}
        />
      </div>
    </>
  );
};

export default BasicReport;
