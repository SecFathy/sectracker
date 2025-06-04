
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, DollarSign, FileText, Award, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HackerOneData {
  user_info: {
    username: string;
    reputation: number;
    signal: number;
    impact: number;
  };
  bounties: {
    total_awarded: number;
    total_count: number;
  };
  reports: {
    total_count: number;
    resolved_count: number;
    duplicate_count: number;
    not_applicable_count: number;
  };
  programs: {
    invited_count: number;
    participating_count: number;
  };
}

interface HackerOneDataCardProps {
  platformId: string;
}

export function HackerOneDataCard({ platformId }: HackerOneDataCardProps) {
  const [data, setData] = useState<HackerOneData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data: hackeroneData, error } = await supabase.functions.invoke('fetch-hackerone-data', {
        body: {
          user_id: user.data.user.id,
          platform_id: platformId
        }
      });

      if (error) throw error;
      setData(hackeroneData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch HackerOne data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [platformId]);

  if (!data) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src="/hackerone-favicon.ico" alt="HackerOne" className="w-6 h-6" />
            HackerOne Integration
          </CardTitle>
          <CardDescription>Loading HackerOne data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <img src="/hackerone-favicon.ico" alt="HackerOne" className="w-6 h-6" />
              HackerOne Profile
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="border-gray-600"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <CardDescription>@{data.user_info.username}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{data.user_info.reputation}</div>
              <div className="text-sm text-gray-400">Reputation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{data.user_info.signal}</div>
              <div className="text-sm text-gray-400">Signal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{data.user_info.impact}</div>
              <div className="text-sm text-gray-400">Impact</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bounties Card */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Bounties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Awarded</span>
            <Badge variant="secondary" className="bg-green-600 text-white">
              ${data.bounties.total_awarded.toLocaleString()}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Bounties</span>
            <Badge variant="outline" className="border-gray-600">
              {data.bounties.total_count}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reports Card */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Reports</span>
            <Badge variant="outline" className="border-gray-600">
              {data.reports.total_count}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Resolved</span>
            <Badge variant="secondary" className="bg-green-600 text-white">
              {data.reports.resolved_count}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Duplicates</span>
            <Badge variant="secondary" className="bg-yellow-600 text-white">
              {data.reports.duplicate_count}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Not Applicable</span>
            <Badge variant="secondary" className="bg-red-600 text-white">
              {data.reports.not_applicable_count}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Programs Card */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Programs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Invited To</span>
            <Badge variant="outline" className="border-gray-600">
              {data.programs.invited_count}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Participating</span>
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {data.programs.participating_count}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
