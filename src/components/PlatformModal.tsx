
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function PlatformModal({ isOpen, onClose, onSave }: PlatformModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [category, setCategory] = useState('Public');
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name || !url) {
      toast({
        title: "Error",
        description: "Platform name and URL are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('platforms')
        .insert({
          name,
          url,
          platform_type: 'bug_bounty',
          description: description || `Custom platform: ${name}`,
          favicon_url: faviconUrl,
          is_enabled: isEnabled,
          category
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform added successfully!",
      });

      // Reset form
      setName('');
      setUrl('');
      setDescription('');
      setFaviconUrl('');
      setIsEnabled(true);
      setCategory('Public');
      
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Platform</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Platform Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., HackerOne, Bugcrowd"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="url" className="text-gray-300">Platform URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="favicon" className="text-gray-300">Favicon URL</Label>
            <Input
              id="favicon"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://example.com/favicon.ico"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-gray-300">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Part-Time Job">Part-Time Job</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Platform description..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <Label htmlFor="enabled" className="text-gray-300">
              Platform Enabled
            </Label>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 flex-1">
              Save Platform
            </Button>
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
