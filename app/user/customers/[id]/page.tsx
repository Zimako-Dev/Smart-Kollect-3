"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { getUnivenCustomerById, formatUnivenCurrency, formatUnivenDate, getUnivenCustomerFullName, getUnivenCustomerPrimaryPhone, getUnivenCustomerPrimaryEmail, getUnivenCustomerFullAddress, getUnivenCustomerRiskLevel, getUnivenCustomerOverdueStatus } from "@/lib/univen-customer-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  FileText,
  Clock,
  TrendingUp,
  Activity,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-bold mt-4">Loading customer details...</h2>
          <p className="text-muted-foreground mt-1">Please wait while we fetch the customer information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto text-center bg-background p-8 rounded-xl shadow-lg border border-border">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-destructive">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button 
            variant="default" 
            className="w-full max-w-xs mx-auto py-2"
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
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto text-center bg-background p-8 rounded-xl shadow-lg border border-border">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Customer Not Found</h2>
          <p className="text-muted-foreground mb-6">The customer you are looking for does not exist or has been removed.</p>
          <Button 
            variant="default" 
            className="w-full max-w-xs mx-auto py-2"
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

  // Get risk level color
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/user/customers')}
          className="flex items-center border-border py-2 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border py-2 px-4">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border-border w-48">
              <DropdownMenuLabel>Customer Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="py-2">
                <Phone className="h-4 w-4 mr-2" />
                Call Customer
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2">
                <DollarSign className="h-4 w-4 mr-2" />
                Create Payment Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="py-2">
                <Activity className="h-4 w-4 mr-2" />
                View Payment History
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="default" onClick={() => setEditMode(!editMode)} className="py-2 px-4">
            <Edit className="h-4 w-4 mr-2" />
            {editMode ? 'Cancel Edit' : 'Edit Customer'}
          </Button>
        </div>
      </div>

      {/* Customer Overview Card */}
      <Card className="mb-6 shadow-lg border border-border bg-background rounded-xl">
        <CardHeader className="pb-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl w-24 h-24 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {getUnivenCustomerFullName(customer)?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{getUnivenCustomerFullName(customer)}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="py-1 px-3 border-border">
                    {customer["Client Reference"] || 'N/A'}
                  </Badge>
                  <Badge 
                    variant={getRiskBadgeVariant(getUnivenCustomerRiskLevel(customer))}
                    className="py-1 px-3"
                  >
                    {getUnivenCustomerRiskLevel(customer)?.toUpperCase() || 'UNKNOWN'} RISK
                  </Badge>
                  {getUnivenCustomerOverdueStatus(customer) && (
                    <Badge variant="destructive" className="py-1 px-3">
                      OVERDUE
                    </Badge>
                  )}
                  <Badge variant="secondary" className="py-1 px-3">
                    {customer["Status"] || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-2xl border border-primary/20 min-w-[250px] shadow-md">
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-primary mb-1">
                {formatUnivenCurrency(customer["Current Balance"])}
              </p>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-500">+2.5% from last month</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <Separator className="bg-border/50" />
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="bg-background/50 p-4 rounded-2xl border border-border shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{getUnivenCustomerPrimaryPhone(customer) || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{getUnivenCustomerPrimaryEmail(customer) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Information */}
            <div className="bg-background/50 p-4 rounded-2xl border border-border shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-secondary" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-2 rounded-full mr-3">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-medium">#{customer["Client Reference"] || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-2 rounded-full mr-3">
                    <Calendar className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Opened</p>
                    <p className="font-medium">{formatUnivenDate(customer["Date Opened"]) || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-2 rounded-full mr-3">
                    <AlertTriangle className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{customer["Status"] || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div className="bg-background/50 p-4 rounded-2xl border border-border shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-tertiary" />
                Address
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-tertiary/10 p-2 rounded-full mr-3 mt-1">
                    <Building className="h-5 w-5 text-tertiary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Address</p>
                    <p className="font-medium">{getUnivenCustomerFullAddress(customer) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="flex-1 min-w-[180px] py-2 bg-primary hover:bg-primary/90">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-border p-2">
                  <p>Initiate a call to this customer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex-1 min-w-[180px] py-2 border-border">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-border p-2">
                  <p>Send an email to this customer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex-1 min-w-[180px] py-2 border-border">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Create Payment Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-border p-2">
                  <p>Set up a payment plan for this customer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex-1 min-w-[180px] py-2 border-border">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-border p-2">
                  <p>Add a note to this customer's file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-primary bg-background border-border rounded-xl shadow-md">
          <CardContent className="pt-4 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Original Amount</p>
                <p className="text-xl font-bold">
                  {formatUnivenCurrency(customer["Original Cost"])}
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-secondary bg-background border-border rounded-xl shadow-md">
          <CardContent className="pt-4 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Payment</p>
                <p className="text-xl font-bold">
                  {formatUnivenCurrency(customer["Last Payment Amount"])}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatUnivenDate(customer["Last Payment Date"])}
                </p>
              </div>
              <div className="bg-secondary/10 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-background border-border rounded-xl shadow-md">
          <CardContent className="pt-4 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Days Overdue</p>
                <p className="text-xl font-bold">
                  {customer["Days Overdue"] || 0}
                </p>
              </div>
              <div className="bg-yellow-500/10 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-tertiary bg-background border-border rounded-xl shadow-md">
          <CardContent className="pt-4 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payments To Date</p>
                <p className="text-xl font-bold">
                  {formatUnivenCurrency(customer["Payments To Date"])}
                </p>
              </div>
              <div className="bg-tertiary/10 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-tertiary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personal Details */}
        <Card className="bg-background border-border rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Personal Details
            </CardTitle>
            <CardDescription>Customer's personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">ID Number</span>
                <span className="font-medium">{customer["ID Number"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Gender</span>
                <span className="font-medium">{customer["Gender"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium">{customer["Title"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Occupation</span>
                <span className="font-medium">{customer["Occupation"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Employer</span>
                <span className="font-medium">{customer["Employer Name"] || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Details */}
        <Card className="bg-background border-border rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-secondary" />
              Account Details
            </CardTitle>
            <CardDescription>Additional account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Client Group</span>
                <span className="font-medium">{customer["Client Group"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Client Division</span>
                <span className="font-medium">{customer["Client Division"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Debtor Status</span>
                <span className="font-medium">{customer["Debtor under DC?"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Capital Amount</span>
                <span className="font-medium">{formatUnivenCurrency(customer["Capital Amount"]) || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Interest To Date</span>
                <span className="font-medium">{formatUnivenCurrency(customer["Interest To Date"]) || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card className="mb-6 bg-background border-border rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
            Risk Assessment
          </CardTitle>
          <CardDescription>Customer risk profile and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 shadow-sm">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Days Overdue</p>
                  <p className="text-lg font-bold">{customer["Days Overdue"] || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/10 shadow-sm">
              <div className="flex items-center">
                <div className="bg-secondary/10 p-2 rounded-full mr-3">
                  <DollarSign className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Balance</p>
                  <p className="text-lg font-bold">{formatUnivenCurrency(customer["Current Balance"])}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-destructive/5 p-4 rounded-xl border border-destructive/10 shadow-sm">
              <div className="flex items-center">
                <div className="bg-destructive/10 p-2 rounded-full mr-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <p className={`text-lg font-bold ${getRiskLevelColor(getUnivenCustomerRiskLevel(customer))}`}>
                    {getUnivenCustomerRiskLevel(customer)?.toUpperCase() || 'UNKNOWN'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}