
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, Shield, CheckSquare, Lightbulb, Target, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalPlatforms: number;
  totalBugs: number;
  totalBounties: number;
  totalChecklists: number;
  totalTips: number;
  readingItems: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPlatforms: 0,
    totalBugs: 0,
    totalBounties: 0,
    totalChecklists: 0,
    totalTips: 0,
    readingItems: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const userId = user.data.user.id;

      // Fetch user's platform profiles count
      const { count: platformsCount } = await supabase
        .from('user_platform_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Fetch user's bugs count and total bounties
      const { data: bugs } = await supabase
        .from('bugs')
        .select('bounty_amount')
        .eq('user_id', userId);

      const totalBounties = bugs?.reduce((sum, bug) => sum + (bug.bounty_amount || 0), 0) || 0;

      // Fetch other stats
      const { count: checklistsCount } = await supabase
        .from('security_checklists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: tipsCount } = await supabase
        .from('security_tips')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: readingCount } = await supabase
        .from('reading_list')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setStats({
        totalPlatforms: platformsCount || 0,
        totalBugs: bugs?.length || 0,
        totalBounties,
        totalChecklists: checklistsCount || 0,
        totalTips: tipsCount || 0,
        readingItems: readingCount || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-sm text-gray-400">
          Welcome back, Security Researcher
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Platform Profiles</CardTitle>
            <Target className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPlatforms}</div>
            <p className="text-xs text-gray-400">Active platform profiles</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Bugs</CardTitle>
            <Bug className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalBugs}</div>
            <p className="text-xs text-gray-400">Bugs found and reported</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Bounties Earned</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalBounties.toFixed(2)}</div>
            <p className="text-xs text-gray-400">Total earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Checklists</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalChecklists}</div>
            <p className="text-xs text-gray-400">Security testing checklists</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tips & Tricks</CardTitle>
            <Lightbulb className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTips}</div>
            <p className="text-xs text-gray-400">Custom security tips</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Reading Queue</CardTitle>
            <Shield className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.readingItems}</div>
            <p className="text-xs text-gray-400">Writeups to read</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Create a new platform profile</p>
                <p className="text-xs text-gray-400">Start tracking bugs on a new platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Add a new bug report</p>
                <p className="text-xs text-gray-400">Document your latest findings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Complete security checklist</p>
                <p className="text-xs text-gray-400">Systematic testing approach</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Critical</span>
              <span className="text-red-400 font-bold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">High</span>
              <span className="text-orange-400 font-bold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Medium</span>
              <span className="text-yellow-400 font-bold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Low</span>
              <span className="text-green-400 font-bold">0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
