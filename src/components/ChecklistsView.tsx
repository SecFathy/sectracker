
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckSquare, Monitor, Smartphone, DesktopIcon } from 'lucide-react';

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return Monitor;
      case 'mobile': return Smartphone;
      case 'desktop': return DesktopIcon;
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
        <h1 className="text-3xl font-bold text-white">Security Checklists</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Checklist
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {checklists.map((checklist) => {
          const IconComponent = getTypeIcon(checklist.type);
          const progress = getProgress(checklist);
          
          return (
            <Card key={checklist.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-blue-400" />
                    <span>{checklist.name}</span>
                  </CardTitle>
                  <Badge className={`${getTypeColor(checklist.type)} text-white`}>
                    {checklist.type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">{progress}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklist.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`${checklist.id}-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(checklist.id, item.id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label
                        htmlFor={`${checklist.id}-${item.id}`}
                        className={`flex-1 text-sm cursor-pointer ${
                          item.completed 
                            ? 'text-gray-400 line-through' 
                            : 'text-gray-300'
                        }`}
                      >
                        {item.text}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
