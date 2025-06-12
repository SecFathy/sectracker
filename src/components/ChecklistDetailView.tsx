import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Monitor, Smartphone, Computer, CheckSquare, Plus, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { ChecklistItemEditor } from '@/components/ChecklistItemEditor';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

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

// Mock data - same as used in ChecklistsView
const getMockChecklists = (): Checklist[] => [
  {
    id: '1',
    name: 'Web Application Security',
    type: 'web',
    items: [
      { id: '1', text: '**SQL Injection Testing**\n\nTest for SQL injection vulnerabilities in all input fields and parameters.', completed: true },
      { id: '2', text: '**Cross-Site Scripting (XSS)**\n\n- Test for Reflected XSS\n- Test for Stored XSS\n- Test for DOM-based XSS', completed: true },
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

export function ChecklistDetailView({ checklistId, onBack }: ChecklistDetailViewProps) {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  const { toast } = useToast();
  
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; text: string } | null>(null);
  const [showNewItemEditor, setShowNewItemEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChecklist = () => {
      console.log('Loading checklist with ID:', checklistId);
      const mockChecklists = getMockChecklists();
      const found = mockChecklists.find(c => c.id === checklistId);
      
      if (found) {
        console.log('Found checklist:', found);
        setChecklist(found);
      } else {
        console.log('Checklist not found. Available IDs:', mockChecklists.map(c => c.id));
        setChecklist(null);
      }
      setLoading(false);
    };

    loadChecklist();
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
    setEditingItem({ id: itemId, text: currentText });
  };

  const saveEditedItem = (newText: string) => {
    if (!checklist || !editingItem) return;

    setChecklist({
      ...checklist,
      items: checklist.items.map(item =>
        item.id === editingItem.id ? { ...item, text: newText } : item
      )
    });

    setEditingItem(null);
    
    toast({
      title: "Success",
      description: "Checklist item updated successfully"
    });
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

  const addNewItem = (text: string) => {
    if (!checklist || !text.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false
    };

    setChecklist({
      ...checklist,
      items: [...checklist.items, newItem]
    });

    setShowNewItemEditor(false);
    
    toast({
      title: "Success",
      description: "New checklist item added successfully"
    });
  };

  const getProgress = () => {
    if (!checklist) return 0;
    const completed = checklist.items.filter(item => item.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={isHackerTheme ? "text-green-400 font-mono" : "text-gray-400"}>
          Loading checklist...
        </p>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : ""}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checklists
        </Button>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className={isHackerTheme ? "text-green-400 font-mono text-lg mb-2" : "text-gray-400 text-lg mb-2"}>
              Checklist not found
            </p>
            <p className={isHackerTheme ? "text-green-300 font-mono text-sm" : "text-gray-500 text-sm"}>
              The requested checklist could not be loaded. Please go back and try again.
            </p>
          </div>
        </div>
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
          onClick={() => setShowNewItemEditor(true)}
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
              <div key={item.id} className={`flex items-start space-x-3 p-3 rounded ${isHackerTheme ? "bg-green-950/20 border border-green-800" : "bg-gray-700/50"}`}>
                <Checkbox
                  id={`${checklist.id}-${item.id}`}
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                  className={`mt-1 ${isHackerTheme ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" : "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"}`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className={`${item.completed 
                    ? isHackerTheme ? 'opacity-60' : 'opacity-60'
                    : ''
                  }`}>
                    <MarkdownRenderer 
                      content={item.text} 
                      className={item.completed ? 'line-through' : ''}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-1 flex-shrink-0">
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Item Modal */}
      {editingItem && (
        <ChecklistItemEditor
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSave={saveEditedItem}
          initialText={editingItem.text}
          title="Edit Checklist Item"
        />
      )}

      {/* Add New Item Modal */}
      <ChecklistItemEditor
        isOpen={showNewItemEditor}
        onClose={() => setShowNewItemEditor(false)}
        onSave={addNewItem}
        initialText=""
        title="Add New Checklist Item"
      />
    </div>
  );
}
