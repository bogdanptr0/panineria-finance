
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

const ExportTools: React.FC = () => {
  const handleExportCSV = () => {
    // Placeholder for export functionality
    console.log("Export to CSV functionality to be implemented");
  };

  const handleExportPDF = () => {
    // Placeholder for export functionality
    console.log("Export to PDF functionality to be implemented");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          onClick={handleExportCSV} 
          variant="outline" 
          className="w-full flex justify-between items-center"
        >
          <span>Export as CSV</span>
          <Download size={16} />
        </Button>
        
        <Button 
          onClick={handleExportPDF} 
          variant="outline" 
          className="w-full flex justify-between items-center"
        >
          <span>Export as PDF</span>
          <Download size={16} />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportTools;
