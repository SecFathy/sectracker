
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlatformProfileFormData } from '@/types/platform';

interface PlatformFormFieldsProps {
  formData: PlatformProfileFormData;
  setFormData: (data: PlatformProfileFormData) => void;
}

export function PlatformFormFields({ formData, setFormData }: PlatformFormFieldsProps) {
  return (
    <>
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
    </>
  );
}
