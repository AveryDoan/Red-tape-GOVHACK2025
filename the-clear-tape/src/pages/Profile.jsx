
import React, { useState, useEffect } from "react";
import { Business, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, MapPin, Users, DollarSign, Save, Edit, RotateCcw, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const [business, setBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const businesses = await Business.filter({ created_by: currentUser.email });
      if (businesses.length > 0) {
        setBusiness(businesses[0]);
        setFormData(businesses[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (business) {
        await Business.update(business.id, formData);
        setBusiness(formData);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving business data:', error);
    }
  };

  const handleResetSetup = async () => {
    try {
      if (business) {
        await Business.update(business.id, { onboarding_completed: false });
        // Refresh the page to trigger onboarding
        window.location.reload();
      }
    } catch (error) {
      console.error('Error resetting setup:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Business Profile</h1>
              <p className="text-slate-600 mt-1">
                Manage your business information to ensure accurate compliance recommendations
              </p>
            </div>
            <div className="flex gap-3">
              {business && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Setup
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        Reset Business Setup
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset your business setup and take you through the onboarding process again. 
                        All your current business information will be cleared. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetSetup} className="bg-orange-600 hover:bg-orange-700">
                        Reset Setup
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className={editing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
              >
                {editing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                {editing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>
        
        {business ? (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="business_name">Business Name</Label>
                    {editing ? (
                      <Input
                        id="business_name"
                        value={formData.business_name || ''}
                        onChange={(e) => updateFormData('business_name', e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-slate-50 rounded-md">
                        {business.business_name}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="industry_sector">Industry Sector</Label>
                    {editing ? (
                      <Select value={formData.industry_sector || ''} onValueChange={(value) => updateFormData('industry_sector', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select industry" />
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
                          <SelectItem value="professional_services">Professional Services</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-2 p-3 bg-slate-50 rounded-md capitalize">
                        {business.industry_sector?.replace(/_/g, ' ')}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="street_address">Street Address</Label>
                    {editing ? (
                      <Input
                        id="street_address"
                        value={formData.location?.street_address || ''}
                        onChange={(e) => updateFormData('location.street_address', e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-slate-50 rounded-md">
                        {business.location?.street_address}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="suburb">Suburb</Label>
                    {editing ? (
                      <Input
                        id="suburb"
                        value={formData.location?.suburb || ''}
                        onChange={(e) => updateFormData('location.suburb', e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-slate-50 rounded-md">
                        {business.location?.suburb}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    {editing ? (
                      <Input
                        id="postcode"
                        value={formData.location?.postcode || ''}
                        onChange={(e) => updateFormData('location.postcode', e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-slate-50 rounded-md">
                        {business.location?.postcode}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    {editing ? (
                      <Select value={formData.location?.state || ''} onValueChange={(value) => updateFormData('location.state', value)}>
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
                    ) : (
                      <div className="mt-2 p-3 bg-slate-50 rounded-md">
                        {business.location?.state}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="council">Local Council</Label>
                    {editing ? (
                      <Input
                        id="council"
                        value={formData.location?.council || ''}
                        onChange={(e) => updateFormData('location.council', e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-slate-50 rounded-md">
                        {business.location?.council || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Business Structure & Size
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Business Structure</Label>
                    <div className="mt-2 p-3 bg-slate-50 rounded-md capitalize">
                      {business.business_structure?.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div>
                    <Label>Employee Count</Label>
                    <div className="mt-2 p-3 bg-slate-50 rounded-md">
                      {business.employee_count}
                    </div>
                  </div>
                  <div>
                    <Label>Annual Turnover</Label>
                    <div className="mt-2 p-3 bg-slate-50 rounded-md capitalize">
                      {business.annual_turnover?.replace(/_/g, ' - $')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  Business Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {business.business_activities?.map((activity) => (
                    <Badge key={activity} variant="outline" className="bg-blue-50 text-blue-700">
                      {activity.replace(/_/g, ' ')}
                    </Badge>
                  )) || <span className="text-slate-500">No activities specified</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="text-center py-12">
              <Building className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Business Profile</h3>
              <p className="text-slate-600">Complete the onboarding process to create your business profile.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
