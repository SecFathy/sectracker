
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Monitor, Smartphone, Computer, CheckSquare, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [showNewItemInput, setShowNewItemInput] = useState(false);

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

  const startEditingItem = (itemId: string, currentText: string) => {
    setEditingItem(itemId);
    setEditText(currentText);
  };

  const saveEditedItem = (itemId: string) => {
    if (!checklist || !editText.trim()) return;

    setChecklist({
      ...checklist,
      items: checklist.items.map(item =>
        item.id === itemId ? { ...item, text: editText.trim() } : item
      )
    });

    setEditingItem(null);
    setEditText('');
    
    toast({
      title: "Success",
      description: "Checklist item updated successfully"
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditText('');
  };

  const deleteItem = (itemId: string) => {
    if (!checklist) return;

    setChecklist({
      ...checklist,
      items: checklist.items.filter(item => item.id !== itemId)
    });

    toast({
      title: "Success",
      description: "Checklist item deleted successfully"
    });
  };

  const addNewItem = () => {
    if (!checklist || !newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false
    };

    setChecklist({
      ...checklist,
      items: [...checklist.items, newItem]
    });

    setNewItemText('');
    setShowNewItemInput(false);
    
    toast({
      title: "Success",
      description: "New checklist item added successfully"
    });
  };

  const cancelNewItem = () => {
    setNewItemText('');
    setShowNewItemInput(false);
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
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : ""}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checklists
        </Button>
        
        <Button
          onClick={() => setShowNewItemInput(true)}
          className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
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
                
                {editingItem === item.id ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className={`flex-1 ${isHackerTheme ? "bg-green-950 border-green-700 text-green-300 font-mono" : "bg-gray-600 border-gray-500 text-white"}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditedItem(item.id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => saveEditedItem(item.id)}
                      className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black" : "bg-blue-600 hover:bg-blue-700"}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50" : ""}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
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
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingItem(item.id, item.text)}
                        className={`${isHackerTheme ? "text-green-400 hover:text-green-300 hover:bg-green-950/50" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteItem(item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {showNewItemInput && (
              <div className={`flex items-center space-x-3 p-3 rounded ${isHackerTheme ? "bg-green-950/20 border border-green-800" : "bg-gray-700/50"}`}>
                <div className="w-5" /> {/* Spacer for checkbox alignment */}
                <Input
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Enter new checklist item..."
                  className={`flex-1 ${isHackerTheme ? "bg-green-950 border-green-700 text-green-300 font-mono placeholder:text-green-600" : "bg-gray-600 border-gray-500 text-white placeholder:text-gray-400"}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addNewItem();
                    if (e.key === 'Escape') cancelNewItem();
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={addNewItem}
                  className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black" : "bg-blue-600 hover:bg-blue-700"}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelNewItem}
                  className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50" : ""}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
