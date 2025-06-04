
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

    // Create Basic Auth header
    const authHeader = btoa(`${username}:${apiToken}`)
    console.log('Created auth header for username:', username)

    // Test API connection first with a simple request
    console.log('Testing API connection...')
    const testResponse = await fetch(`https://api.hackerone.com/v1/hackers/${username}`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    })

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error('API test failed:', testResponse.status, testResponse.statusText, errorText)
      
      if (testResponse.status === 401) {
        throw new Error('Invalid HackerOne credentials. Please check your username and API token.')
      } else if (testResponse.status === 404) {
        throw new Error('HackerOne profile not found. Please check your username.')
      } else {
        throw new Error(`HackerOne API error: ${testResponse.status} ${testResponse.statusText}`)
      }
    }

    const hackerData = await testResponse.json()
    console.log('Successfully fetched hacker profile')

    // Fetch balance data (optional - don't fail if this doesn't work)
    let balanceData = { data: { attributes: { balance: 0 } } }
    try {
      console.log('Fetching balance data...')
      const balanceResponse = await fetch('https://api.hackerone.com/v1/hackers/payments/balance', {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json'
        }
      })

      if (balanceResponse.ok) {
        balanceData = await balanceResponse.json()
        console.log('Successfully fetched balance data')
      } else {
        console.warn('Balance fetch failed:', balanceResponse.status)
      }
    } catch (error) {
      console.warn('Balance fetch error:', error)
    }

    // Fetch reports data (optional - don't fail if this doesn't work)
    let reportsData = { data: [] }
    try {
      console.log('Fetching reports data...')
      const reportsResponse = await fetch(`https://api.hackerone.com/v1/hackers/${username}/reports`, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json'
        }
      })

      if (reportsResponse.ok) {
        reportsData = await reportsResponse.json()
        console.log('Successfully fetched reports data')
      } else {
        console.warn('Reports fetch failed:', reportsResponse.status)
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

    const structuredData = {
      user_info: {
        username: hackerAttributes.username || username,
        reputation: hackerAttributes.reputation || 0,
        signal: hackerAttributes.signal || 0,
        impact: hackerAttributes.impact || 0
      },
      bounties: {
        total_awarded: balanceAttributes.balance || 0,
        total_count: resolvedReports.length || 0
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
