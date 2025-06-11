
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { BountyTargetModal } from './BountyTargetModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BountyTarget {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export function BountyTargetsView() {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  const { toast } = useToast();
  
  const [targets, setTargets] = useState<BountyTarget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<BountyTarget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBountyTargets();
  }, []);

  const fetchBountyTargets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bounty_targets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bounty targets:', error);
        toast({
          title: "Error",
          description: "Failed to fetch bounty targets",
          variant: "destructive"
        });
        return;
      }

      setTargets(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bounty targets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (deadline: string) => {
    const now = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleSaveTarget = () => {
    fetchBountyTargets(); // Refresh data after saving
    setIsModalOpen(false);
    setEditingTarget(null);
  };

  const handleEditTarget = (target: BountyTarget) => {
    setEditingTarget(target);
    setIsModalOpen(true);
  };

  const handleDeleteTarget = async (targetId: string) => {
    try {
      const { error } = await supabase
        .from('bounty_targets')
        .update({ is_active: false })
        .eq('id', targetId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete bounty target",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Bounty target deleted successfully"
      });

      fetchBountyTargets();
    } catch (error) {
      console.error('Error deleting bounty target:', error);
      toast({
        title: "Error",
        description: "Failed to delete bounty target",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className={`text-3xl font-bold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
          Bounty Targets
        </h1>
        <div className={`text-center py-8 ${isHackerTheme ? "text-green-400 font-mono" : "text-gray-400"}`}>
          Loading bounty targets...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
          Bounty Targets
        </h1>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700"}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Target
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {targets.map((target) => {
          const timeRemaining = calculateTimeRemaining(target.deadline);
          const progressPercentage = getProgressPercentage(target.current_amount, target.target_amount);
          const isNearDeadline = timeRemaining.days <= 7 && !timeRemaining.expired;
          const isCompleted = target.current_amount >= target.target_amount;

          return (
            <Card key={target.id} className={`${isHackerTheme ? "bg-black border-green-600" : "bg-gray-800 border-gray-700"} ${isNearDeadline ? 'border-orange-500' : ''} ${isCompleted ? 'border-green-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`flex items-center space-x-2 ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                    <Target className={`h-5 w-5 ${isHackerTheme ? "text-green-400" : "text-blue-400"}`} />
                    <span>{target.title}</span>
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditTarget(target)}
                      className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteTarget(target.id)}
                      className={isHackerTheme ? "border-red-600 text-red-400 hover:bg-red-950" : "border-red-600 text-red-400 hover:bg-red-700"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {target.description && (
                  <p className={`text-sm ${isHackerTheme ? "text-green-300 font-mono" : "text-gray-400"}`}>
                    {target.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}`}>
                      Progress
                    </span>
                    <span className={`text-sm font-medium ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                      ${target.current_amount.toLocaleString()} / ${target.target_amount.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className={`h-3 ${isHackerTheme ? "bg-green-950" : ""}`}
                  />
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${isHackerTheme ? "text-green-500 font-mono" : "text-gray-400"}`}>
                      {progressPercentage.toFixed(1)}% Complete
                    </span>
                    <span className={`text-xs ${isHackerTheme ? "text-green-500 font-mono" : "text-gray-400"}`}>
                      ${(target.target_amount - target.current_amount).toLocaleString()} remaining
                    </span>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className={`p-3 rounded ${isHackerTheme ? "bg-green-950/20 border border-green-800" : "bg-gray-700/50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className={`h-4 w-4 ${isHackerTheme ? "text-green-400" : "text-blue-400"}`} />
                      <span className={`text-sm font-medium ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                        Time Remaining
                      </span>
                    </div>
                    <Badge variant={timeRemaining.expired ? "destructive" : isNearDeadline ? "secondary" : "default"}>
                      {timeRemaining.expired ? "Expired" : isNearDeadline ? "Due Soon" : "Active"}
                    </Badge>
                  </div>
                  {!timeRemaining.expired ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className={`text-lg font-bold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                          {timeRemaining.days}
                        </div>
                        <div className={`text-xs ${isHackerTheme ? "text-green-600 font-mono" : "text-gray-400"}`}>
                          Days
                        </div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                          {timeRemaining.hours}
                        </div>
                        <div className={`text-xs ${isHackerTheme ? "text-green-600 font-mono" : "text-gray-400"}`}>
                          Hours
                        </div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                          {timeRemaining.minutes}
                        </div>
                        <div className={`text-xs ${isHackerTheme ? "text-green-600 font-mono" : "text-gray-400"}`}>
                          Minutes
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-center ${isHackerTheme ? "text-red-400 font-mono" : "text-red-400"}`}>
                      Target deadline has passed
                    </p>
                  )}
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className={`h-4 w-4 ${isHackerTheme ? "text-green-400" : "text-gray-400"}`} />
                    <span className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                      Deadline:
                    </span>
                  </div>
                  <span className={isHackerTheme ? "text-green-400 font-mono" : "text-white"}>
                    {new Date(target.deadline).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {targets.length === 0 && !loading && (
        <Card className={isHackerTheme ? "bg-black border-green-600" : "bg-gray-800 border-gray-700"}>
          <CardContent className="p-8 text-center">
            <Target className={`h-12 w-12 mx-auto mb-4 ${isHackerTheme ? "text-green-600" : "text-gray-400"}`} />
            <p className={`text-lg ${isHackerTheme ? "text-green-400 font-mono" : "text-gray-400"}`}>
              No active bounty targets
            </p>
            <p className={`text-sm mt-2 ${isHackerTheme ? "text-green-600 font-mono" : "text-gray-500"}`}>
              Set your first bounty target to track your earnings goals
            </p>
          </CardContent>
        </Card>
      )}

      <BountyTargetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTarget(null);
        }}
        onSave={handleSaveTarget}
        editingTarget={editingTarget}
      />
    </div>
  );
}
