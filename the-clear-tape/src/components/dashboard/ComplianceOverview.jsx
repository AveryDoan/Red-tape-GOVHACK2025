import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function ComplianceOverview({ complianceItems = [] }) {
  const getStatusCounts = () => {
    const critical = complianceItems.filter(item => item.priority === 'critical').length;
    const high = complianceItems.filter(item => item.priority === 'high').length;
    const completed = complianceItems.filter(item => item.status === 'completed').length;
    const inProgress = complianceItems.filter(item => item.status === 'in_progress').length;
    
    return { critical, high, completed, inProgress };
  };

  const { critical, high, completed, inProgress } = getStatusCounts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Critical Items</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">{critical}</div>
          <p className="text-xs text-red-700">Immediate attention required</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-800">High Priority</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900">{high}</div>
          <p className="text-xs text-amber-700">Action needed soon</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{inProgress}</div>
          <p className="text-xs text-blue-700">Currently working on</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{completed}</div>
          <p className="text-xs text-green-700">Successfully completed</p>
        </CardContent>
      </Card>
    </div>
  );
}