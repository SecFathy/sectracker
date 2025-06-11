
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bug, 
  Target, 
  Calendar, 
  TrendingUp, 
  Shield, 
  BookOpen, 
  Link, 
  StickyNote,
  Plus,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Users,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuickNote } from '@/components/QuickNote';

interface DashboardStats {
  totalBugs: number;
  activeBugs: number;
  resolvedBugs: number;
  totalBounties: number;
  platforms: number;
  checklists: number;
  tips: number;
  links: number;
  notes: number;
  readingItems: number;
}

interface BountyTarget {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  is_active: boolean;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBugs: 0,
    activeBugs: 0,
    resolvedBugs: 0,
    totalBounties: 0,
    platforms: 0,
    checklists: 0,
    tips: 0,
    links: 0,
    notes: 0,
    readingItems: 0,
  });
  const [bountyTargets, setBountyTargets] = useState<BountyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch bugs data
      const { data: bugs } = await supabase
        .from('bugs')
        .select('status, bounty_amount')
        .eq('user_id', user.id);

      // Fetch bounty targets
      const { data: targets } = await supabase
        .from('bounty_targets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('deadline', { ascending: true })
        .limit(3);

      // Fetch other counts
      const [
        { count: platformsCount },
        { count: checklistsCount },
        { count: tipsCount },
        { count: linksCount },
        { count: notesCount },
        { count: readingCount }
      ] = await Promise.all([
        supabase.from('platforms').select('*', { count: 'exact', head: true }),
        supabase.from('security_checklists').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('security_tips').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('useful_links').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('personal_notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('reading_list').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      const activeBugs = bugs?.filter(bug => !['Resolved', 'Bounty Awarded'].includes(bug.status)).length || 0;
      const resolvedBugs = bugs?.filter(bug => ['Resolved', 'Bounty Awarded'].includes(bug.status)).length || 0;
      const totalBounties = bugs?.reduce((sum, bug) => sum + (bug.bounty_amount || 0), 0) || 0;

      setStats({
        totalBugs: bugs?.length || 0,
        activeBugs,
        resolvedBugs,
        totalBounties,
        platforms: platformsCount || 0,
        checklists: checklistsCount || 0,
        tips: tipsCount || 0,
        links: linksCount || 0,
        notes: notesCount || 0,
        readingItems: readingCount || 0,
      });

      setBountyTargets(targets || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (view: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: view }));
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-sm text-gray-400">
          Welcome to your Security Tracker
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Bugs</p>
                <p className="text-2xl font-bold text-white">{stats.totalBugs}</p>
              </div>
              <Bug className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Bugs</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.activeBugs}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{stats.resolvedBugs}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Bounties</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalBounties)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bounty Targets Progress */}
      {bountyTargets.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-cyan-400" />
                Active Bounty Targets
              </CardTitle>
              <Button
                onClick={() => navigateTo('bounty-targets')}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {bountyTargets.map((target) => {
              const progress = calculateProgress(target.current_amount, target.target_amount);
              const daysLeft = getDaysUntilDeadline(target.deadline);
              const isNearDeadline = daysLeft <= 7 && daysLeft >= 0;
              const isOverdue = daysLeft < 0;

              return (
                <div key={target.id} className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{target.title}</h4>
                    <Badge variant={isOverdue ? "destructive" : isNearDeadline ? "secondary" : "default"}>
                      {isOverdue 
                        ? `${Math.abs(daysLeft)} days overdue`
                        : `${daysLeft} days left`
                      }
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Progress: {progress.toFixed(1)}%</span>
                      <span>{formatCurrency(target.current_amount)} / {formatCurrency(target.target_amount)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-400">
            Quickly access commonly used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => navigateTo('my-bugs')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-gray-600 hover:bg-gray-700"
            >
              <Bug className="h-6 w-6 text-red-400" />
              <span className="text-sm">Report Bug</span>
            </Button>

            <Button
              onClick={() => navigateTo('bounty-targets')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-gray-600 hover:bg-gray-700"
            >
              <Target className="h-6 w-6 text-cyan-400" />
              <span className="text-sm">Set Target</span>
            </Button>

            <Button
              onClick={() => navigateTo('checklists')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-gray-600 hover:bg-gray-700"
            >
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-sm">Security Check</span>
            </Button>

            <Button
              onClick={() => navigateTo('platforms')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-gray-600 hover:bg-gray-700"
            >
              <Globe className="h-6 w-6 text-purple-400" />
              <span className="text-sm">Platforms</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => navigateTo('platforms')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats.platforms}</div>
            <p className="text-sm text-gray-400">Bug bounty platforms</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => navigateTo('checklists')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Checklists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.checklists}</div>
            <p className="text-sm text-gray-400">Security checklists</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => navigateTo('tips')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400 mb-2">{stats.tips}</div>
            <p className="text-sm text-gray-400">Security tips</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => navigateTo('reading')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-400" />
              Reading List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.readingItems}</div>
            <p className="text-sm text-gray-400">Articles to read</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => navigateTo('links')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Link className="h-5 w-5 text-cyan-400" />
              Useful Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.links}</div>
            <p className="text-sm text-gray-400">Bookmarked links</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => navigateTo('notes')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-yellow-400" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.notes}</div>
            <p className="text-sm text-gray-400">Personal notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Note */}
      <QuickNote />
    </div>
  );
}
