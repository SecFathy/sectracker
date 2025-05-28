
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rss, ExternalLink, BookOpen } from 'lucide-react';

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

interface RSSArticleCardProps {
  article: RSSArticle;
  onAddToReading: (article: RSSArticle) => void;
}

export function RSSArticleCard({ article, onAddToReading }: RSSArticleCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
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
              onClick={() => onAddToReading(article)}
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
  );
}
