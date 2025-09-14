"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Input
} from '@/components/ui/input';
import { 
  Button
} from '@/components/ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Badge
} from '@/components/ui/badge';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  Skeleton
} from '@/components/ui/skeleton';
import { 
  Calendar,
  Search, 
  Phone, 
  Mail, 
  MoreHorizontal, 
  Filter,
  Download,
  Eye,
  CreditCard,
  User,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { 
  getAllUnivenCustomers, 
  searchUnivenCustomers,
  getUnivenCustomerFullName,
  getUnivenCustomerPrimaryPhone,
  getUnivenCustomerPrimaryEmail,
  formatUnivenCurrency,
  formatUnivenDate
} from '@/lib/univen-customer-service';
import type { UnivenCustomer } from '@/lib/univen-customer-service';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<UnivenCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<UnivenCustomer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const pageSize = 20;

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let result;
      if (searchTerm) {
        result = await searchUnivenCustomers(searchTerm, currentPage, pageSize);
      } else {
        result = await getAllUnivenCustomers(currentPage, pageSize, sortBy, sortOrder);
      }
      
      if (result.error) {
        console.error("Error fetching customers:", result.error);
        setCustomers([]);
        setTotalCount(0);
        setTotalPages(1);
      } else {
        setCustomers(result.customers);
        setTotalCount(result.totalCount);
        setTotalPages(Math.ceil(result.totalCount / pageSize));
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // View customer details
  const viewCustomer = (customerId: string) => {
    router.push(`/user/customers/${customerId}`);
  };

  // Handle customer action
  const handleCustomerAction = (action: string, customer: UnivenCustomer) => {
    switch (action) {
      case "view":
        viewCustomer(customer.id);
        break;
      case "edit":
        // Implement edit functionality
        break;
      case "delete":
        setSelectedCustomer(customer);
        setIsDeleteDialogOpen(true);
        break;
      default:
        break;
    }
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedCustomer) {
      // Implement delete functionality
      console.log("Deleting customer:", selectedCustomer.id);
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  // Export customers
  const exportCustomers = () => {
    // Implement export functionality
    console.log("Exporting customers");
  };

  // Refresh data
  const refreshData = () => {
    fetchCustomers();
  };

  // Fetch customers on page load and when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    if (searchTerm === "") {
      setCurrentPage(1);
      fetchCustomers();
    }
  }, [searchTerm]);

  // Get status badge variant
  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case "Active":
        return "default";
      case "Closed":
        return "destructive";
      case "Pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Get risk level badge
  const getRiskLevelBadge = (daysOverdue: number | null, balance: number | null) => {
    const overdue = daysOverdue || 0;
    const bal = balance || 0;
    
    if (overdue > 90 || bal > 10000) {
      return <Badge variant="destructive">High Risk</Badge>;
    } else if (overdue > 30 || bal > 5000) {
      return <Badge variant="secondary">Medium Risk</Badge>;
    } else {
      return <Badge variant="default">Low Risk</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Univen Customers</h1>
          <p className="text-muted-foreground">
            Manage and track all Univen customer accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {customers.length} of {totalCount} customers
          </div>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by client reference, name, ID, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="sr-only">Search</span>
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-2">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" onClick={exportCustomers}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">
                  {formatUnivenCurrency(
                    customers.reduce((sum, customer) => sum + (customer["Current Balance"] || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Accounts</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => (c["Days Overdue"] || 0) > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Status</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c["Status"] === "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              A list of all Univen customers and their account details
            </CardDescription>
          </div>
          <Tabs defaultValue="all" className="w-40">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No customers found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("Client Reference")}
                    >
                      <div className="flex items-center gap-1">
                        Client Reference
                        {sortBy === "Client Reference" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("Client")}
                    >
                      <div className="flex items-center gap-1">
                        Customer Name
                        {sortBy === "Client" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("Current Balance")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Current Balance
                        {sortBy === "Current Balance" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("Days Overdue")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Days Overdue
                        {sortBy === "Days Overdue" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("Date Opened")}
                    >
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {sortBy === "Date Opened" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer["Client Reference"] || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {getUnivenCustomerFullName(customer)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer["Client Group"] || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {getUnivenCustomerPrimaryPhone(customer)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Primary Phone</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {getUnivenCustomerPrimaryEmail(customer)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Primary Email</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatUnivenCurrency(customer["Current Balance"])}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer["Days Overdue"] || "0"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(customer["Status"] || null)}>
                          {customer["Status"] || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getRiskLevelBadge(
                          customer["Days Overdue"], 
                          customer["Current Balance"]
                        )}
                      </TableCell>
                      <TableCell>
                        {formatUnivenDate(customer["Date Opened"])}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => viewCustomer(customer.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Process Payment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleCustomerAction("edit", customer)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleCustomerAction("delete", customer)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalCount)} of {totalCount} customers
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {/* Show first page */}
                      {currentPage > 2 && (
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => handlePageChange(1)}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Show ellipsis if needed */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <span className="px-3 py-1 text-muted-foreground">...</span>
                        </PaginationItem>
                      )}
                      
                      {/* Show pages around current page */}
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        const page = Math.max(1, currentPage - 1) + i;
                        if (page <= totalPages) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink 
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      {/* Show ellipsis if needed */}
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <span className="px-3 py-1 text-muted-foreground">...</span>
                        </PaginationItem>
                      )}
                      
                      {/* Show last page */}
                      {totalPages > 1 && currentPage < totalPages - 1 && (
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer record
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}