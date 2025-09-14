-- Disable Row Level Security (RLS) on the univen_customers table
-- This will allow all users to access all data in the table
-- Use this script for testing purposes only

-- Disable RLS on the univen_customers table
ALTER TABLE public.univen_customers DISABLE ROW LEVEL SECURITY;

-- Verify that RLS is disabled
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'univen_customers';

-- Note: After running this script, all users will have access to all univen_customers data
-- For production use, consider re-enabling RLS with proper policies:
-- ALTER TABLE public.univen_customers ENABLE ROW LEVEL SECURITY;
