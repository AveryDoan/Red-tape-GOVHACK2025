import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Building, MapPin, Users, DollarSign, Activity } from "lucide-react";
import { Business, User } from "@/api/entities";
import BusinessTypeHelp from "./BusinessTypeHelp";
import RegBot from './RegBot';

const STEPS = [
  { id: 'business', title: 'Business Details', icon: Building },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'structure', title: 'Business Structure', icon: Users },
  { id: 'financials', title: 'Size & Turnover', icon: DollarSign },
  { id: 'activities', title: 'Business Activities', icon: Activity },
];

const BUSINESS_ACTIVITIES = [
  { id: 'food_handling', label: 'Food Handling & Service' },
  { id: 'alcohol_sales', label: 'Alcohol Sales' },
  { id: 'online_sales', label: 'Online Sales & E-commerce' },
  { id: 'data_collection', label: 'Customer Data Collection' },
  { id: 'import_export', label: 'Import/Export' },
  { id: 'hazardous_materials', label: 'Hazardous Materials' },
  { id: 'financial_services', label: 'Financial Services' },
  { id: 'childcare', label: 'Childcare Services' },
  { id: 'healthcare_services', label: 'Healthcare Services' },
  { id: 'construction_work', label: 'Construction Work' },
];

// Common Australian suburbs by state
const SUBURBS_BY_STATE = {
  NSW: [
    { name: 'Sydney', postcode: '2000' },
    { name: 'Newcastle', postcode: '2300' },
    { name: 'Wollongong', postcode: '2500' },
    { name: 'Parramatta', postcode: '2150' },
    { name: 'Blacktown', postcode: '2148' },
    { name: 'Liverpool', postcode: '2170' },
    { name: 'Penrith', postcode: '2750' },
    { name: 'Campbelltown', postcode: '2560' }
  ],
  VIC: [
    { name: 'Melbourne', postcode: '3000' },
    { name: 'Geelong', postcode: '3220' },
    { name: 'Ballarat', postcode: '3350' },
    { name: 'Bendigo', postcode: '3550' },
    { name: 'Frankston', postcode: '3199' },
    { name: 'Dandenong', postcode: '3175' },
    { name: 'Shepparton', postcode: '3630' }
  ],
  QLD: [
    { name: 'Brisbane', postcode: '4000' },
    { name: 'Gold Coast', postcode: '4217' },
    { name: 'Townsville', postcode: '4810' },
    { name: 'Cairns', postcode: '4870' },
    { name: 'Toowoomba', postcode: '4350' },
    { name: 'Mackay', postcode: '4740' },
    { name: 'Rockhampton', postcode: '4700' }
  ],
  WA: [
    { name: 'Perth', postcode: '6000' },
    { name: 'Fremantle', postcode: '6160' },
    { name: 'Bunbury', postcode: '6230' },
    { name: 'Geraldton', postcode: '6530' },
    { name: 'Kalgoorlie', postcode: '6430' },
    { name: 'Albany', postcode: '6330' }
  ],
  SA: [
    { name: 'Adelaide', postcode: '5000' },
    { name: 'Mount Gambier', postcode: '5290' },
    { name: 'Whyalla', postcode: '5600' },
    { name: 'Murray Bridge', postcode: '5253' },
    { name: 'Port Augusta', postcode: '5700' }
  ],
  TAS: [
    { name: 'Hobart', postcode: '7000' },
    { name: 'Launceston', postcode: '7250' },
    { name: 'Devonport', postcode: '7310' },
    { name: 'Burnie', postcode: '7320' }
  ],
  ACT: [
    { name: 'Canberra', postcode: '2600' },
    { name: 'Belconnen', postcode: '2617' },
    { name: 'Tuggeranong', postcode: '2900' },
    { name: 'Woden', postcode: '2606' }
  ],
  NT: [
    { name: 'Darwin', postcode: '0800' },
    { name: 'Alice Springs', postcode: '0870' },
    { name: 'Katherine', postcode: '0850' },
    { name: 'Nhulunbuy', postcode: '0880' },
    { name: 'Tennant Creek', postcode: '0860' }
  ]
};

export default function OnboardingModal({ isOpen, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [existingBusiness, setExistingBusiness] = useState(null);
  const [formData, setFormData] = useState({
    business_name: '',
    location: {
      street_address: '',
      suburb: '',
      state: '',
      postcode: '',
      council: ''
    },
    business_structure: '',
    industry_sector: '',
    employee_count: '',
    annual_turnover: '',
    business_activities: []
  });
  const [availableSuburbs, setAvailableSuburbs] = useState([]);

  useEffect(() => {
    const fetchBusiness = async () => {
        try {
            const user = await User.me();
            const businesses = await Business.filter({ created_by: user.email });
            if (businesses.length > 0) {
                setExistingBusiness(businesses[0]);
            }
        } catch (error) {
            console.error("Error fetching existing business", error);
        }
    };
    if (isOpen) {
        fetchBusiness();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.location.state && SUBURBS_BY_STATE[formData.location.state]) {
      setAvailableSuburbs(SUBURBS_BY_STATE[formData.location.state]);
    } else {
      setAvailableSuburbs([]);
    }
  }, [formData.location.state]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const dataToSave = {
        ...formData,
        onboarding_completed: true
      };

      if (existingBusiness) {
        await Business.update(existingBusiness.id, dataToSave);
      } else {
        await Business.create(dataToSave);
      }
      onComplete();
    } catch (error) {
      console.error('Error saving business data:', error);
    }
  };

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleRegBotSuggestion = (field, value) => {
    updateFormData(field, value);
  };

  const toggleActivity = (activityId) => {
    setFormData(prev => ({
      ...prev,
      business_activities: prev.business_activities.includes(activityId)
        ? prev.business_activities.filter(id => id !== activityId)
        : [...prev.business_activities, activityId]
    }));
  };

  const handleSuburbSelect = (suburb) => {
    updateFormData('location.suburb', suburb.name);
    updateFormData('location.postcode', suburb.postcode);
  };

  const prefillSampleData = () => {
    setFormData({
      business_name: 'Darwin Auto Repairs',
      location: {
        street_address: '123 Stuart Highway',
        suburb: 'Darwin',
        state: 'NT',
        postcode: '0800',
        council: 'City of Darwin'
      },
      business_structure: 'sole_trader',
      industry_sector: 'automotive',
      employee_count: '1-4',
      annual_turnover: '75k_2m',
      business_activities: ['hazardous_materials', 'data_collection']
    });
    setAvailableSuburbs(SUBURBS_BY_STATE.NT);
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case 'business':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Tell us about your business</h3>
              <p className="text-slate-600">We'll use this to identify relevant regulations</p>
            </div>
            
            <div className="flex justify-center gap-4 mb-6">
              <RegBot 
                currentStep={step.id} 
                onSuggestion={handleRegBotSuggestion}
                formData={formData}
              />
              <Button variant="outline" size="sm" onClick={prefillSampleData}>
                Try Sample Data
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => updateFormData('business_name', e.target.value)}
                  placeholder="Enter your business name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="industry_sector">Industry Sector</Label>
                <Select value={formData.industry_sector} onValueChange={(value) => updateFormData('industry_sector', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="professional_services">Professional Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Where is your business located?</h3>
              <p className="text-slate-600">Location determines which regulations apply</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <RegBot 
                currentStep={step.id} 
                onSuggestion={handleRegBotSuggestion}
                formData={formData}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="street_address">Street Address</Label>
                <Input
                  id="street_address"
                  value={formData.location.street_address}
                  onChange={(e) => updateFormData('location.street_address', e.target.value)}
                  placeholder="123 Business Street"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Select value={formData.location.state} onValueChange={(value) => updateFormData('location.state', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSW">New South Wales</SelectItem>
                    <SelectItem value="VIC">Victoria</SelectItem>
                    <SelectItem value="QLD">Queensland</SelectItem>
                    <SelectItem value="WA">Western Australia</SelectItem>
                    <SelectItem value="SA">South Australia</SelectItem>
                    <SelectItem value="TAS">Tasmania</SelectItem>
                    <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                    <SelectItem value="NT">Northern Territory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="suburb">Suburb</Label>
                {availableSuburbs.length > 0 ? (
                  <Select value={formData.location.suburb} onValueChange={(suburb) => {
                    const selectedSuburb = availableSuburbs.find(s => s.name === suburb);
                    if (selectedSuburb) handleSuburbSelect(selectedSuburb);
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select suburb" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSuburbs.map((suburb) => (
                        <SelectItem key={suburb.name} value={suburb.name}>
                          {suburb.name} ({suburb.postcode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="suburb"
                    value={formData.location.suburb}
                    onChange={(e) => updateFormData('location.suburb', e.target.value)}
                    placeholder="Suburb"
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={formData.location.postcode}
                  onChange={(e) => updateFormData('location.postcode', e.target.value)}
                  placeholder="2000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="council">Local Council (Optional)</Label>
                <Input
                  id="council"
                  value={formData.location.council}
                  onChange={(e) => updateFormData('location.council', e.target.value)}
                  placeholder="City of Darwin"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 'structure':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Business Structure</h3>
              <p className="text-slate-600">Different structures have different obligations</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <RegBot 
                currentStep={step.id} 
                onSuggestion={handleRegBotSuggestion}
                formData={formData}
              />
            </div>

            <div>
              <Label htmlFor="business_structure">Legal Structure</Label>
              <Select value={formData.business_structure} onValueChange={(value) => updateFormData('business_structure', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select business structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole_trader">Sole Trader</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="cooperative">Cooperative</SelectItem>
                </SelectContent>
              </Select>
              
              {formData.business_structure && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Learn about {formData.business_structure.replace('_', ' ')}:
                    </span>
                    <BusinessTypeHelp type={formData.business_structure} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'financials':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Business Size</h3>
              <p className="text-slate-600">Size affects reporting requirements and thresholds</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <RegBot 
                currentStep={step.id} 
                onSuggestion={handleRegBotSuggestion}
                formData={formData}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="employee_count">Number of Employees</Label>
                <Select value={formData.employee_count} onValueChange={(value) => updateFormData('employee_count', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Just me (0 employees)</SelectItem>
                    <SelectItem value="1-4">1-4 employees</SelectItem>
                    <SelectItem value="5-19">5-19 employees</SelectItem>
                    <SelectItem value="20-199">20-199 employees</SelectItem>
                    <SelectItem value="200+">200+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="annual_turnover">Annual Turnover</Label>
                <Select value={formData.annual_turnover} onValueChange={(value) => updateFormData('annual_turnover', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select annual turnover" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_75k">Under $75,000</SelectItem>
                    <SelectItem value="75k_2m">$75,000 - $2 million</SelectItem>
                    <SelectItem value="2m_10m">$2 million - $10 million</SelectItem>
                    <SelectItem value="10m_50m">$10 million - $50 million</SelectItem>
                    <SelectItem value="over_50m">Over $50 million</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Business Activities</h3>
              <p className="text-slate-600">Select all activities your business engages in</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <RegBot 
                currentStep={step.id} 
                onSuggestion={handleRegBotSuggestion}
                formData={formData}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BUSINESS_ACTIVITIES.map((activity) => (
                <Card 
                  key={activity.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    formData.business_activities.includes(activity.id) 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => toggleActivity(activity.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={formData.business_activities.includes(activity.id)}
                        readOnly
                      />
                      <Label className="text-sm font-medium cursor-pointer text-slate-900">
                        {activity.label}
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Welcome to RegCompliance
            </DialogTitle>
            <div className="text-sm text-slate-500">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
          <div className="flex space-x-2 mb-6">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded-full transition-colors duration-200 ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="py-6">
          {renderStepContent()}
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}