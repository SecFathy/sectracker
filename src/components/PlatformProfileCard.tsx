
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  url: string;
  platform_type: string;
  description: string;
}

interface UserPlatformProfile {
  id: string;
  platform_id: string;
  username: string;
  profile_url: string;
  reputation_points: number;
  rank_position: string;
  total_bounties_earned: number;
  bugs_submitted: number;
  bugs_accepted: number;
  platform: Platform;
}

interface PlatformProfileCardProps {
  profile: UserPlatformProfile;
}

export function PlatformProfileCard({ profile }: PlatformProfileCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Target className="h-5 w-5 text-cyan-400" />
            <span>{profile.platform.name}</span>
          </CardTitle>
          <Badge className="bg-cyan-600 text-white">
            {profile.platform.platform_type}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">@{profile.username}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Reputation</span>
            <span className="text-cyan-400 font-bold">{profile.reputation_points}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Rank</span>
            <span className="text-white">{profile.rank_position || 'Unranked'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Total Bounties</span>
            <span className="text-green-400 font-bold">${profile.total_bounties_earned}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Bugs Submitted</span>
            <span className="text-white">{profile.bugs_submitted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Bugs Accepted</span>
            <span className="text-green-400">{profile.bugs_accepted}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
