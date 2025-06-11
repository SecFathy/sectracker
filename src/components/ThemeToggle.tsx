
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon, Terminal } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'hacker':
        return <Terminal className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'hacker') => setTheme(value)}>
      <SelectTrigger className="w-[140px]">
        <div className="flex items-center gap-2">
          {getIcon()}
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Light
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Dark
          </div>
        </SelectItem>
        <SelectItem value="hacker">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Hacker
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
