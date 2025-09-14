// Test script to verify Univen customers data fetching
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local if it exists
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 [Test] Environment variables check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓ Set' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Test] Missing required environment variables');
  process.exit(1);
}

// Test with anon key first
console.log('\n🔍 [Test] Testing with anon key...');
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testUnivenFetch() {
  try {
    // Test 1: Try to get current user
    console.log('\n1. Testing auth.getUser()...');
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser();
    console.log('User:', user?.id || 'No user');
    if (userError) {
      console.error('User error:', userError);
    }

    // Test 2: Try to count univen_customers
    console.log('\n2. Testing univen_customers count...');
    const { count, error: countError } = await supabaseAnon
      .from('univen_customers')
      .select('*', { count: 'exact', head: true });
    
    console.log('Count:', count);
    if (countError) {
      console.error('Count error:', countError);
      console.error('Count error details:', JSON.stringify(countError, null, 2));
    }

    // Test 3: Try to fetch univen_customers data
    console.log('\n3. Testing univen_customers data fetch...');
    const { data, error } = await supabaseAnon
      .from('univen_customers')
      .select('*')
      .limit(5);
    
    console.log('Data length:', data?.length || 0);
    if (error) {
      console.error('Fetch error:', error);
      console.error('Fetch error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✓ Successfully fetched data!');
      if (data && data.length > 0) {
        console.log('Sample record:', {
          id: data[0].id,
          'Client Reference': data[0]['Client Reference'],
          'First Name': data[0]['First Name'],
          Surname: data[0].Surname
        });
      }
    }

    // Test 4: If we have a user, try to get their profile
    if (user) {
      console.log('\n4. Testing user profile fetch...');
      const { data: profile, error: profileError } = await supabaseAnon
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();
      
      console.log('Profile:', profile);
      if (profileError) {
        console.error('Profile error:', profileError);
      }
    }

    // Test 5: Try with service role key if available
    if (supabaseServiceKey) {
      console.log('\n5. Testing with service role key...');
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: serviceData, error: serviceError } = await supabaseService
        .from('univen_customers')
        .select('*')
        .limit(5);
      
      console.log('Service role data length:', serviceData?.length || 0);
      if (serviceError) {
        console.error('Service role error:', serviceError);
      } else {
        console.log('✓ Service role fetch successful!');
      }
    }

  } catch (error) {
    console.error('❌ [Test] Unexpected error:', error);
  }
}

testUnivenFetch().then(() => {
  console.log('\n🔍 [Test] Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ [Test] Test failed:', error);
  process.exit(1);
});
