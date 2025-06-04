
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
      <Label htmlFor="platform" className="text-green-400 font-mono">Platform</Label>
      <Select value={selectedPlatformId} onValueChange={onPlatformChange}>
        <SelectTrigger className="bg-black border-green-600 text-green-400 font-mono">
          <SelectValue placeholder="Select a platform" />
        </SelectTrigger>
        <SelectContent className="bg-black border-green-600 text-green-400 font-mono">
          {platforms.map((platform) => (
            <SelectItem key={platform.id} value={platform.id} className="hover:bg-green-950/50">
              {platform.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
