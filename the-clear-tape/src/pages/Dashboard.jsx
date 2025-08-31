
import React, { useState, useEffect } from "react";
import { Business, ComplianceItem, LegalUpdate, WarningItem, User } from "@/api/entities";
import OnboardingModal from "../components/onboarding/OnboardingModal";
import ComplianceOverview from "../components/dashboard/ComplianceOverview";
import ComplianceProgress from "../components/dashboard/ComplianceProgress";
import RecentUpdates from "../components/dashboard/RecentUpdates";
import ThingsToAvoid from "../components/dashboard/ThingsToAvoid";
import UrgentActionCard from "../components/dashboard/UrgentActionCard";
import FloatingDashboardBot from "../components/dashboard/FloatingDashboardBot";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [complianceItems, setComplianceItems] = useState([]);
  const [legalUpdates, setLegalUpdates] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const businesses = await Business.filter({ created_by: currentUser.email });
        console.log('Found businesses:', businesses);
        
        if (businesses.length === 0) {
          console.log('No businesses found, showing onboarding');
          setShowOnboarding(true);
        } else {
          const userBusiness = businesses[0];
          console.log('Business onboarding status:', userBusiness.onboarding_completed);
          
          if (userBusiness.onboarding_completed === false || userBusiness.onboarding_completed === undefined) {
            setShowOnboarding(true);
          } else {
            setBusiness(userBusiness);
            await loadComplianceData(userBusiness);
          }
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadComplianceData = async (businessData) => {
      try {
        const [compliance, updates, warningItems] = await Promise.all([
          ComplianceItem.list(),
          LegalUpdate.list('-created_date'),
          WarningItem.list()
        ]);
        
        setComplianceItems(compliance);
        setLegalUpdates(updates);
        setWarnings(warningItems);
      } catch (error) {
        console.error('Error loading compliance data:', error);
      }
    };

    initializeDashboard();
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Reload the dashboard data after onboarding
    try {
      const currentUser = await User.me();
      const businesses = await Business.filter({ created_by: currentUser.email });
      
      if (businesses.length > 0) {
        const completedBusiness = businesses[0];
        setBusiness(completedBusiness);
        
        const [compliance, updates, warningItems] = await Promise.all([
          ComplianceItem.list(),
          LegalUpdate.list('-created_date'),
          WarningItem.list()
        ]);
        
        setComplianceItems(compliance);
        setLegalUpdates(updates);
        setWarnings(warningItems);
      }
    } catch (error) {
      console.error('Error reloading dashboard:', error);
    }
  };

  const getUrgentItem = () => {
    return complianceItems.find(item => item.priority === 'critical' && item.status !== 'completed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-gradient)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back{business ? `, ${business.business_name}` : ''}
              </h1>
              <p className="text-slate-600 mt-1">
                Your personalized compliance dashboard
              </p>
            </div>
          </div>
        </div>

        {business && (
          <>
            <div className="space-y-8">
              <UrgentActionCard item={getUrgentItem()} />

              <div className="mb-8">
                <ComplianceProgress 
                  complianceItems={complianceItems} 
                  businessState={business?.location?.state}
                />
              </div>

              <ComplianceOverview complianceItems={complianceItems} />
              
              <div className="grid lg:grid-cols-2 gap-8">
                <RecentUpdates updates={legalUpdates} />
                <ThingsToAvoid warnings={warnings} />
              </div>
            </div>
            <FloatingDashboardBot businessProfile={business} />
          </>
        )}
      </div>
    </div>
  );
}
