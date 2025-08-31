
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircle, User, Users, Building, Shield, HandHeart } from "lucide-react";

const businessTypeInfo = {
  sole_trader: {
    icon: User,
    title: "Sole Trader",
    description: "You run the business by yourself as an individual. You're fully responsible for everything, like profits, debts, and legal obligations.",
    example: "A mechanic working alone, fixing cars from a small garage.",
    whyChoose: "Easiest and cheapest to start. You keep all profits but pay personal income tax. You're personally liable for debts.",
    pros: ["Simple to set up", "Keep all profits", "Full control"],
    cons: ["Personal liability", "Limited growth potential", "All responsibility on you"]
  },
  partnership: {
    icon: Users,
    title: "Partnership", 
    description: "Two or more people share ownership of a business. You split profits, losses, and responsibilities based on an agreement.",
    example: "Two mechanics starting a repair shop together, sharing costs and work.",
    whyChoose: "Simple to set up, shared workload. Each partner is personally liable for business debts, even if caused by others.",
    pros: ["Shared workload", "More resources", "Simple setup"],
    cons: ["Joint liability", "Potential conflicts", "Shared profits"]
  },
  company: {
    icon: Building,
    title: "Company",
    description: "A separate legal entity that can own assets, borrow money, or be sued on its own. You (and others) own shares in it.",
    example: "A mechanic sets up 'Joe's Auto Repairs Pty Ltd' to limit personal liability and grow the business.",
    whyChoose: "Protects personal assets (limited liability). More complex to run, with higher setup costs and reporting to ASIC.",
    pros: ["Limited liability", "Professional image", "Growth potential"],
    cons: ["More complex", "Higher costs", "More regulations"]
  },
  trust: {
    icon: Shield,
    title: "Trust",
    description: "A structure where a trustee (person or company) manages the business or assets for beneficiaries (people who get the profits).",
    example: "A mechanic sets up a trust to run the business, with family members as beneficiaries to share profits.",
    whyChoose: "Can offer tax benefits and asset protection but is complex and costly to set up. Needs a formal trust deed.",
    pros: ["Tax flexibility", "Asset protection", "Income distribution"],
    cons: ["Very complex", "High setup costs", "Ongoing compliance"]
  },
  cooperative: {
    icon: HandHeart,
    title: "Cooperative",
    description: "A group of people or businesses working together under a shared ownership model, often to achieve a common goal.",
    example: "Several mechanics form a co-operative to buy tools or share a workshop space, splitting costs and profits.",
    whyChoose: "Good for collaboration, democratic control (one member, one vote). Requires registration and specific rules.",
    pros: ["Democratic control", "Shared resources", "Community focus"],
    cons: ["Slow decisions", "Limited flexibility", "Registration required"]
  }
};

export default function BusinessTypeHelp({ type }) {
  const info = businessTypeInfo[type];
  if (!info) return null;

  const Icon = info.icon;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
          <HelpCircle className="w-4 h-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-6 bg-white border-slate-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-lg text-slate-900">{info.title}</h4>
          </div>
          
          <div>
            <h5 className="font-semibold text-slate-700 mb-1">What it is:</h5>
            <p className="text-sm text-slate-600">{info.description}</p>
          </div>

          <div>
            <h5 className="font-semibold text-slate-700 mb-1">Example:</h5>
            <p className="text-sm text-slate-600 italic">{info.example}</p>
          </div>

          <div>
            <h5 className="font-semibold text-slate-700 mb-1">Why choose?</h5>
            <p className="text-sm text-slate-600">{info.whyChoose}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-green-700 text-sm mb-1">Pros:</h5>
              <ul className="text-xs text-slate-600 list-disc list-inside">
                {info.pros.map((pro, index) => (
                  <li key={index}>{pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-red-700 text-sm mb-1">Cons:</h5>
              <ul className="text-xs text-slate-600 list-disc list-inside">
                {info.cons.map((con, index) => (
                  <li key={index}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
