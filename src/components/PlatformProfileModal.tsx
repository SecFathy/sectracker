
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Platform {
  id: string;
  name: string;
}

interface PlatformProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Platform[];
  onSave: () => void;
}

export function PlatformProfileModal({ isOpen, onClose, platforms, onSave }: PlatformProfileModalProps) {
  const [formData, setFormData] = useState({
    platform_id: '',
    username: '',
    profile_url: '',
    reputation_points: 0,
    rank_position: '',
    total_bounties_earned: 0,
    bugs_submitted: 0,
    bugs_accepted: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_platform_profiles')
        .insert({
          user_id: user.data.user.id,
          ...formData,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform profile created successfully!",
      });

      setFormData({
        platform_id: '',
        username: '',
        profile_url: '',
        reputation_points: 0,
        rank_position: '',
        total_bounties_earned: 0,
        bugs_submitted: 0,
        bugs_accepted: 0,
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
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Add Platform Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select value={formData.platform_id} onValueChange={(value) => setFormData({...formData, platform_id: value})}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="bg-gray-700 border-gray-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="profile_url">Profile URL</Label>
            <Input
              id="profile_url"
              type="url"
              value={formData.profile_url}
              onChange={(e) => setFormData({...formData, profile_url: e.target.value})}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reputation_points">Reputation Points</Label>
              <Input
                id="reputation_points"
                type="number"
                value={formData.reputation_points}
                onChange={(e) => setFormData({...formData, reputation_points: parseInt(e.target.value) || 0})}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="rank_position">Rank Position</Label>
              <Input
                id="rank_position"
                value={formData.rank_position}
                onChange={(e) => setFormData({...formData, rank_position: e.target.value})}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="total_bounties_earned">Total Bounties ($)</Label>
              <Input
                id="total_bounties_earned"
                type="number"
                step="0.01"
                value={formData.total_bounties_earned}
                onChange={(e) => setFormData({...formData, total_bounties_earned: parseFloat(e.target.value) || 0})}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="bugs_submitted">Bugs Submitted</Label>
              <Input
                id="bugs_submitted"
                type="number"
                value={formData.bugs_submitted}
                onChange={(e) => setFormData({...formData, bugs_submitted: parseInt(e.target.value) || 0})}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="bugs_accepted">Bugs Accepted</Label>
              <Input
                id="bugs_accepted"
                type="number"
                value={formData.bugs_accepted}
                onChange={(e) => setFormData({...formData, bugs_accepted: parseInt(e.target.value) || 0})}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
              {loading ? 'Creating...' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
