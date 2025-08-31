import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, ExternalLink, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const urgencyColors = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200"
};

export default function RecentUpdates({ updates = [] }) {
  const recentUpdates = updates.slice(0, 3);

  return (
    <Card className="bg-white shadow-sm border-slate-200">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Bell className="w-5 h-5" />
            Recent Legal Updates
          </CardTitle>
          <Link to={createPageUrl("Updates")}>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {recentUpdates.length > 0 ? (
          <div className="space-y-4">
            {recentUpdates.map((update) => (
              <div key={update.id} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{update.title}</h4>
                    <Badge className={urgencyColors[update.urgency]}>
                      {update.urgency}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{update.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Effective: {format(new Date(update.effective_date), 'MMM d, yyyy')}</span>
                    {update.source_url && (
                      <a
                        href={update.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No recent updates</p>
            <p className="text-sm">You'll be notified when new regulations are published</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}