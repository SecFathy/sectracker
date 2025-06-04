
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

    // Get user credentials
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_platform_profiles')
      .select('username, api_credentials')
      .eq('user_id', user_id)
      .eq('platform_id', platform_id)
      .single()

    if (profileError || !profile) {
      throw new Error('HackerOne credentials not found')
    }

    const { username, api_credentials } = profile
    const apiToken = api_credentials?.api_token

    if (!apiToken) {
      throw new Error('API token not found')
    }

    // Create Basic Auth header
    const authHeader = btoa(`${username}:${apiToken}`)

    console.log('Fetching HackerOne data for user:', username)

    // Fetch hacker profile data
    const hackerResponse = await fetch(`https://api.hackerone.com/v1/hackers/${username}`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    })

    if (!hackerResponse.ok) {
      console.error('Failed to fetch hacker profile:', hackerResponse.status, hackerResponse.statusText)
      throw new Error(`Failed to fetch hacker profile: ${hackerResponse.status}`)
    }

    const hackerData = await hackerResponse.json()
    console.log('Hacker data received:', hackerData)

    // Fetch balance data
    const balanceResponse = await fetch('https://api.hackerone.com/v1/hackers/payments/balance', {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    })

    let balanceData = { data: { attributes: { balance: 0 } } }
    if (balanceResponse.ok) {
      balanceData = await balanceResponse.json()
      console.log('Balance data received:', balanceData)
    } else {
      console.warn('Failed to fetch balance data:', balanceResponse.status)
    }

    // Fetch reports data
    const reportsResponse = await fetch(`https://api.hackerone.com/v1/hackers/${username}/reports`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    })

    let reportsData = { data: [] }
    if (reportsResponse.ok) {
      reportsData = await reportsResponse.json()
      console.log('Reports data received:', reportsData)
    } else {
      console.warn('Failed to fetch reports data:', reportsResponse.status)
    }

    // Process and structure the data according to HackerOne API response format
    const hackerAttributes = hackerData.data?.attributes || {}
    const balanceAttributes = balanceData.data?.attributes || {}
    const reports = reportsData.data || []

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

    console.log('Structured data:', structuredData)

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
