
import React, { useState, useEffect } from "react";
import { ComplianceItem, Business, User } from "@/api/entities";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock, ExternalLink, Filter, Trophy } from "lucide-react";
import JargonBuster from "../components/shared/JargonBuster";
import JurisdictionFlag from "../components/shared/JurisdictionFlag";

const priorityColors = {
  critical: "border-red-500/50 bg-red-50 text-red-700",
  high: "border-orange-500/50 bg-orange-50 text-orange-700",
  medium: "border-yellow-500/50 bg-yellow-50 text-yellow-700",
  low: "border-blue-500/50 bg-blue-50 text-blue-700"
};

const categoryColors = {
  registration: "bg-purple-100 text-purple-800 border-purple-200",
  licensing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  taxation: "bg-green-100 text-green-800 border-green-200",
  workplace_safety: "bg-red-100 text-red-800 border-red-200",
  environmental: "bg-emerald-100 text-emerald-800 border-emerald-200",
  privacy: "bg-gray-100 text-gray-800 border-gray-200",
  financial: "bg-blue-100 text-blue-800 border-blue-200",
  industry_specific: "bg-amber-100 text-amber-800 border-amber-200"
};

const statusIcons = {
  pending: <AlertCircle className="w-4 h-4 text-orange-500" />,
  in_progress: <Clock className="w-4 h-4 text-blue-500" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />
};

export default function Tasks() {
  const [complianceItems, setComplianceItems] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const location = useLocation();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && location.search) {
      const params = new URLSearchParams(location.search);
      const taskId = params.get('taskId');
      if (taskId) {
        const element = document.getElementById(`task-${taskId}`);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'transition-all', 'duration-300');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
            }, 2500);
          }, 100);
        }
      }
    }
  }, [location.search, loading]);

  const loadData = async () => {
    try {
      const user = await User.me();
      const businesses = await Business.filter({ created_by: user.email });

      if (businesses.length > 0) {
        setBusiness(businesses[0]);
      }

      const items = await ComplianceItem.list();
      setComplianceItems(items);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      await ComplianceItem.update(itemId, { status: newStatus });
      setComplianceItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const filteredItems = complianceItems.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return item.status === "pending";
    if (activeTab === "in_progress") return item.status === "in_progress";
    if (activeTab === "completed") return item.status === "completed";
    return item.priority === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-gradient)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalTasks = complianceItems.length;
  const completedTasks = complianceItems.filter(item => item.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Compliance Tasks</h1>
          <p className="text-slate-600">
            Actionable steps to keep your business compliant.
          </p>
        </div>

        {/* Enhanced Progress Bar for Tasks Page */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Trophy className="w-5 h-5 text-amber-500" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Completion Status</span>
              <span className="text-lg font-bold text-slate-900">{completedTasks}/{totalTasks} tasks</span>
            </div>
            <Progress value={progressPercentage} className="h-4 mb-3" />
            <div className="text-center">
              <span className="text-3xl font-bold text-blue-600">{progressPercentage}%</span>
              <p className="text-sm text-slate-500 mt-1">Complete</p>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 shadow-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              All Tasks ({complianceItems.length})
            </TabsTrigger>
            <TabsTrigger value="critical" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
              Critical ({complianceItems.filter(i => i.priority === 'critical' && i.status !== 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
              Pending ({complianceItems.filter(i => i.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              Completed ({complianceItems.filter(i => i.status === 'completed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredItems.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => {
                  const itemToRender = { ...item };
                  if (itemToRender.title.includes("ABN")) {
                    itemToRender.external_link = "https://www.abr.gov.au/business-super-funds-charities/applying-abn";
                  }

                  const isStateRelevant = business?.location?.state &&
                    (itemToRender.applicable_states?.includes(business.location.state) ||
                     itemToRender.applicable_states?.includes("ALL"));

                  return (
                  <Card id={`task-${itemToRender.id}`} key={itemToRender.id} className={`bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow flex flex-col ${isStateRelevant && !itemToRender.title.includes("ABN") ? 'ring-2 ring-amber-300 ring-offset-2' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {statusIcons[itemToRender.status]}
                        <h3 className="font-bold text-slate-900">{itemToRender.title}</h3>
                        {isStateRelevant && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">
                            Your State
                          </Badge>
                        )}
                      </div>
                       <div className="flex gap-2 flex-wrap">
                        <Badge className={`${priorityColors[itemToRender.priority]} border`}>
                          {itemToRender.priority} priority
                        </Badge>
                        <Badge className={`${categoryColors[itemToRender.category]} border`}>
                          {itemToRender.category.replace(/_/g, ' ')}
                        </Badge>
                        <JurisdictionFlag
                          jurisdiction={itemToRender.jurisdiction?.toUpperCase() || 'FEDERAL'}
                          isHighlighted={isStateRelevant}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-slate-600 mb-4">{itemToRender.description}</p>

                      {itemToRender.cost_estimate && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-slate-700">Estimated Cost: </span>
                          <span className="text-sm text-slate-600">{itemToRender.cost_estimate}</span>
                        </div>
                      )}

                      {itemToRender.title.includes("ABN") && <JargonBuster term="ABN" explanation="Australian Business Number. A unique 11-digit number that identifies your business to the government and community." />}
                      {itemToRender.title.includes("GST") && <JargonBuster term="GST" explanation="Goods and Services Tax. A broad-based tax of 10% on most goods, services and other items sold or consumed in Australia." />}

                    </CardContent>
                    <div className="p-4 pt-0">
                      {itemToRender.external_link && (
                        <a href={itemToRender.external_link} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Go to Service <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </a>
                      )}
                      <div className="flex items-center justify-center mt-3 gap-2">
                        {itemToRender.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="link"
                            className="text-green-600"
                            onClick={() => updateItemStatus(itemToRender.id, 'completed')}
                          >
                            Mark as Done
                          </Button>
                        )}
                        {itemToRender.status === 'completed' && (
                           <Button
                            size="sm"
                            variant="link"
                            className="text-slate-500"
                            onClick={() => updateItemStatus(itemToRender.id, 'pending')}
                          >
                            Mark as Not Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )})}
              </div>
            ) : (
              <Card className="bg-white shadow-sm border-slate-200">
                <CardContent className="text-center py-12">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
                  <p className="text-slate-600">No compliance tasks match your current filter.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
