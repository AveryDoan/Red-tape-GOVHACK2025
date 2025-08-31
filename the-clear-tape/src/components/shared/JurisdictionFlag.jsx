import React from 'react';
import { Badge } from "@/components/ui/badge";

const stateInfo = {
  NSW: { 
    color: "bg-blue-100 text-blue-800 border-blue-300",
    flag: "🏴󠁡󠁵󠁮󠁳󠁷󠁿", // NSW flag representation
    name: "NSW"
  },
  VIC: { 
    color: "bg-purple-100 text-purple-800 border-purple-300",
    flag: "🏴󠁡󠁵󠁶󠁩󠁣󠁿", // VIC flag with crown
    name: "VIC"
  },
  QLD: { 
    color: "bg-red-100 text-red-800 border-red-300",
    flag: "🏴󠁡󠁵󠁱󠁬󠁤󠁿", // QLD flag
    name: "QLD"
  },
  WA: { 
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    flag: "🦢", // Black swan for WA
    name: "WA"
  },
  SA: { 
    color: "bg-green-100 text-green-800 border-green-300",
    flag: "🐦", // Bird for SA
    name: "SA"
  },
  TAS: { 
    color: "bg-teal-100 text-teal-800 border-teal-300",
    flag: "🦁", // Lion for TAS
    name: "TAS"
  },
  ACT: { 
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    flag: "🏛️", // Capitol building for ACT
    name: "ACT"
  },
  NT: { 
    color: "bg-orange-100 text-orange-800 border-orange-300",
    flag: "🌺", // Sturt's desert pea flower for NT
    name: "NT"
  },
  FEDERAL: { 
    color: "bg-slate-100 text-slate-800 border-slate-300",
    flag: "🇦🇺", // Australian flag for Federal
    name: "FEDERAL"
  }
};

export default function JurisdictionFlag({ jurisdiction, isHighlighted = false, className = "" }) {
  const info = stateInfo[jurisdiction] || stateInfo.FEDERAL;
  const highlightClasses = isHighlighted ? "ring-2 ring-amber-400 ring-offset-1 shadow-lg" : "";
  
  return (
    <Badge 
      className={`${info.color} border flex items-center gap-1.5 font-semibold ${highlightClasses} ${className}`}
    >
      <span className="text-base leading-none">{info.flag}</span>
      <span className="font-bold">{info.name}</span>
    </Badge>
  );
}