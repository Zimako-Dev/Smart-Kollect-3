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
    <div className="w-full max-w-8xl mx-auto py-8 px-6 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold">Univen Customers</h1>
          <p className="text-muted-foreground text-xl mt-2">
            Manage and track all Univen customer accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-lg text-muted-foreground">
            Showing {customers.length} of {totalCount} customers
          </div>
          <Button variant="outline" size="lg" onClick={refreshData} className="py-3 px-4">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg border border-border rounded-2xl">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <form onSubmit={handleSearch} className="flex flex-1 gap-3">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by client reference, name, ID, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-6 text-lg rounded-xl"
                />
              </div>
              <Button type="submit" disabled={loading} className="py-6 px-8 text-lg">
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span className="ml-2">Search</span>
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-3">
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="py-6 text-lg rounded-xl">
                    <Filter className="h-5 w-5 mr-3" />
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
              
              <Button variant="outline" onClick={exportCustomers} className="py-6 px-6 text-lg">
                <Download className="h-5 w-5 mr-3" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border border-border rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-blue-100 rounded-2xl">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg text-muted-foreground">Total Customers</p>
                <p className="text-3xl font-bold">{totalCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border border-border rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-green-100 rounded-2xl">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg text-muted-foreground">Total Balance</p>
                <p className="text-3xl font-bold">
                  {formatUnivenCurrency(
                    customers.reduce((sum, customer) => sum + (customer["Current Balance"] || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border border-border rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-yellow-100 rounded-2xl">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg text-muted-foreground">Overdue Accounts</p>
                <p className="text-3xl font-bold">
                  {customers.filter(c => (c["Days Overdue"] || 0) > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border border-border rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-purple-100 rounded-2xl">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-lg text-muted-foreground">Active Status</p>
                <p className="text-3xl font-bold">
                  {customers.filter(c => c["Status"] === "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="shadow-lg border border-border rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <CardTitle className="text-3xl">Customer List</CardTitle>
            <CardDescription className="text-lg mt-2">
              A list of all Univen customers and their account details
            </CardDescription>
          </div>
          <Tabs defaultValue="all" className="w-48">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="all" className="py-3 text-lg">All</TabsTrigger>
              <TabsTrigger value="active" className="py-3 text-lg">Active</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16">
              <User className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-6 text-2xl font-medium">No customers found</h3>
              <p className="mt-3 text-lg text-muted-foreground">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="w-16"></TableHead>
                    <TableHead 
                      className="cursor-pointer text-lg py-5"
                      onClick={() => handleSort("Client Reference")}
                    >
                      <div className="flex items-center gap-2">
                        Client Reference
                        {sortBy === "Client Reference" && (
                          <span className="text-xl">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-lg py-5"
                      onClick={() => handleSort("Client")}
                    >
                      <div className="flex items-center gap-2">
                        Customer Name
                        {sortBy === "Client" && (
                          <span className="text-xl">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-lg py-5">Contact</TableHead>
                    <TableHead 
                      className="cursor-pointer text-right text-lg py-5"
                      onClick={() => handleSort("Current Balance")}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Current Balance
                        {sortBy === "Current Balance" && (
                          <span className="text-xl">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right text-lg py-5"
                      onClick={() => handleSort("Days Overdue")}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Days Overdue
                        {sortBy === "Days Overdue" && (
                          <span className="text-xl">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-lg py-5">Status</TableHead>
                    <TableHead className="text-lg py-5">Risk Level</TableHead>
                    <TableHead 
                      className="cursor-pointer text-lg py-5"
                      onClick={() => handleSort("Date Opened")}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Date Opened
                        {sortBy === "Date Opened" && (
                          <span className="text-xl">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right text-lg py-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-lg py-5">
                        {customer["Client Reference"] || "N/A"}
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="font-medium text-lg">
                          {getUnivenCustomerFullName(customer)}
                        </div>
                        <div className="text-muted-foreground text-base">
                          {customer["Client Group"] || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-base">
                                    {getUnivenCustomerPrimaryPhone(customer)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-base">
                                <p>Primary Phone</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 mt-1">
                                  <Mail className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-base">
                                    {getUnivenCustomerPrimaryEmail(customer)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-base">
                                <p>Primary Email</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-lg py-5">
                        {formatUnivenCurrency(customer["Current Balance"])}
                      </TableCell>
                      <TableCell className="text-right text-lg py-5">
                        {customer["Days Overdue"] || "0"}
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge variant={getStatusVariant(customer["Status"] || null)} className="text-lg py-2 px-4">
                          {customer["Status"] || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5">
                        {getRiskLevelBadge(
                          customer["Days Overdue"], 
                          customer["Current Balance"]
                        )}
                      </TableCell>
                      <TableCell className="text-lg py-5">
                        {formatUnivenDate(customer["Date Opened"])}
                      </TableCell>
                      <TableCell className="text-right py-5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 w-10 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-lg">Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => viewCustomer(customer.id)}
                              className="py-3 text-lg"
                            >
                              <Eye className="mr-3 h-5 w-5" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="py-3 text-lg">
                              <CreditCard className="mr-3 h-5 w-5" />
                              Process Payment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleCustomerAction("edit", customer)}
                              className="py-3 text-lg"
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive py-3 text-lg"
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
                  <div className="text-lg text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalCount)} of {totalCount} customers
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-lg py-3 px-4"}
                        />
                      </PaginationItem>
                      
                      {/* Show first page */}
                      {currentPage > 2 && (
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => handlePageChange(1)}
                            className="text-lg py-3 px-4"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Show ellipsis if needed */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <span className="px-4 py-3 text-muted-foreground text-lg">...</span>
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
                                className="text-lg py-3 px-4"
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
                          <span className="px-4 py-3 text-muted-foreground text-lg">...</span>
                        </PaginationItem>
                      )}
                      
                      {/* Show last page */}
                      {totalPages > 1 && currentPage < totalPages - 1 && (
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => handlePageChange(totalPages)}
                            className="text-lg py-3 px-4"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-lg py-3 px-4"}
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
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              This action cannot be undone. This will permanently delete the customer record
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="py-6 text-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90 py-6 text-lg"
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