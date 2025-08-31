import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UrgentActionCard({ item }) {
  if (!item) return null;

  return (
    <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Megaphone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <Badge variant="secondary" className="bg-white/90 text-red-600 font-semibold mb-2">URGENT ACTION</Badge>
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="text-sm opacity-90">{item.description}</p>
          </div>
          <Link to={createPageUrl("Tasks")}>
            <Button variant="secondary" className="bg-white/90 text-slate-800 hover:bg-white">
              View Task <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}