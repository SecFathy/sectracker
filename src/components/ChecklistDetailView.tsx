
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Trash2, CheckSquare, Monitor, Smartphone, Computer } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ChecklistItemEditor } from './ChecklistItemEditor';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useChecklistData } from '@/hooks/useChecklistData';

interface ChecklistDetailViewProps {
  checklistId: string;
  onBack: () => void;
}

export function ChecklistDetailView({ checklistId, onBack }: ChecklistDetailViewProps) {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);

  const {
    checklists,
    toggleChecklistItem,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem
  } = useChecklistData();

  const checklist = checklists.find(c => c.id === checklistId);

  useEffect(() => {
    if (checklist) {
      console.log('Loading checklist with ID:', checklistId);
      console.log('Found checklist:', checklist);
    }
  }, [checklist, checklistId]);

  if (!checklist) {
    return (
      <div className="space-y-4">
        <Button 
          onClick={onBack} 
          variant="outline"
          className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checklists
        </Button>
        <div className={`text-center py-8 ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
          <h2 className="text-xl font-semibold mb-2">Checklist not found</h2>
          <p className="text-gray-400">The checklist you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
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
      case 'api': return isHackerTheme ? 'bg-orange-900 text-orange-300' : 'bg-orange-600';
      default: return isHackerTheme ? 'bg-gray-900 text-gray-300' : 'bg-gray-600';
    }
  };

  const progress = checklist.items.length > 0 
    ? Math.round((checklist.items.filter(item => item.completed).length / checklist.items.length) * 100)
    : 0;

  const IconComponent = getTypeIcon(checklist.type);

  const handleSaveItem = (text: string) => {
    if (editingItem) {
      updateChecklistItem(checklistId, editingItem, text);
      setEditingItem(null);
    } else {
      addChecklistItem(checklistId, text);
      setShowAddItem(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    deleteChecklistItem(checklistId, itemId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={onBack} 
          variant="outline"
          className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checklists
        </Button>
        
        <Button 
          onClick={() => setShowAddItem(true)}
          className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card className={isHackerTheme ? "bg-black border-green-600" : "bg-gray-800 border-gray-700"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center space-x-3 ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
              <IconComponent className={`h-6 w-6 ${isHackerTheme ? "text-green-400" : "text-blue-400"}`} />
              <span>{checklist.name}</span>
              <Badge className={`${getTypeColor(checklist.type)} text-white`}>
                {checklist.type}
              </Badge>
            </CardTitle>
          </div>
          
          {checklist.description && (
            <p className={`${isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}`}>
              {checklist.description}
            </p>
          )}
          
          <div className="flex items-center space-x-2">
            <div className={`flex-1 ${isHackerTheme ? "bg-green-950" : "bg-gray-700"} rounded-full h-3`}>
              <div 
                className={`${isHackerTheme ? "bg-green-600" : "bg-blue-600"} h-3 rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${isHackerTheme ? "text-green-400 font-mono" : "text-gray-400"}`}>
              {progress}% Complete ({checklist.items.filter(item => item.completed).length}/{checklist.items.length})
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {showAddItem && (
          <Card className={isHackerTheme ? "bg-green-950/20 border-green-600" : "bg-blue-950/20 border-blue-600"}>
            <CardContent className="pt-6">
              <ChecklistItemEditor
                initialText=""
                onSave={handleSaveItem}
                onCancel={() => setShowAddItem(false)}
                isHackerTheme={isHackerTheme}
              />
            </CardContent>
          </Card>
        )}

        {checklist.items.map((item, index) => (
          <Card 
            key={item.id} 
            className={`transition-all ${isHackerTheme ? "bg-black border-green-600/50 hover:border-green-600" : "bg-gray-800 border-gray-700 hover:border-gray-500"}`}
          >
            <CardContent className="pt-6">
              {editingItem === item.id ? (
                <ChecklistItemEditor
                  initialText={item.text}
                  onSave={handleSaveItem}
                  onCancel={() => setEditingItem(null)}
                  isHackerTheme={isHackerTheme}
                />
              ) : (
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={item.completed}
                    onCheckedChange={() => toggleChecklistItem(checklistId, item.id)}
                    className={`mt-1 ${isHackerTheme ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" : "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`${item.completed ? 'opacity-60' : ''}`}>
                      <MarkdownRenderer 
                        content={item.text} 
                        className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingItem(item.id)}
                      className={`${isHackerTheme ? "text-green-400 hover:text-green-300 hover:bg-green-950/50" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {checklist.items.length === 0 && !showAddItem && (
          <Card className={isHackerTheme ? "bg-black border-green-600/50" : "bg-gray-800 border-gray-700"}>
            <CardContent className="text-center py-12">
              <CheckSquare className={`h-12 w-12 mx-auto mb-4 ${isHackerTheme ? "text-green-600" : "text-gray-400"}`} />
              <h3 className={`text-lg font-semibold mb-2 ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                No items yet
              </h3>
              <p className={`mb-4 ${isHackerTheme ? "text-green-300 font-mono" : "text-gray-400"}`}>
                Start building your security checklist by adding items.
              </p>
              <Button 
                onClick={() => setShowAddItem(true)}
                className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
