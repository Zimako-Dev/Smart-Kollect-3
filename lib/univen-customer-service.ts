// Univen customer service utilities for univen_customers table
import { supabase } from './supabase/client';

export interface UnivenCustomer {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  tenant_id: string | null;
  "Client Reference": string | null;
  "Interest rate": number | null;
  "Interest date": string | null;
  "In Duplum": string | null;
  "Masked Client Reference": string | null;
  "Client": string | null;
  "Client Group": string | null;
  "Status": string | null;
  "Status Date": string | null;
  "Debtor under DC?": string | null;
  "Debtor Status Date": string | null;
  "Days Overdue": number | null;
  "Client Division": string | null;
  "Old Client Ref": string | null;
  "Client Profile Account": string | null;
  "EasyPay Reference": string | null;
  "Original Cost": number | null;
  "Capital on Default": number | null;
  "Date Opened": string | null;
  "Hand Over Date": string | null;
  "Hand Over Amount": number | null;
  "Payments To Date": number | null;
  "Interest To Date": number | null;
  "Adjustments To Date": number | null;
  "Fees & Expenses": number | null;
  "Collection Commission": number | null;
  "FCC (excl VAT)": number | null;
  "Current Balance": number | null;
  "Capital Amount": number | null;
  "Last Payment Method": string | null;
  "Days since Last Payment": number | null;
  "Last Payment Date": string | null;
  "Last Payment Amount": number | null;
  "Outbound Phone Call Outcome": string | null;
  "Outbound Phone Call Comment": string | null;
  "Last Inbound Phone Call Date": string | null;
  "Inbound Phone Call Outcome": string | null;
  "Cellphone": string | null;
  "Cellphone 2": string | null;
  "Cellphone 3": string | null;
  "Cellphone 4": string | null;
  "Email": string | null;
  "Email 2": string | null;
  "Email 3": string | null;
  "Street Address 1": string | null;
  "Street Address 2": string | null;
  "Street Address 3": string | null;
  "Street Address 4": string | null;
  "Street Code": string | null;
  "Combined Street": string | null;
  "Gender": string | null;
  "Occupation": string | null;
  "Employer Name": string | null;
  "Employer Contact": string | null;
  "Last Contact": string | null;
  "ID Number": string | null;
  "Title": string | null;
  "Initials": string | null;
  "First Name": string | null;
  "Second Name": string | null;
  "Surname": string | null;
  "Account Load Date": string | null;
  "Debtor Flags": string | null;
  "Account Flags": string | null;
  "Linked Account": string | null;
  "Bucket": string | null;
  "Campaign Exclusions": string | null;
  "Original Line": string | null;
  "error": string | null;
  "source_file": string | null;
  "import_batch_id": string | null;
  "notes": string | null;
}

/**
 * Get a Univen customer by ID
 * @param customerId Customer ID
 * @returns Promise with Univen customer data
 */
export async function getUnivenCustomerById(customerId: string): Promise<UnivenCustomer | null> {
  try {
    const { data, error } = await supabase
      .from('univen_customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) {
      console.error('Error fetching Univen customer:', error);
      return null;
    }

    return data as UnivenCustomer;
  } catch (error) {
    console.error('Exception fetching Univen customer:', error);
    return null;
  }
}

/**
 * Fetch all Univen customers from the database with pagination
 * @param page Page number (1-based)
 * @param pageSize Number of records per page
 * @param sortBy Field to sort by
 * @param sortOrder Sort order ('asc' or 'desc')
 */
export async function getAllUnivenCustomers(
  page: number = 1, 
  pageSize: number = 100,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{ customers: UnivenCustomer[], totalCount: number, error: string | null }> {
  try {
    // Calculate the range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // First get the total count
    const { count, error: countError } = await supabase
      .from('univen_customers')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting univen_customers:', countError);
      return { customers: [], totalCount: 0, error: countError.message };
    }
    
    // Then get the paginated data
    const { data, error } = await supabase
      .from('univen_customers')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Error fetching univen_customers:', error);
      return { customers: [], totalCount: 0, error: error.message };
    }

    return { 
      customers: (data as UnivenCustomer[]) || [], 
      totalCount: count || 0, 
      error: null 
    };
  } catch (error) {
    console.error('Exception fetching univen_customers:', error);
    return { customers: [], totalCount: 0, error: 'An unexpected error occurred' };
  }
}

/**
 * Search Univen customers by various criteria with pagination
 * @param searchTerm Term to search for
 * @param page Page number (1-based)
 * @param pageSize Number of records per page
 */
export async function searchUnivenCustomers(
  searchTerm: string,
  page: number = 1,
  pageSize: number = 100
): Promise<{ customers: UnivenCustomer[], totalCount: number, error: string | null }> {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Search in multiple columns
    const { data, error, count } = await supabase
      .from('univen_customers')
      .select('*', { count: 'exact' })
      .or(`"Client Reference".ilike.%${searchTerm}%,First Name.ilike.%${searchTerm}%,Surname.ilike.%${searchTerm}%,"ID Number".ilike.%${searchTerm}%,Cellphone.ilike.%${searchTerm}%,Email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error searching univen_customers:', error);
      return { customers: [], totalCount: 0, error: error.message };
    }

    return { 
      customers: (data as UnivenCustomer[]) || [], 
      totalCount: count || 0, 
      error: null 
    };
  } catch (error) {
    console.error('Exception searching univen_customers:', error);
    return { customers: [], totalCount: 0, error: 'An unexpected error occurred' };
  }
}

/**
 * Update a Univen customer
 * @param customerId Customer ID
 * @param updates Object containing fields to update
 * @returns Promise with updated customer data
 */
export async function updateUnivenCustomer(
  customerId: string, 
  updates: Partial<UnivenCustomer>
): Promise<{ customer: UnivenCustomer | null, error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('univen_customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating Univen customer:', error);
      return { customer: null, error: error.message };
    }

    return { customer: data as UnivenCustomer, error: null };
  } catch (error) {
    console.error('Exception updating Univen customer:', error);
    return { customer: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Format currency for display
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export function formatUnivenCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'R0.00';
  }
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date for display
 * @param date Date string to format
 * @returns Formatted date string
 */
export function formatUnivenDate(date: string | null | undefined): string {
  if (!date) {
    return 'N/A';
  }
  
  try {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Get customer full name
 * @param customer Univen customer object
 * @returns Full name string
 */
export function getUnivenCustomerFullName(customer: UnivenCustomer | null): string {
  if (!customer) return 'N/A';
  
  const parts = [
    customer["First Name"],
    customer["Second Name"],
    customer["Surname"]
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(' ') : 'N/A';
}

/**
 * Get primary phone number
 * @param customer Univen customer object
 * @returns Primary phone number
 */
export function getUnivenCustomerPrimaryPhone(customer: UnivenCustomer | null): string {
  if (!customer) return 'N/A';
  
  return customer["Cellphone"] || 
         customer["Cellphone 2"] || 
         customer["Cellphone 3"] || 
         customer["Cellphone 4"] || 
         'N/A';
}

/**
 * Get primary email
 * @param customer Univen customer object
 * @returns Primary email
 */
export function getUnivenCustomerPrimaryEmail(customer: UnivenCustomer | null): string {
  if (!customer) return 'N/A';
  
  return customer["Email"] || 
         customer["Email 2"] || 
         customer["Email 3"] || 
         'N/A';
}

/**
 * Get full address
 * @param customer Univen customer object
 * @returns Full address string
 */
export function getUnivenCustomerFullAddress(customer: UnivenCustomer | null): string {
  if (!customer) return 'N/A';
  
  // Use Combined Street if available, otherwise combine individual address fields
  if (customer["Combined Street"]) {
    return customer["Combined Street"];
  }
  
  const parts = [
    customer["Street Address 1"],
    customer["Street Address 2"],
    customer["Street Address 3"],
    customer["Street Address 4"]
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : 'N/A';
}

/**
 * Determine risk level based on days overdue and current balance
 * @param customer Univen customer object
 * @returns Risk level
 */
export function getUnivenCustomerRiskLevel(customer: UnivenCustomer | null): 'low' | 'medium' | 'high' {
  if (!customer) return 'low';
  
  const daysOverdue = customer["Days Overdue"] || 0;
  const currentBalance = customer["Current Balance"] || 0;
  
  if (daysOverdue > 90 || currentBalance > 10000) {
    return 'high';
  } else if (daysOverdue > 30 || currentBalance > 5000) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Get overdue status for customer
 * @param customer Univen customer object
 * @returns Boolean indicating if customer is overdue
 */
export function getUnivenCustomerOverdueStatus(customer: UnivenCustomer | null): boolean {
  if (!customer) return false;
  
  const daysOverdue = customer["Days Overdue"] || 0;
  const currentBalance = customer["Current Balance"] || 0;
  
  // Consider overdue if days overdue > 0 and current balance > 0
  return daysOverdue > 0 && currentBalance > 0;
}
