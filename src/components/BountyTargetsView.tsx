
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BountyTargetModal } from '@/components/BountyTargetModal';
import { Progress } from '@/components/ui/progress';

interface BountyTarget {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function BountyTargetsView() {
  const [bountyTargets, setBountyTargets] = useState<BountyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<BountyTarget | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBountyTargets();
  }, []);

  const fetchBountyTargets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bounty_targets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBountyTargets(data || []);
    } catch (error: any) {
      console.error('Error fetching bounty targets:', error);
      toast({
        title: "Error",
        description: "Failed to load bounty targets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTarget = () => {
    setEditingTarget(null);
    setIsModalOpen(true);
  };

  const handleEditTarget = (target: BountyTarget) => {
    setEditingTarget(target);
    setIsModalOpen(true);
  };

  const handleDeleteTarget = async (targetId: string) => {
    try {
      const { error } = await supabase
        .from('bounty_targets')
        .delete()
        .eq('id', targetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bounty target deleted successfully!",
      });

      fetchBountyTargets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
        <div className="text-white">Loading bounty targets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Bounty Targets</h1>
        <Button 
          onClick={handleCreateTarget}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Target
        </Button>
      </div>

      {bountyTargets.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Bounty Targets</h3>
            <p className="text-gray-400 mb-4">Set your first bounty target to track your progress</p>
            <Button 
              onClick={handleCreateTarget}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Target
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bountyTargets.map((target) => {
            const progress = calculateProgress(target.current_amount, target.target_amount);
            const daysLeft = getDaysUntilDeadline(target.deadline);
            const isOverdue = daysLeft < 0;
            const isNearDeadline = daysLeft <= 7 && daysLeft >= 0;

            return (
              <Card key={target.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{target.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTarget(target)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTarget(target.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {target.description && (
                    <p className="text-gray-400 text-sm">{target.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Progress</span>
                      <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-xs text-gray-400">Current</p>
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(target.current_amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <div>
                        <p className="text-xs text-gray-400">Target</p>
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(target.target_amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Deadline</p>
                      <p className="text-sm font-medium text-white">
                        {formatDate(target.deadline)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${
                        isOverdue 
                          ? 'text-red-400' 
                          : isNearDeadline 
                            ? 'text-yellow-400' 
                            : 'text-gray-400'
                      }`}>
                        {isOverdue 
                          ? `${Math.abs(daysLeft)} days overdue`
                          : `${daysLeft} days left`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Remaining</span>
                      <span className="text-sm font-medium text-cyan-400">
                        {formatCurrency(Math.max(0, target.target_amount - target.current_amount))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <BountyTargetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchBountyTargets}
        editingTarget={editingTarget}
      />
    </div>
  );
}
