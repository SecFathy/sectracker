
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { RSSFilters } from '@/components/rss/RSSFilters';
import { RSSArticleCard } from '@/components/rss/RSSArticleCard';
import { AddRSSFeed } from '@/components/rss/AddRSSFeed';
import { useRSSData } from '@/hooks/useRSSData';

export function RSSView() {
  const { feeds, articles, loading, refreshing, addToReadingList, refreshFeeds } = useRSSData();
  const [filters, setFilters] = useState({
    category: 'all',
    search: ''
  });
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [showAddFeed, setShowAddFeed] = useState(false);

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
        <AddRSSFeed
          newFeedUrl={newFeedUrl}
          setNewFeedUrl={setNewFeedUrl}
          onClose={() => setShowAddFeed(false)}
        />
      )}

      {/* Filters */}
      <RSSFilters
        filters={filters}
        setFilters={setFilters}
        uniqueCategories={uniqueCategories}
        filteredCount={filteredArticles.length}
        totalCount={articles.length}
      />

      {/* Articles */}
      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <RSSArticleCard
            key={article.id}
            article={article}
            onAddToReading={addToReadingList}
          />
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
