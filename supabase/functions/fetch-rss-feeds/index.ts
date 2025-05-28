
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RSSItem {
  title: string;
  description?: string;
  link: string;
  pubDate?: string;
  guid?: string;
  author?: string;
}

interface RSSFeed {
  id: string;
  url: string;
  name: string;
}

function parseRSSFeed(xmlText: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  try {
    // Simple regex-based parsing since DOMParser isn't available in Deno
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const titleRegex = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i;
    const descRegex = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i;
    const linkRegex = /<link[^>]*>(.*?)<\/link>/i;
    const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/i;
    const guidRegex = /<guid[^>]*>(.*?)<\/guid>/i;
    const authorRegex = /<author[^>]*>(.*?)<\/author>|<dc:creator[^>]*><!\[CDATA\[(.*?)\]\]><\/dc:creator>|<dc:creator[^>]*>(.*?)<\/dc:creator>/i;

    let match;
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 10) { // Limit to 10 items per feed
      const itemContent = match[1];
      
      const titleMatch = titleRegex.exec(itemContent);
      const descMatch = descRegex.exec(itemContent);
      const linkMatch = linkRegex.exec(itemContent);
      const pubDateMatch = pubDateRegex.exec(itemContent);
      const guidMatch = guidRegex.exec(itemContent);
      const authorMatch = authorRegex.exec(itemContent);

      const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
      const description = (descMatch?.[1] || descMatch?.[2] || '').trim();
      const link = linkMatch?.[1]?.trim() || '';
      const pubDate = pubDateMatch?.[1]?.trim();
      const guid = guidMatch?.[1]?.trim();
      const author = (authorMatch?.[1] || authorMatch?.[2] || authorMatch?.[3] || '').trim();

      if (title && link) {
        items.push({
          title: title.replace(/<!\[CDATA\[|\]\]>/g, '').substring(0, 255), // Limit title length
          description: description.replace(/<!\[CDATA\[|\]\]>|<[^>]*>/g, '').substring(0, 500), // Strip HTML and limit
          link: link.substring(0, 500), // Limit URL length
          pubDate,
          guid: guid || link,
          author: author.substring(0, 100) // Limit author length
        });
      }
    }
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
  }
  
  return items;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching RSS feeds from database...');
    
    // Get only first 10 RSS feeds to avoid memory issues
    const { data: feeds, error: feedsError } = await supabaseClient
      .from('rss_feeds')
      .select('id, url, name')
      .limit(10);

    if (feedsError) {
      console.error('Error fetching feeds:', feedsError);
      throw feedsError;
    }

    console.log(`Found ${feeds?.length || 0} feeds to process`);

    let totalArticlesAdded = 0;
    const maxConcurrent = 3; // Process only 3 feeds at a time

    // Process feeds in smaller batches
    for (let i = 0; i < (feeds?.length || 0); i += maxConcurrent) {
      const batch = feeds?.slice(i, i + maxConcurrent) || [];
      
      await Promise.allSettled(batch.map(async (feed) => {
        try {
          console.log(`Fetching RSS feed: ${feed.name} (${feed.url})`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(feed.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; RSS-Fetcher/1.0)',
              'Accept': 'application/rss+xml, application/xml, text/xml',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error(`Failed to fetch ${feed.name}: ${response.status}`);
            return;
          }

          const xmlText = await response.text();
          
          // Skip if response is too large (>1MB)
          if (xmlText.length > 1024 * 1024) {
            console.error(`Feed too large: ${feed.name}`);
            return;
          }

          const articles = parseRSSFeed(xmlText);
          
          console.log(`Parsed ${articles.length} articles from ${feed.name}`);

          // Insert articles in smaller batches
          const batchSize = 5;
          for (let j = 0; j < articles.length; j += batchSize) {
            const articleBatch = articles.slice(j, j + batchSize);
            
            for (const article of articleBatch) {
              try {
                const { error: insertError } = await supabaseClient
                  .from('rss_articles')
                  .upsert({
                    feed_id: feed.id,
                    title: article.title,
                    description: article.description,
                    link: article.link,
                    pub_date: article.pubDate ? new Date(article.pubDate).toISOString() : null,
                    guid: article.guid,
                    author: article.author
                  }, {
                    onConflict: 'feed_id,guid'
                  });

                if (!insertError) {
                  totalArticlesAdded++;
                }
              } catch (articleError) {
                console.error(`Error inserting article from ${feed.name}:`, articleError);
              }
            }
          }
        } catch (feedError) {
          console.error(`Error processing feed ${feed.name}:`, feedError);
        }
      }));
      
      // Small delay between batches to prevent memory buildup
      if (i + maxConcurrent < (feeds?.length || 0)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Successfully processed feeds. Added ${totalArticlesAdded} articles.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully fetched and processed RSS feeds. Added ${totalArticlesAdded} articles.`,
        articlesAdded: totalArticlesAdded
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in fetch-rss-feeds function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
