import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircle } from "lucide-react";

export default function JargonBuster({ term, explanation }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="inline-flex items-center gap-1">
          <span>{term}</span>
          <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer" />
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-slate-800 text-white border-slate-700">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{term}</h4>
          <p className="text-sm">
            {explanation}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}