
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Platform } from '@/types/platform';
import { useTheme } from '@/contexts/ThemeContext';

interface PlatformSelectorProps {
  platforms: Platform[];
  selectedPlatformId: string;
  onPlatformChange: (platformId: string) => void;
}

export function PlatformSelector({ platforms, selectedPlatformId, onPlatformChange }: PlatformSelectorProps) {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';

  return (
    <div>
      <Label htmlFor="platform" className={isHackerTheme ? "text-green-400 font-mono" : ""}>Platform</Label>
      <Select value={selectedPlatformId} onValueChange={onPlatformChange}>
        <SelectTrigger className={isHackerTheme ? "bg-black border-green-600 text-green-400 font-mono" : ""}>
          <SelectValue placeholder="Select a platform" />
        </SelectTrigger>
        <SelectContent className={isHackerTheme ? "bg-black border-green-600 text-green-400 font-mono" : ""}>
          {platforms.map((platform) => (
            <SelectItem 
              key={platform.id} 
              value={platform.id} 
              className={isHackerTheme ? "hover:bg-green-950/50" : ""}
            >
              {platform.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
