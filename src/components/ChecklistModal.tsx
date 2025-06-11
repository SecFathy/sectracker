
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ChecklistModal({ isOpen, onClose, onSave }: ChecklistModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    checklist_type: 'web',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('security_checklists')
        .insert({
          ...formData,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Security checklist created successfully!",
      });

      setFormData({
        name: '',
        description: '',
        checklist_type: 'web',
      });
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
          <DialogTitle>Add Security Checklist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Checklist Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-700 border-gray-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="checklist_type">Type</Label>
            <Select value={formData.checklist_type} onValueChange={(value) => setFormData({...formData, checklist_type: value})}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="mobile">Mobile Application</SelectItem>
                <SelectItem value="desktop">Desktop Application</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-700 border-gray-600"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Creating...' : 'Create Checklist'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
