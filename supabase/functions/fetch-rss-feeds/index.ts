
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
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  
  const items: RSSItem[] = [];
  const itemElements = doc.querySelectorAll('item');
  
  itemElements.forEach((item) => {
    const title = item.querySelector('title')?.textContent?.trim();
    const description = item.querySelector('description')?.textContent?.trim();
    const link = item.querySelector('link')?.textContent?.trim();
    const pubDate = item.querySelector('pubDate')?.textContent?.trim();
    const guid = item.querySelector('guid')?.textContent?.trim();
    const author = item.querySelector('author')?.textContent?.trim() || 
                  item.querySelector('dc\\:creator')?.textContent?.trim();
    
    if (title && link) {
      items.push({
        title,
        description: description || '',
        link,
        pubDate,
        guid: guid || link,
        author
      });
    }
  });
  
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
    
    // Get all RSS feeds
    const { data: feeds, error: feedsError } = await supabaseClient
      .from('rss_feeds')
      .select('id, url, name');

    if (feedsError) {
      console.error('Error fetching feeds:', feedsError);
      throw feedsError;
    }

    console.log(`Found ${feeds?.length || 0} feeds to process`);

    let totalArticlesAdded = 0;

    for (const feed of feeds || []) {
      try {
        console.log(`Fetching RSS feed: ${feed.name} (${feed.url})`);
        
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RSS-Fetcher/1.0)',
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${feed.name}: ${response.status}`);
          continue;
        }

        const xmlText = await response.text();
        const articles = parseRSSFeed(xmlText);
        
        console.log(`Parsed ${articles.length} articles from ${feed.name}`);

        // Insert articles into database
        for (const article of articles) {
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

            if (insertError) {
              console.error(`Error inserting article: ${insertError.message}`);
            } else {
              totalArticlesAdded++;
            }
          } catch (articleError) {
            console.error(`Error processing article from ${feed.name}:`, articleError);
          }
        }
      } catch (feedError) {
        console.error(`Error processing feed ${feed.name}:`, feedError);
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
