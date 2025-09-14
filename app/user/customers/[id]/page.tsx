"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { getUnivenCustomerById, formatUnivenCurrency, formatUnivenDate, getUnivenCustomerFullName, getUnivenCustomerPrimaryPhone, getUnivenCustomerPrimaryEmail, getUnivenCustomerFullAddress, getUnivenCustomerRiskLevel, getUnivenCustomerOverdueStatus } from "@/lib/univen-customer-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  User, 
  ArrowLeft, 
  Edit,
  Calendar,
  DollarSign,
  MapPin,
  CreditCard,
  AlertTriangle,
  Building,
  FileText
} from "lucide-react";

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!params.id) {
        setError("No customer ID provided");
        setLoading(false);
        return;
      }

      try {
        const customerId = Array.isArray(params.id) ? params.id[0] : params.id;
        const customerData = await getUnivenCustomerById(customerId);
        
        if (!customerData) {
          setError("Customer not found");
        } else {
          setCustomer(customerData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load customer details");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading customer details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/user/customers')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Customer Not Found</h2>
          <p>The customer you are looking for does not exist or has been removed.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/user/customers')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  // Risk level badge styling
  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/user/customers')}
          className="flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Customers
        </Button>
        
        <Button variant="outline" onClick={() => setEditMode(!editMode)}>
          <Edit className="h-4 w-4 mr-2" />
          {editMode ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {/* Customer Overview Card */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <div>
                <h1 className="text-2xl font-bold">{getUnivenCustomerFullName(customer)}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline">{customer["Client Reference"]}</Badge>
                  <Badge variant={getRiskBadgeVariant(getUnivenCustomerRiskLevel(customer))}>
                    {getUnivenCustomerRiskLevel(customer)?.toUpperCase() || 'UNKNOWN'} RISK
                  </Badge>
                  {getUnivenCustomerOverdueStatus(customer) && (
                    <Badge variant="destructive">OVERDUE</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-3xl font-bold text-primary">
                {formatUnivenCurrency(customer["Current Balance"])}
              </p>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{getUnivenCustomerPrimaryPhone(customer) || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{getUnivenCustomerPrimaryEmail(customer) || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>#{customer.acc_number || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{formatUnivenDate(customer["Date Opened"]) || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{customer.account_status_description || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Building className="h-4 w-4 mr-3 text-muted-foreground mt-1" />
                  <span>{getUnivenCustomerFullAddress(customer) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Button>
              <Phone className="h-4 w-4 mr-2" />
              Call Customer
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              Create Payment Plan
            </Button>
            <Button variant="outline">
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Original Amount</p>
                <p className="text-2xl font-bold">
                  {formatUnivenCurrency(customer["Original Amount"])}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Last Payment</p>
                <p className="text-2xl font-bold">
                  {formatUnivenCurrency(customer["Last Payment Amount"])}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatUnivenDate(customer["Last Payment Date"])}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Days Overdue</p>
                <p className="text-2xl font-bold">
                  {customer["Days Overdue"] || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Personal Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Number</span>
                  <span>{customer["ID Number"] || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type</span>
                  <span>{customer.account_type_description || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Property Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ward</span>
                  <span>{customer["Ward Description"] || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Value</span>
                  <span>{formatUnivenCurrency(customer["Market Value"]) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}