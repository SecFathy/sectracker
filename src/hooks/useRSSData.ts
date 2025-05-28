
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  description?: string;
  is_default: boolean;
}

interface RSSArticle {
  id: string;
  feed_id: string;
  title: string;
  description?: string;
  link: string;
  pub_date?: string;
  author?: string;
  feed_name?: string;
  feed_category?: string;
}

export function useRSSData() {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [articles, setArticles] = useState<RSSArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchFeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching feeds:', error);
        return;
      }

      setFeeds(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('rss_articles')
        .select(`
          *,
          rss_feeds!inner(name, category)
        `)
        .order('pub_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching articles:', error);
        return;
      }

      const articlesWithFeedInfo = data?.map(article => ({
        ...article,
        feed_name: article.rss_feeds?.name,
        feed_category: article.rss_feeds?.category
      })) || [];

      setArticles(articlesWithFeedInfo);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToReadingList = async (article: RSSArticle) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add articles to reading list",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('reading_list')
        .insert([{
          user_id: user.id,
          title: article.title,
          url: article.link,
          description: article.description || '',
          category: article.feed_category || 'News',
          priority: 1
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already added",
            description: "This article is already in your reading list",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to add article to reading list",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Article added to reading list"
        });
      }
    } catch (error) {
      console.error('Error adding to reading list:', error);
      toast({
        title: "Error",
        description: "Failed to add article to reading list",
        variant: "destructive"
      });
    }
  };

  const refreshFeeds = async () => {
    setRefreshing(true);
    // Note: In a real implementation, you would call an edge function to fetch RSS feeds
    // For now, we'll just refresh the existing articles
    await fetchArticles();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "RSS feeds have been refreshed"
    });
  };

  useEffect(() => {
    fetchFeeds();
    fetchArticles();
  }, []);

  return {
    feeds,
    articles,
    loading,
    refreshing,
    addToReadingList,
    refreshFeeds
  };
}
