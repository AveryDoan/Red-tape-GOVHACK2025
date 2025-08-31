import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, AlertCircle, Circle, MapPin, Flag } from "lucide-react";

const priorityIcons = {
  critical: <AlertCircle className="w-5 h-5 text-red-500" />,
  high: <AlertCircle className="w-5 h-5 text-orange-500" />,
  medium: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  low: <Circle className="w-5 h-5 text-blue-500" />,
};

export default function ComplianceProgress({ complianceItems = [], businessState }) {
  const totalTasks = complianceItems.length;
  const completedTasks = complianceItems.filter(item => item.status === 'completed').length;
  
  const sortedTasks = [...complianceItems].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });
  
  const checkpoints = sortedTasks.slice(0, 5);

  return (
    <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 text-xl">
          <MapPin className="w-6 h-6 text-blue-600" />
          Your Compliance Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-lg font-bold text-slate-900">
              {completedTasks} of {totalTasks} completed
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-2xl font-bold text-blue-600">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          Here are your next steps. Completed items are moved to the end of your list. Click any task to view details.
        </p>

        <div className="relative flex items-center">
          <div className="absolute w-full h-1 bg-gradient-to-r from-blue-200 to-green-200 rounded-full" />
          <div className="flex justify-between w-full">
            {checkpoints.map((task, index) => (
              <div key={task.id} className="z-10 flex flex-col items-center group">
                <Link to={createPageUrl(`Tasks?taskId=${task.id}`)} className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg
                    ${task.status === 'completed' 
                      ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-200' 
                      : 'bg-white border-3 border-slate-300 group-hover:border-blue-500 shadow-slate-200'}`
                  }>
                    {task.status === 'completed' 
                      ? <CheckCircle className="w-6 h-6 text-white" /> 
                      : priorityIcons[task.priority]
                    }
                  </div>
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-52 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <p className="font-bold text-sm">{task.title}</p>
                    <p className="mt-1 text-slate-300">{task.description.substring(0, 80)}...</p>
                    <div className="flex items-center gap-1 mt-2 text-slate-400">
                       <Flag className="w-3 h-3" /> {task.jurisdiction}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                  </div>
                </Link>
                <p className="text-xs text-slate-600 mt-3 text-center max-w-[120px] font-medium leading-tight">
                  {task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}