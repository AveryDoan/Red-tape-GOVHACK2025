import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShieldAlert } from "lucide-react";

const riskColors = {
  high: "bg-red-500",
  medium: "bg-orange-500",
  low: "bg-yellow-500",
};

export default function ThingsToAvoid({ warnings = [] }) {
  const importantWarnings = warnings.slice(0, 4);

  return (
    <Card className="bg-white shadow-sm border-slate-200">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Things to Avoid
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {importantWarnings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importantWarnings.map((warning) => (
              <div key={warning.id} className="relative p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${riskColors[warning.risk_level]}`} />
                <h4 className="font-bold text-slate-900 pr-6">{warning.title}</h4>
                <p className="text-sm text-slate-600 mt-1 mb-3">{warning.description}</p>
                {warning.details_link && (
                  <a href={warning.details_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="link" className="p-0 h-auto text-blue-600">
                      Learn More <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No specific warnings identified yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}