
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

    // Fetch user data from HackerOne API
    const userResponse = await fetch(`https://api.hackerone.com/v1/users/${username}`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data from HackerOne')
    }

    const userData = await userResponse.json()

    // Fetch reports data
    const reportsResponse = await fetch(`https://api.hackerone.com/v1/reports?filter[reporter][]=${username}`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    })

    const reportsData = reportsResponse.ok ? await reportsResponse.json() : { data: [] }

    // Process and structure the data
    const structuredData = {
      user_info: {
        username: userData.data?.attributes?.username || username,
        reputation: userData.data?.attributes?.reputation || 0,
        signal: userData.data?.attributes?.signal || 0,
        impact: userData.data?.attributes?.impact || 0
      },
      bounties: {
        total_awarded: userData.data?.attributes?.total_bounty_amount || 0,
        total_count: userData.data?.attributes?.bounty_count || 0
      },
      reports: {
        total_count: reportsData.data?.length || 0,
        resolved_count: reportsData.data?.filter((r: any) => r.attributes?.state === 'resolved').length || 0,
        duplicate_count: reportsData.data?.filter((r: any) => r.attributes?.state === 'duplicate').length || 0,
        not_applicable_count: reportsData.data?.filter((r: any) => r.attributes?.state === 'not-applicable').length || 0
      },
      programs: {
        invited_count: userData.data?.attributes?.invited_bug_bounty_program_count || 0,
        participating_count: userData.data?.attributes?.participating_bug_bounty_program_count || 0
      }
    }

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
