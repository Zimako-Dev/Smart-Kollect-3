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
      <div className="container mx-auto py-12 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-3xl font-bold mt-6">Loading customer details...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we fetch the customer information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto text-center bg-background p-12 rounded-2xl shadow-xl border border-border">
          <div className="w-24 h-24 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-destructive">Error</h2>
          <p className="text-muted-foreground text-lg mb-8">{error}</p>
          <Button 
            variant="default" 
            className="w-full max-w-xs mx-auto py-6 text-lg"
            onClick={() => router.push('/user/customers')}
          >
            <ArrowLeft className="mr-3 h-5 w-5" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto text-center bg-background p-12 rounded-2xl shadow-xl border border-border">
          <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Customer Not Found</h2>
          <p className="text-muted-foreground text-lg mb-8">The customer you are looking for does not exist or has been removed.</p>
          <Button 
            variant="default" 
            className="w-full max-w-xs mx-auto py-6 text-lg"
            onClick={() => router.push('/user/customers')}
          >
            <ArrowLeft className="mr-3 h-5 w-5" />
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
    <div className="w-full max-w-8xl mx-auto py-10 px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <Button 
          variant="outline" 
          onClick={() => router.push('/user/customers')}
          className="flex items-center border-border text-xl py-4 px-7"
        >
          <ArrowLeft className="h-7 w-7 mr-4" />
          Back to Customers
        </Button>
        
        <div className="flex flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border py-4 px-7 text-xl">
                <MoreHorizontal className="h-6 w-6 mr-3" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border-border w-64">
              <DropdownMenuLabel className="text-lg">Customer Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="py-3 text-lg">
                <Phone className="h-5 w-5 mr-3" />
                Call Customer
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 text-lg">
                <Mail className="h-5 w-5 mr-3" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 text-lg">
                <DollarSign className="h-5 w-5 mr-3" />
                Create Payment Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="py-3 text-lg">
                <Activity className="h-5 w-5 mr-3" />
                View Payment History
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 text-lg">
                <FileText className="h-5 w-5 mr-3" />
                Generate Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="default" onClick={() => setEditMode(!editMode)} className="py-4 px-7 text-xl">
            <Edit className="h-6 w-6 mr-3" />
            {editMode ? 'Cancel Edit' : 'Edit Customer'}
          </Button>
        </div>
      </div>

      {/* Customer Overview Card */}
      <Card className="mb-8 shadow-xl border border-border bg-background rounded-2xl">
        <CardHeader className="pb-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl w-36 h-36 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                {getUnivenCustomerFullName(customer)?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-4">{getUnivenCustomerFullName(customer)}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="outline" className="text-xl py-3 px-5 border-border text-lg">
                    {customer["Client Reference"] || 'N/A'}
                  </Badge>
                  <Badge 
                    variant={getRiskBadgeVariant(getUnivenCustomerRiskLevel(customer))}
                    className="text-xl py-3 px-5 text-lg"
                  >
                    {getUnivenCustomerRiskLevel(customer)?.toUpperCase() || 'UNKNOWN'} RISK
                  </Badge>
                  {getUnivenCustomerOverdueStatus(customer) && (
                    <Badge variant="destructive" className="text-xl py-3 px-5 text-lg">
                      OVERDUE
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xl py-3 px-5 text-lg">
                    {customer["Status"] || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-3xl border border-primary/20 min-w-[350px] shadow-lg">
              <p className="text-xl text-muted-foreground mb-3">Current Balance</p>
              <p className="text-5xl font-bold text-primary mb-3">
                {formatUnivenCurrency(customer["Current Balance"])}
              </p>
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
                <span className="text-lg text-green-500">+2.5% from last month</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <Separator className="bg-border/50" />
        
        <CardContent className="pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Information */}
            <div className="bg-background/50 p-8 rounded-3xl border border-border shadow-lg">
              <h3 className="text-3xl font-semibold mb-8 flex items-center">
                <User className="h-8 w-8 mr-4 text-primary" />
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-4 rounded-full mr-5">
                    <Phone className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground">Phone</p>
                    <p className="text-xl font-medium">{getUnivenCustomerPrimaryPhone(customer) || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-primary/10 p-4 rounded-full mr-5">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground">Email</p>
                    <p className="text-xl font-medium">{getUnivenCustomerPrimaryEmail(customer) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Information */}
            <div className="bg-background/50 p-8 rounded-3xl border border-border shadow-lg">
              <h3 className="text-3xl font-semibold mb-8 flex items-center">
                <CreditCard className="h-8 w-8 mr-4 text-secondary" />
                Account Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-4 rounded-full mr-5">
                    <FileText className="h-7 w-7 text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground">Account Number</p>
                    <p className="text-xl font-medium">#{customer["Client Reference"] || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-4 rounded-full mr-5">
                    <Calendar className="h-7 w-7 text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground">Date Opened</p>
                    <p className="text-xl font-medium">{formatUnivenDate(customer["Date Opened"]) || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-4 rounded-full mr-5">
                    <AlertTriangle className="h-7 w-7 text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground">Status</p>
                    <p className="text-xl font-medium">{customer["Status"] || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div className="bg-background/50 p-8 rounded-3xl border border-border shadow-lg">
              <h3 className="text-3xl font-semibold mb-8 flex items-center">
                <MapPin className="h-8 w-8 mr-4 text-tertiary" />
                Address
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-tertiary/10 p-4 rounded-full mr-5 mt-1">
                    <Building className="h-7 w-7 text-tertiary" />
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground">Full Address</p>
                    <p className="text-xl font-medium">{getUnivenCustomerFullAddress(customer) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-6 mt-12">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="flex-1 min-w-[250px] py-7 text-xl bg-primary hover:bg-primary/90">
                    <Phone className="h-6 w-6 mr-4" />
                    Call Customer
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-border text-xl p-4">
                  <p>Initiate a call to this customer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex-1 min-w-[250px] py-7 text-xl border-border">
                    <Mail className="h-6 w-6 mr-4" />
                    Send Email
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-border text-xl p-4">
                  <p>Send an email to this customer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex-1 min-w-[250px] py-7 text-xl border-border">
                    <DollarSign className="h-6 w-6 mr-4" />
                    Create Payment Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-border text-xl p-4">
                  <p>Set up a payment plan for this customer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex-1 min-w-[250px] py-7 text-xl border-border">
                    <FileText className="h-6 w-6 mr-4" />
                    Add Note
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-border text-xl p-4">
                  <p>Add a note to this customer's file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <Card className="border-l-4 border-l-primary bg-background border-border rounded-2xl shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg text-muted-foreground mb-3">Original Amount</p>
                <p className="text-4xl font-bold">
                  {formatUnivenCurrency(customer["Original Cost"])}
                </p>
              </div>
              <div className="bg-primary/10 p-4 rounded-full">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-secondary bg-background border-border rounded-2xl shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg text-muted-foreground mb-3">Last Payment</p>
                <p className="text-4xl font-bold">
                  {formatUnivenCurrency(customer["Last Payment Amount"])}
                </p>
                <p className="text-base text-muted-foreground mt-3">
                  {formatUnivenDate(customer["Last Payment Date"])}
                </p>
              </div>
              <div className="bg-secondary/10 p-4 rounded-full">
                <Calendar className="h-8 w-8 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-background border-border rounded-2xl shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg text-muted-foreground mb-3">Days Overdue</p>
                <p className="text-4xl font-bold">
                  {customer["Days Overdue"] || 0}
                </p>
              </div>
              <div className="bg-yellow-500/10 p-4 rounded-full">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-tertiary bg-background border-border rounded-2xl shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg text-muted-foreground mb-3">Payments To Date</p>
                <p className="text-4xl font-bold">
                  {formatUnivenCurrency(customer["Payments To Date"])}
                </p>
              </div>
              <div className="bg-tertiary/10 p-4 rounded-full">
                <TrendingUp className="h-8 w-8 text-tertiary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Personal Details */}
        <Card className="bg-background border-border rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-3xl">
              <User className="h-8 w-8 mr-4 text-primary" />
              Personal Details
            </CardTitle>
            <CardDescription className="text-lg">Customer's personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-5 border-b border-border">
                <span className="text-muted-foreground text-xl">ID Number</span>
                <span className="font-medium text-xl">{customer["ID Number"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-border">
                <span className="text-muted-foreground text-xl">Gender</span>
                <span className="font-medium text-xl">{customer["Gender"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-border">
                <span className="text-muted-foreground text-xl">Title</span>
                <span className="font-medium text-xl">{customer["Title"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-border">
                <span className="text-muted-foreground text-xl">Occupation</span>
                <span className="font-medium text-xl">{customer["Occupation"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xl">Employer</span>
                <span className="font-medium text-xl">{customer["Employer Name"] || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Details */}
        <Card className="bg-background border-border rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-3xl">
              <FileText className="h-8 w-8 mr-4 text-secondary" />
              Account Details
            </CardTitle>
            <CardDescription className="text-lg">Additional account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-5 border-b border-border">
                <span className="text-muted-foreground text-xl">Client Group</span>
                <span className="font-medium text-xl">{customer["Client Group"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-border">
                <span className="text-muted-foreground text-xl">Client Division</span>
                <span className="font-medium text-xl">{customer["Client Division"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-border">
                <span className="text-muted-foreground text-xl">Debtor Status</span>
                <span className="font-medium text-xl">{customer["Debtor under DC?"] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-border">
                <span className="text-muted-foreground text-xl">Capital Amount</span>
                <span className="font-medium text-xl">{formatUnivenCurrency(customer["Capital Amount"]) || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xl">Interest To Date</span>
                <span className="font-medium text-xl">{formatUnivenCurrency(customer["Interest To Date"]) || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card className="mb-10 bg-background border-border rounded-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl">
            <AlertTriangle className="h-8 w-8 mr-4 text-destructive" />
            Risk Assessment
          </CardTitle>
          <CardDescription className="text-lg">Customer risk profile and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary/5 p-7 rounded-2xl border border-primary/10 shadow-md">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-base text-muted-foreground">Days Overdue</p>
                  <p className="text-2xl font-bold">{customer["Days Overdue"] || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary/5 p-7 rounded-2xl border border-secondary/10 shadow-md">
              <div className="flex items-center">
                <div className="bg-secondary/10 p-3 rounded-full mr-4">
                  <DollarSign className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-base text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">{formatUnivenCurrency(customer["Current Balance"])}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-destructive/5 p-7 rounded-2xl border border-destructive/10 shadow-md">
              <div className="flex items-center">
                <div className="bg-destructive/10 p-3 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-base text-muted-foreground">Risk Level</p>
                  <p className={`text-2xl font-bold ${getRiskLevelColor(getUnivenCustomerRiskLevel(customer))}`}>
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
