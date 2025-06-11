
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface BountyTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingTarget?: BountyTarget | null;
}

export function BountyTargetModal({ isOpen, onClose, onSave, editingTarget }: BountyTargetModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    description: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (editingTarget) {
      setFormData({
        title: editingTarget.title,
        target_amount: editingTarget.target_amount.toString(),
        current_amount: editingTarget.current_amount.toString(),
        deadline: editingTarget.deadline,
        description: editingTarget.description || '',
        is_active: editingTarget.is_active
      });
    } else {
      setFormData({
        title: '',
        target_amount: '',
        current_amount: '0',
        deadline: '',
        description: '',
        is_active: true
      });
    }
  }, [editingTarget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.target_amount || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const targetData = {
        title: formData.title,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        deadline: formData.deadline,
        description: formData.description,
        is_active: formData.is_active,
        user_id: user.id
      };

      if (editingTarget) {
        const { error } = await supabase
          .from('bounty_targets')
          .update(targetData)
          .eq('id', editingTarget.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Bounty target updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('bounty_targets')
          .insert([targetData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Bounty target created successfully!",
        });
      }

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
      <DialogContent className="max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editingTarget ? 'Edit Bounty Target' : 'Create Bounty Target'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">
              Target Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Q1 2024 Bounty Goal"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_amount" className="text-gray-300">
                Target Amount ($)
              </Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                placeholder="10000"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="current_amount" className="text-gray-300">
                Current Amount ($)
              </Label>
              <Input
                id="current_amount"
                type="number"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                placeholder="0"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="deadline" className="text-gray-300">
              Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this target..."
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {editingTarget ? 'Update Target' : 'Create Target'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
