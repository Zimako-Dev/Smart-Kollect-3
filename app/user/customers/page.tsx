"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
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
import { Badge } from '@/components/ui/badge';
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
import { Search, Phone, Mail } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 20;

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      if (searchTerm) {
        result = await searchUnivenCustomers(searchTerm, currentPage, pageSize);
      } else {
        result = await getAllUnivenCustomers(currentPage, pageSize);
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
  }, [searchTerm, currentPage, pageSize]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
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

  // Fetch customers on page load and when search/page changes
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (searchTerm === "") {
      setCurrentPage(1);
      // fetchCustomers will be called automatically due to dependency change
    }
  }, [searchTerm]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Univen Customers</h1>
        <div className="text-sm text-muted-foreground">
          Showing {customers.length} of {totalCount} customers
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by client reference, name, ID, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No customers found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Reference</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Opened</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer["Client Reference"] || "N/A"}
                      </TableCell>
                      <TableCell>
                        {getUnivenCustomerFullName(customer)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {getUnivenCustomerPrimaryPhone(customer)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {getUnivenCustomerPrimaryEmail(customer)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatUnivenCurrency(customer["Current Balance"])}
                      </TableCell>
                      <TableCell>
                        {customer["Days Overdue"] || "0"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          customer["Status"] === "Active" 
                            ? "bg-green-100 text-green-800" 
                            : customer["Status"] === "Closed" 
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {customer["Status"] || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatUnivenDate(customer["Date Opened"])}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewCustomer(customer.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
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
                      <PaginationItem>
                        <PaginationLink 
                          onClick={() => handlePageChange(1)}
                          isActive={currentPage === 1}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      
                      {/* Show ellipsis if needed */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <span className="px-3 py-1 text-muted-foreground">...</span>
                        </PaginationItem>
                      )}
                      
                      {/* Show pages around current page */}
                      {Array.from({ length: Math.min(3, totalPages - 2) }, (_, i) => {
                        const page = currentPage - 1 + i;
                        if (page > 1 && page < totalPages) {
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
                      {totalPages > 1 && (
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => handlePageChange(totalPages)}
                            isActive={currentPage === totalPages}
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
    </div>
  );
}