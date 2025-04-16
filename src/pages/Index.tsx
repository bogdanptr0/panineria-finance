
import Header from "@/components/Header";
import { RequireAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportProvider, useReport } from "@/context/ReportContext";
import BasicReport from "@/components/BasicReport";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";

const Index = () => {
  return (
    <RequireAuth>
      <ReportProvider>
        <div className="min-h-screen bg-gray-50 print:bg-white">
          <div className="container mx-auto px-4 py-8 print:py-2">
            <HeaderSection />

            <Tabs defaultValue="summary" className="print:hidden">
              <TabsList className="grid grid-cols-2 mb-8 w-full md:w-[600px] mx-auto">
                <TabsTrigger value="summary">Basic Report</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <BasicReport />
              </TabsContent>
              
              <TabsContent value="advanced">
                <AdvancedAnalytics />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ReportProvider>
    </RequireAuth>
  );
};

// Helper component for the Header section
const HeaderSection = () => {
  const { 
    selectedMonth, 
    setSelectedMonth, 
    getRevenueItems,
    salaryExpenses,
    distributorExpenses,
    utilitiesExpenses,
    operationalExpenses,
    otherExpenses,
    budget
  } = useReport();

  return (
    <Header 
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
      revenueItems={getRevenueItems()}
      costOfGoodsItems={{}}
      salaryExpenses={salaryExpenses}
      distributorExpenses={distributorExpenses}
      utilitiesExpenses={utilitiesExpenses}
      operationalExpenses={operationalExpenses}
      otherExpenses={otherExpenses}
      budget={budget}
    />
  );
};

export default Index;
