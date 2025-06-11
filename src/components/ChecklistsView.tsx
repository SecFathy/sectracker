
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckSquare, Monitor, Smartphone, Computer } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ChecklistDetailView } from './ChecklistDetailView';

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

export function ChecklistsView() {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<Checklist[]>([
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
  ]);

  if (selectedChecklistId) {
    return (
      <ChecklistDetailView 
        checklistId={selectedChecklistId} 
        onBack={() => setSelectedChecklistId(null)} 
      />
    );
  }

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
      case 'web': return isHackerTheme ? 'bg-blue-900 text-blue-300' : 'bg-blue-600';
      case 'mobile': return isHackerTheme ? 'bg-green-900 text-green-300' : 'bg-green-600';
      case 'desktop': return isHackerTheme ? 'bg-purple-900 text-purple-300' : 'bg-purple-600';
      default: return isHackerTheme ? 'bg-gray-900 text-gray-300' : 'bg-gray-600';
    }
  };

  const toggleItem = (checklistId: string, itemId: string) => {
    setChecklists(checklists.map(checklist => 
      checklist.id === checklistId 
        ? {
            ...checklist,
            items: checklist.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          }
        : checklist
    ));
  };

  const getProgress = (checklist: Checklist) => {
    const completed = checklist.items.filter(item => item.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
          Security Checklists
        </h1>
        <Button className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700"}>
          <Plus className="h-4 w-4 mr-2" />
          Add Checklist
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {checklists.map((checklist) => {
          const IconComponent = getTypeIcon(checklist.type);
          const progress = getProgress(checklist);
          
          return (
            <Card 
              key={checklist.id} 
              className={`cursor-pointer transition-all hover:scale-105 ${isHackerTheme ? "bg-black border-green-600 hover:border-green-400" : "bg-gray-800 border-gray-700 hover:border-gray-500"}`}
              onClick={() => setSelectedChecklistId(checklist.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`flex items-center space-x-2 ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                    <IconComponent className={`h-5 w-5 ${isHackerTheme ? "text-green-400" : "text-blue-400"}`} />
                    <span>{checklist.name}</span>
                  </CardTitle>
                  <Badge className={`${getTypeColor(checklist.type)} text-white`}>
                    {checklist.type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex-1 ${isHackerTheme ? "bg-green-950" : "bg-gray-700"} rounded-full h-2`}>
                    <div 
                      className={`${isHackerTheme ? "bg-green-600" : "bg-blue-600"} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={`text-sm ${isHackerTheme ? "text-green-400 font-mono" : "text-gray-400"}`}>
                    {progress}%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklist.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`${checklist.id}-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={(e) => {
                          e.preventDefault();
                          toggleItem(checklist.id, item.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={isHackerTheme ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" : "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"}
                      />
                      <label
                        htmlFor={`${checklist.id}-${item.id}`}
                        className={`flex-1 text-sm cursor-pointer ${
                          item.completed 
                            ? isHackerTheme ? 'text-green-600 line-through font-mono' : 'text-gray-400 line-through'
                            : isHackerTheme ? 'text-green-300 font-mono' : 'text-gray-300'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.text}
                      </label>
                    </div>
                  ))}
                  {checklist.items.length > 3 && (
                    <p className={`text-sm ${isHackerTheme ? "text-green-500 font-mono" : "text-gray-500"}`}>
                      +{checklist.items.length - 3} more items...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
