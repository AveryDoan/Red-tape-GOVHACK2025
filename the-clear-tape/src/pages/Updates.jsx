import React, { useState, useEffect } from "react";
import { LegalUpdate, Business, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, ExternalLink, Calendar, AlertTriangle } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import JurisdictionFlag from "../components/shared/JurisdictionFlag";

const urgencyColors = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200"
};

export default function Updates() {
  const [legalUpdates, setLegalUpdates] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      const businesses = await Business.filter({ created_by: user.email });
      
      if (businesses.length > 0) {
        setBusiness(businesses[0]);
      }
      
      const updates = await LegalUpdate.list('-created_date');
      setLegalUpdates(updates);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUpdates = legalUpdates.filter(update => {
    if (activeTab === "all") return true;
    if (activeTab === "urgent") return update.urgency === "critical" || update.urgency === "high";
    if (activeTab === "upcoming") {
      const effectiveDate = new Date(update.effective_date);
      const thirtyDaysFromNow = addDays(new Date(), 30);
      return isAfter(effectiveDate, new Date()) && isBefore(effectiveDate, thirtyDaysFromNow);
    }
    if (activeTab === "action_required") return update.action_required;
    return update.urgency === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Legal Updates</h1>
          <p className="text-slate-600">
            Stay informed about regulatory changes that may affect your business
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 shadow-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              All Updates ({legalUpdates.length})
            </TabsTrigger>
            <TabsTrigger value="urgent" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
              Urgent ({legalUpdates.filter(u => u.urgency === 'critical' || u.urgency === 'high').length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
              Upcoming (30 days)
            </TabsTrigger>
            <TabsTrigger value="action_required" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              Action Required ({legalUpdates.filter(u => u.action_required).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredUpdates.length > 0 ? (
              <div className="grid gap-6">
                {filteredUpdates.map((update) => {
                  const isStateRelevant = business?.location?.state && 
                    update.affected_jurisdictions?.includes(business.location.state);

                  return (
                  <Card key={update.id} className={`bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow ${isStateRelevant ? 'ring-2 ring-amber-300 ring-offset-2' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Bell className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-xl text-slate-900">{update.title}</CardTitle>
                            {isStateRelevant && (
                              <Badge className="bg-amber-100 text-amber-800 text-xs">
                                Your State
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge className={urgencyColors[update.urgency]}>
                              {update.urgency} urgency
                            </Badge>
                            {update.action_required && (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Action Required
                              </Badge>
                            )}
                            <Badge variant="outline" className="bg-slate-50">
                              {update.category?.replace(/_/g, ' ')}
                            </Badge>
                            {update.affected_jurisdictions?.map(jurisdiction => (
                              <JurisdictionFlag 
                                key={jurisdiction}
                                jurisdiction={jurisdiction}
                                isHighlighted={jurisdiction === business?.location?.state}
                              />
                            ))}
                          </div>
                        </div>
                        {update.source_url && (
                          <a
                            href={update.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-4 leading-relaxed">{update.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Effective: {format(new Date(update.effective_date), 'MMMM d, yyyy')}
                          </span>
                        </div>
                        {update.affected_industries?.length > 0 && (
                          <div className="text-slate-600">
                            <span className="font-medium">Industries: </span>
                            {update.affected_industries.join(', ')}
                          </div>
                        )}
                      </div>

                      {update.action_required && (
                        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center gap-2 text-purple-800 font-medium mb-1">
                            <AlertTriangle className="w-4 h-4" />
                            Action Required
                          </div>
                          <p className="text-sm text-purple-700">
                            This update may require changes to your business operations or compliance procedures.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )})}
              </div>
            ) : (
              <Card className="bg-white shadow-sm border-slate-200">
                <CardContent className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No updates found</h3>
                  <p className="text-slate-600">No legal updates match your current filter.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}