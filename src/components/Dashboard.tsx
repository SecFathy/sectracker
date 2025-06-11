import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, Shield, CheckSquare, Lightbulb, Target, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { QuickNote } from '@/components/QuickNote';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { DraggableDashboardCard } from '@/components/DraggableDashboardCard';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalPlatforms: number;
  totalBugs: number;
  totalBounties: number;
  totalChecklists: number;
  totalTips: number;
  readingItems: number;
  activeBountyTargets: number;
  totalBountyTarget: number;
  currentBountyProgress: number;
  severityStats: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
    Informational: number;
  };
}

interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPlatforms: 0,
    totalBugs: 0,
    totalBounties: 0,
    totalChecklists: 0,
    totalTips: 0,
    readingItems: 0,
    activeBountyTargets: 0,
    totalBountyTarget: 0,
    currentBountyProgress: 0,
    severityStats: {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Informational: 0,
    },
  });

  const [cardOrder, setCardOrder] = useState([
    'platforms',
    'bugs',
    'bounties',
    'checklists',
    'tips',
    'reading'
  ]);

  const [userName, setUserName] = useState('Security Researcher');
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscription for bugs table to update severity stats
    const bugsChannel = supabase
      .channel('bugs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bugs'
        },
        () => {
          console.log('Bug data changed, refreshing stats...');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bugsChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const userId = user.data.user.id;

      // Fetch user profile to get name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (profile) {
        const displayName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(' ') || 'Security Researcher';
        setUserName(displayName);
      }

      // Fetch total platforms count (all platforms in the system)
      const { count: platformsCount } = await supabase
        .from('platforms')
        .select('*', { count: 'exact', head: true });

      console.log('Total platforms count:', platformsCount);

      // Fetch user's bugs count, total bounties, and severity distribution
      const { data: bugs } = await supabase
        .from('bugs')
        .select('bounty_amount, severity')
        .eq('user_id', userId);

      const totalBounties = bugs?.reduce((sum, bug) => sum + (bug.bounty_amount || 0), 0) || 0;
      
      const severityStats = bugs?.reduce((acc, bug) => {
        acc[bug.severity as keyof typeof acc] = (acc[bug.severity as keyof typeof acc] || 0) + 1;
        return acc;
      }, {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
        Informational: 0,
      }) || {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
        Informational: 0,
      };

      // Fetch bounty targets stats
      const { data: bountyTargets } = await supabase
        .from('bounty_targets')
        .select('target_amount, current_amount, is_active')
        .eq('user_id', userId);

      const activeBountyTargets = bountyTargets?.filter(target => target.is_active).length || 0;
      const totalBountyTarget = bountyTargets?.reduce((sum, target) => sum + (target.target_amount || 0), 0) || 0;
      const currentBountyProgress = bountyTargets?.reduce((sum, target) => sum + (target.current_amount || 0), 0) || 0;

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
        activeBountyTargets,
        totalBountyTarget,
        currentBountyProgress,
        severityStats,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    }
  };

  const dashboardCards: DashboardCard[] = [
    {
      id: 'platforms',
      title: 'Total Platforms',
      value: stats.totalPlatforms,
      description: 'Available bug bounty platforms',
      icon: Target,
      color: 'text-cyan-400'
    },
    {
      id: 'bugs',
      title: 'Total Bugs',
      value: stats.totalBugs,
      description: 'Bugs found and reported',
      icon: Bug,
      color: 'text-red-400'
    },
    {
      id: 'bounties',
      title: 'Bounties Earned',
      value: `$${stats.totalBounties.toFixed(2)}`,
      description: 'Total earnings',
      icon: Trophy,
      color: 'text-yellow-400'
    },
    {
      id: 'checklists',
      title: 'Checklists',
      value: stats.totalChecklists,
      description: 'Security testing checklists',
      icon: CheckSquare,
      color: 'text-green-400'
    },
    {
      id: 'tips',
      title: 'Tips & Tricks',
      value: stats.totalTips,
      description: 'Custom security tips',
      icon: Lightbulb,
      color: 'text-orange-400'
    },
    {
      id: 'reading',
      title: 'Reading Queue',
      value: stats.readingItems,
      description: 'Writeups to read',
      icon: Shield,
      color: 'text-purple-400'
    }
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const orderedCards = cardOrder.map(id => dashboardCards.find(card => card.id === id)!).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          {stats.activeBountyTargets > 0 && (
            <div className="text-sm text-gray-400 mt-1">
              Active Bounty Targets: {stats.activeBountyTargets} | 
              Progress: ${stats.currentBountyProgress.toFixed(2)} / ${stats.totalBountyTarget.toFixed(2)}
              {stats.totalBountyTarget > 0 && 
                ` (${((stats.currentBountyProgress / stats.totalBountyTarget) * 100).toFixed(1)}%)`
              }
            </div>
          )}
        </div>
        <div className="text-sm text-gray-400">
          Welcome back, {userName}
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orderedCards.map((card) => (
              <DraggableDashboardCard key={card.id} id={card.id}>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">{card.title}</CardTitle>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{card.value}</div>
                    <p className="text-xs text-gray-400">{card.description}</p>
                  </CardContent>
                </Card>
              </DraggableDashboardCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded" onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'platforms' });
              window.dispatchEvent(event);
            }}>
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Create a new platform profile</p>
                <p className="text-xs text-gray-400">Start tracking bugs on a new platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded" onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'my-bugs' });
              window.dispatchEvent(event);
            }}>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Add a new bug report</p>
                <p className="text-xs text-gray-400">Document your latest findings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded" onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'checklists' });
              window.dispatchEvent(event);
            }}>
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
              <span className="text-red-400 font-bold">{stats.severityStats.Critical}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">High</span>
              <span className="text-orange-400 font-bold">{stats.severityStats.High}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Medium</span>
              <span className="text-yellow-400 font-bold">{stats.severityStats.Medium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Low</span>
              <span className="text-green-400 font-bold">{stats.severityStats.Low}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Informational</span>
              <span className="text-blue-400 font-bold">{stats.severityStats.Informational}</span>
            </div>
          </CardContent>
        </Card>

        <QuickNote />
      </div>
    </div>
  );
}
