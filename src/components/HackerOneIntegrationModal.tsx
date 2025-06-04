
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HackerOneIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformId: string;
  onSuccess: () => void;
}

export function HackerOneIntegrationModal({ isOpen, onClose, platformId, onSuccess }: HackerOneIntegrationModalProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    apiToken: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Store HackerOne credentials securely
      const { error: functionError } = await supabase.functions.invoke('store-hackerone-credentials', {
        body: {
          user_id: user.data.user.id,
          platform_id: platformId,
          username: credentials.username,
          api_token: credentials.apiToken
        }
      });

      if (functionError) throw functionError;

      // Fetch initial HackerOne data
      const { data: hackeroneData, error: fetchError } = await supabase.functions.invoke('fetch-hackerone-data', {
        body: {
          user_id: user.data.user.id,
          platform_id: platformId
        }
      });

      if (fetchError) throw fetchError;

      toast({
        title: "Success",
        description: "HackerOne integration completed successfully!",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to integrate with HackerOne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>HackerOne Integration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-gray-300">HackerOne Username</Label>
            <Input
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="Your HackerOne username"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="apiToken" className="text-gray-300">API Token</Label>
            <Input
              id="apiToken"
              type="password"
              value={credentials.apiToken}
              onChange={(e) => setCredentials({...credentials, apiToken: e.target.value})}
              placeholder="Your HackerOne API token"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="text-sm text-gray-400">
            <p>To get your API token:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Go to HackerOne Settings → API Tokens</li>
              <li>Create a new API token with read permissions</li>
              <li>Copy the token and paste it here</li>
            </ol>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 flex-1">
              {loading ? 'Connecting...' : 'Connect HackerOne'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
