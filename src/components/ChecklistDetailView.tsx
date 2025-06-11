
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Monitor, Smartphone, Computer, CheckSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Checklist {
  id: string;
  name: string;
  type: 'web' | 'mobile' | 'desktop' | 'api';
  items: ChecklistItem[];
}

interface ChecklistDetailViewProps {
  checklistId: string;
  onBack: () => void;
}

export function ChecklistDetailView({ checklistId, onBack }: ChecklistDetailViewProps) {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  
  const [checklist, setChecklist] = useState<Checklist | null>(null);

  useEffect(() => {
    // Mock data - in real app, fetch from database
    const mockChecklists: Checklist[] = [
      {
        id: '1',
        name: 'Web Application Security',
        type: 'web',
        items: [
          { id: '1', text: 'Test for SQL Injection', completed: true },
          { id: '2', text: 'Test for XSS (Reflected, Stored, DOM)', completed: true },
          { id: '3', text: 'Test for CSRF vulnerabilities', completed: false },
          { id: '4', text: 'Check for insecure direct object references', completed: false },
          { id: '5', text: 'Test authentication bypass', completed: false },
          { id: '6', text: 'Check for session management issues', completed: false },
          { id: '7', text: 'Test for directory traversal', completed: false },
          { id: '8', text: 'Check for command injection', completed: false }
        ]
      },
      {
        id: '2',
        name: 'Mobile Application Security',
        type: 'mobile',
        items: [
          { id: '1', text: 'Test for insecure data storage', completed: false },
          { id: '2', text: 'Check for weak cryptography', completed: false },
          { id: '3', text: 'Test for insecure communication', completed: false },
          { id: '4', text: 'Check for improper platform usage', completed: false },
          { id: '5', text: 'Test for reverse engineering protection', completed: false }
        ]
      }
    ];

    const found = mockChecklists.find(c => c.id === checklistId);
    setChecklist(found || null);
  }, [checklistId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return Monitor;
      case 'mobile': return Smartphone;
      case 'desktop': return Computer;
      default: return CheckSquare;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'web': return 'bg-blue-600';
      case 'mobile': return 'bg-green-600';
      case 'desktop': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const toggleItem = (itemId: string) => {
    if (!checklist) return;
    
    setChecklist({
      ...checklist,
      items: checklist.items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    });
  };

  const getProgress = () => {
    if (!checklist) return 0;
    const completed = checklist.items.filter(item => item.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  if (!checklist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={isHackerTheme ? "text-green-400 font-mono" : "text-gray-400"}>
          Checklist not found
        </p>
      </div>
    );
  }

  const IconComponent = getTypeIcon(checklist.type);
  const progress = getProgress();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : ""}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checklists
        </Button>
      </div>

      <Card className={isHackerTheme ? "bg-black border-green-600" : "bg-gray-800 border-gray-700"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center space-x-2 ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
              <IconComponent className={`h-6 w-6 ${isHackerTheme ? "text-green-400" : "text-blue-400"}`} />
              <span>{checklist.name}</span>
            </CardTitle>
            <Badge className={`${getTypeColor(checklist.type)} text-white`}>
              {checklist.type}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 ${isHackerTheme ? "bg-green-950" : "bg-gray-700"} rounded-full h-3`}>
              <div 
                className={`${isHackerTheme ? "bg-green-500" : "bg-blue-600"} h-3 rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`text-sm ${isHackerTheme ? "text-green-400 font-mono" : "text-gray-400"}`}>
              {progress}% ({checklist.items.filter(i => i.completed).length}/{checklist.items.length})
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklist.items.map((item) => (
              <div key={item.id} className={`flex items-center space-x-3 p-3 rounded ${isHackerTheme ? "bg-green-950/20 border border-green-800" : "bg-gray-700/50"}`}>
                <Checkbox
                  id={`${checklist.id}-${item.id}`}
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                  className={isHackerTheme ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" : "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"}
                />
                <label
                  htmlFor={`${checklist.id}-${item.id}`}
                  className={`flex-1 cursor-pointer ${
                    item.completed 
                      ? isHackerTheme ? 'text-green-600 line-through font-mono' : 'text-gray-400 line-through'
                      : isHackerTheme ? 'text-green-300 font-mono' : 'text-gray-300'
                  }`}
                >
                  {item.text}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
