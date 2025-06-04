
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function HackerOneSetup() {
  const [credentials, setCredentials] = useState({
    username: '',
    apiToken: ''
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Get HackerOne platform ID (assuming it exists)
      const { data: platform, error: platformError } = await supabase
        .from('platforms')
        .select('id')
        .eq('name', 'HackerOne')
        .single();

      if (platformError) throw new Error('HackerOne platform not found');

      // Store HackerOne credentials securely
      const { error: functionError } = await supabase.functions.invoke('store-hackerone-credentials', {
        body: {
          user_id: user.data.user.id,
          platform_id: platform.id,
          username: credentials.username,
          api_token: credentials.apiToken
        }
      });

      if (functionError) throw functionError;

      toast({
        title: "Success",
        description: "HackerOne credentials saved successfully!",
      });

      // Fetch balance after successful credential storage
      await fetchBalance(platform.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save HackerOne credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (platformId?: string) => {
    setBalanceLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      let platform_id = platformId;
      if (!platform_id) {
        const { data: platform, error: platformError } = await supabase
          .from('platforms')
          .select('id')
          .eq('name', 'HackerOne')
          .single();

        if (platformError) throw new Error('HackerOne platform not found');
        platform_id = platform.id;
      }

      const { data: hackeroneData, error: fetchError } = await supabase.functions.invoke('fetch-hackerone-data', {
        body: {
          user_id: user.data.user.id,
          platform_id: platform_id
        }
      });

      if (fetchError) throw fetchError;

      setBalance(hackeroneData.bounties.total_awarded);
      
      toast({
        title: "Success",
        description: "Balance fetched successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch balance",
        variant: "destructive",
      });
    } finally {
      setBalanceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">HackerOne Setup</h1>
          <p className="text-gray-400">Connect your HackerOne account to track your bug bounty progress</p>
        </div>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="/hackerone-favicon.ico" alt="HackerOne" className="w-6 h-6" />
              HackerOne Integration
            </CardTitle>
            <CardDescription>
              Enter your HackerOne credentials to connect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
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

              <div className="text-sm text-gray-400 space-y-2">
                <p className="font-medium">To get your API token:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to your HackerOne Settings</li>
                  <li>Navigate to "API Tokens" section</li>
                  <li>Click "Create API Token"</li>
                  <li>Give it a name and select appropriate permissions</li>
                  <li>Copy the generated token and paste it here</li>
                </ol>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => window.open('https://hackerone.com/settings/api_tokens', '_blank')}
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open HackerOne API Tokens Page
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 flex-1">
                  {loading ? 'Connecting...' : 'Connect HackerOne'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {balance !== null && (
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">
                  ${balance.toLocaleString()}
                </div>
                <p className="text-gray-400 mt-2">Total bounties earned</p>
              </div>
            </CardContent>
          </Card>
        )}

        {credentials.username && credentials.apiToken && balance === null && (
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardContent className="pt-6">
              <Button 
                onClick={() => fetchBalance()} 
                disabled={balanceLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {balanceLoading ? 'Fetching Balance...' : 'Fetch Current Balance'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
