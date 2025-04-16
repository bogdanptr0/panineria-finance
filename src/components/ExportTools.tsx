
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ExportTools = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporting</CardTitle>
        <CardDescription>View and analyze your financial data</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">No export options available</p>
      </CardContent>
    </Card>
  );
};

export default ExportTools;
