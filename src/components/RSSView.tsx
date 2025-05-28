
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Rss, ExternalLink, BookOpen, Search, Filter, RefreshCw } from 'lucide-react';
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

export function RSSView() {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [articles, setArticles] = useState<RSSArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    search: ''
  });
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [showAddFeed, setShowAddFeed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeeds();
    fetchArticles();
  }, []);

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

  const filteredArticles = articles.filter(article => {
    // Category filter
    if (filters.category !== 'all' && article.feed_category !== filters.category) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = article.title.toLowerCase().includes(searchLower);
      const matchesDescription = article.description?.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }
    
    return true;
  });

  const uniqueCategories = [...new Set(feeds.map(feed => feed.category))].filter(Boolean);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">News Feed</h1>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">RSS News Feed</h1>
          <p className="text-gray-400 mt-1">Latest cybersecurity news and updates</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={refreshFeeds}
            disabled={refreshing}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowAddFeed(!showAddFeed)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feed
          </Button>
        </div>
      </div>

      {/* Add Feed Section */}
      {showAddFeed && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Add RSS Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter RSS feed URL..."
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button 
                onClick={() => {
                  // In a real implementation, you would validate and add the feed
                  toast({
                    title: "Feature Coming Soon",
                    description: "Custom RSS feed addition will be available soon"
                  });
                  setNewFeedUrl('');
                  setShowAddFeed(false);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-white font-medium">Filters</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Search</span>
              </div>
              <Input
                placeholder="Search articles..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Category</div>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category || 'unknown'}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(filters.search || filters.category !== 'all') && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Showing {filteredArticles.length} of {articles.length} articles
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilters({ category: 'all', search: '' })}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles */}
      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Rss className="h-5 w-5 text-orange-400" />
                    <span>{article.title}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="border-orange-600 text-orange-400">
                      {article.feed_name}
                    </Badge>
                    <Badge variant="outline" className="border-cyan-600 text-cyan-400">
                      {article.feed_category}
                    </Badge>
                    {article.pub_date && (
                      <span className="text-xs text-gray-400">
                        {new Date(article.pub_date).toLocaleDateString()}
                      </span>
                    )}
                    {article.author && (
                      <span className="text-xs text-gray-400">by {article.author}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addToReadingList(article)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Add to Reading
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(article.link, '_blank')}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {article.description && (
              <CardContent>
                <p className="text-gray-300">{article.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {articles.length === 0 ? "No articles available. Try refreshing the feeds." : "No articles match the current filters."}
          </p>
        </div>
      )}
    </div>
  );
}
