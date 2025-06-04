
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, platform_id } = await req.json()
    console.log('Fetching HackerOne data for user:', user_id, 'platform:', platform_id)

    // Get user credentials
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_platform_profiles')
      .select('username, api_credentials')
      .eq('user_id', user_id)
      .eq('platform_id', platform_id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      throw new Error(`Profile fetch failed: ${profileError.message}`)
    }

    if (!profile) {
      throw new Error('HackerOne profile not found')
    }

    const { username, api_credentials } = profile
    console.log('Found profile for username:', username)

    if (!api_credentials?.api_token) {
      throw new Error('API token not found in credentials')
    }

    const apiToken = api_credentials.api_token

    // Create Basic Auth header using the exact method from your example
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(username + ":" + apiToken));
    headers.set('Accept', 'application/json');

    console.log('Testing authentication with username:', username)

    // Test API connection first with the user profile endpoint
    console.log('Testing API connection...')
    const testResponse = await fetch(`https://api.hackerone.com/v1/hackers/${username}`, {
      method: 'GET',
      headers: headers
    })

    console.log('API response status:', testResponse.status)
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error('API test failed:', testResponse.status, testResponse.statusText, errorText)
      
      if (testResponse.status === 401) {
        throw new Error('Invalid HackerOne credentials. Please check your username and API token.')
      } else if (testResponse.status === 404) {
        throw new Error('HackerOne user profile not found. Please verify your username.')
      } else if (testResponse.status === 403) {
        throw new Error('Access forbidden. Please check your API token permissions.')
      } else {
        throw new Error(`HackerOne API error: ${testResponse.status} ${testResponse.statusText}`)
      }
    }

    const hackerData = await testResponse.json()
    console.log('Successfully fetched hacker profile')

    // Fetch balance data
    let balanceData = { data: { attributes: { balance: 0 } } }
    try {
      console.log('Fetching balance data...')
      const balanceResponse = await fetch('https://api.hackerone.com/v1/hackers/payments/balance', {
        method: 'GET',
        headers: headers
      })

      if (balanceResponse.ok) {
        balanceData = await balanceResponse.json()
        console.log('Successfully fetched balance data')
      } else {
        const balanceError = await balanceResponse.text()
        console.warn('Balance fetch failed:', balanceResponse.status, balanceError)
      }
    } catch (error) {
      console.warn('Balance fetch error:', error)
    }

    // Fetch reports data
    let reportsData = { data: [] }
    try {
      console.log('Fetching reports data...')
      const reportsResponse = await fetch(`https://api.hackerone.com/v1/hackers/${username}/reports`, {
        method: 'GET',
        headers: headers
      })

      if (reportsResponse.ok) {
        reportsData = await reportsResponse.json()
        console.log('Successfully fetched reports data')
      } else {
        const reportsError = await reportsResponse.text()
        console.warn('Reports fetch failed:', reportsResponse.status, reportsError)
      }
    } catch (error) {
      console.warn('Reports fetch error:', error)
    }

    // Process and structure the data according to HackerOne API response format
    const hackerAttributes = hackerData.data?.attributes || {}
    const balanceAttributes = balanceData.data?.attributes || {}
    const reports = reportsData.data || []

    console.log('Processing data for user:', hackerAttributes.username || username)

    // Calculate report statistics
    const resolvedReports = reports.filter((r: any) => r.attributes?.state === 'resolved')
    const duplicateReports = reports.filter((r: any) => r.attributes?.state === 'duplicate')
    const notApplicableReports = reports.filter((r: any) => r.attributes?.state === 'not-applicable')
    const totalBounties = reports
      .filter((r: any) => r.attributes?.bounty_awarded_at)
      .reduce((sum: number, r: any) => sum + (r.attributes?.bounty_amount || 0), 0)

    const structuredData = {
      user_info: {
        username: hackerAttributes.username || username,
        reputation: hackerAttributes.reputation || 0,
        signal: hackerAttributes.signal || 0,
        impact: hackerAttributes.impact || 0
      },
      bounties: {
        total_awarded: balanceAttributes.balance || totalBounties || 0,
        total_count: reports.filter((r: any) => r.attributes?.bounty_awarded_at).length || 0
      },
      reports: {
        total_count: reports.length || 0,
        resolved_count: resolvedReports.length || 0,
        duplicate_count: duplicateReports.length || 0,
        not_applicable_count: notApplicableReports.length || 0
      },
      programs: {
        invited_count: hackerAttributes.invited_programs_count || 0,
        participating_count: hackerAttributes.participating_programs_count || 0
      }
    }

    console.log('Returning structured data:', structuredData)

    return new Response(
      JSON.stringify(structuredData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('HackerOne API Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
