
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Platform } from '@/types/platform';

interface PlatformSelectorProps {
  platforms: Platform[];
  selectedPlatformId: string;
  onPlatformChange: (platformId: string) => void;
}

export function PlatformSelector({ platforms, selectedPlatformId, onPlatformChange }: PlatformSelectorProps) {
  return (
    <div>
      <Label htmlFor="platform">Platform</Label>
      <Select value={selectedPlatformId} onValueChange={onPlatformChange}>
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
  );
}
