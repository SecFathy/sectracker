
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/ThemeContext';

interface BountyTarget {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string;
  isActive: boolean;
}

interface BountyTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (target: Omit<BountyTarget, 'id'>) => void;
  editingTarget?: BountyTarget | null;
}

export function BountyTargetModal({ isOpen, onClose, onSave, editingTarget }: BountyTargetModalProps) {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (editingTarget) {
      setFormData({
        title: editingTarget.title,
        targetAmount: editingTarget.targetAmount.toString(),
        currentAmount: editingTarget.currentAmount.toString(),
        deadline: editingTarget.deadline,
        description: editingTarget.description || '',
        isActive: editingTarget.isActive
      });
    } else {
      setFormData({
        title: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
        description: '',
        isActive: true
      });
    }
  }, [editingTarget, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      return;
    }

    onSave({
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
      description: formData.description,
      isActive: formData.isActive
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${isHackerTheme ? "bg-black border-green-600 text-green-400" : "bg-gray-800 border-gray-700 text-white"}`}>
        <DialogHeader>
          <DialogTitle className={isHackerTheme ? "text-green-400 font-mono" : "text-white"}>
            {editingTarget ? 'Edit Bounty Target' : 'Create Bounty Target'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className={isHackerTheme ? "text-green-400 font-mono" : "text-gray-300"}>
              Target Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Q1 2024 Bounty Goal"
              className={isHackerTheme ? "bg-green-950 border-green-600 text-green-400 font-mono placeholder:text-green-600" : "bg-gray-700 border-gray-600 text-white"}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetAmount" className={isHackerTheme ? "text-green-400 font-mono" : "text-gray-300"}>
                Target Amount ($)
              </Label>
              <Input
                id="targetAmount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="10000"
                className={isHackerTheme ? "bg-green-950 border-green-600 text-green-400 font-mono placeholder:text-green-600" : "bg-gray-700 border-gray-600 text-white"}
                required
              />
            </div>
            <div>
              <Label htmlFor="currentAmount" className={isHackerTheme ? "text-green-400 font-mono" : "text-gray-300"}>
                Current Amount ($)
              </Label>
              <Input
                id="currentAmount"
                type="number"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                placeholder="0"
                className={isHackerTheme ? "bg-green-950 border-green-600 text-green-400 font-mono placeholder:text-green-600" : "bg-gray-700 border-gray-600 text-white"}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="deadline" className={isHackerTheme ? "text-green-400 font-mono" : "text-gray-300"}>
              Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className={isHackerTheme ? "bg-green-950 border-green-600 text-green-400 font-mono" : "bg-gray-700 border-gray-600 text-white"}
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className={isHackerTheme ? "text-green-400 font-mono" : "text-gray-300"}>
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this target..."
              className={isHackerTheme ? "bg-green-950 border-green-600 text-green-400 font-mono placeholder:text-green-600" : "bg-gray-700 border-gray-600 text-white"}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950 font-mono" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700"}
            >
              {editingTarget ? 'Update Target' : 'Create Target'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
