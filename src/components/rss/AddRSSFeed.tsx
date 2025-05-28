
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AddRSSFeedProps {
  newFeedUrl: string;
  setNewFeedUrl: (url: string) => void;
  onClose: () => void;
}

export function AddRSSFeed({ newFeedUrl, setNewFeedUrl, onClose }: AddRSSFeedProps) {
  const { toast } = useToast();

  const handleAddFeed = () => {
    // In a real implementation, you would validate and add the feed
    toast({
      title: "Feature Coming Soon",
      description: "Custom RSS feed addition will be available soon"
    });
    setNewFeedUrl('');
    onClose();
  };

  return (
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
            onClick={handleAddFeed}
            className="bg-green-600 hover:bg-green-700"
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
