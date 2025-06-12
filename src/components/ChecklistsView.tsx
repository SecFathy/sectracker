
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckSquare, Monitor, Smartphone, Computer, Edit, Trash2, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ChecklistDetailView } from './ChecklistDetailView';
import { ChecklistModal } from './ChecklistModal';
import { ChecklistEditModal } from './ChecklistEditModal';
import { ConfigurationModal } from './ConfigurationModal';
import { useChecklistData } from '@/hooks/useChecklistData';

export function ChecklistsView() {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<any>(null);

  const {
    checklists,
    loading,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    toggleChecklistItem,
    refetch
  } = useChecklistData();

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
      case 'api': return isHackerTheme ? 'bg-orange-900 text-orange-300' : 'bg-orange-600';
      default: return isHackerTheme ? 'bg-gray-900 text-gray-300' : 'bg-gray-600';
    }
  };

  const getProgress = (checklist: any) => {
    if (!checklist.items || checklist.items.length === 0) return 0;
    const completed = checklist.items.filter((item: any) => item.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
          Loading checklists...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
          Security Checklists
        </h1>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowConfigModal(true)}
            variant="outline"
            className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
          <Button 
            onClick={() => setShowChecklistModal(true)}
            className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Checklist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {checklists.map((checklist) => {
          const IconComponent = getTypeIcon(checklist.type);
          const progress = getProgress(checklist);
          
          return (
            <Card 
              key={checklist.id} 
              className={`transition-all hover:scale-105 ${isHackerTheme ? "bg-black border-green-600 hover:border-green-400" : "bg-gray-800 border-gray-700 hover:border-gray-500"}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle 
                    className={`flex items-center space-x-2 cursor-pointer ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}
                    onClick={() => setSelectedChecklistId(checklist.id)}
                  >
                    <IconComponent className={`h-5 w-5 ${isHackerTheme ? "text-green-400" : "text-blue-400"}`} />
                    <span>{checklist.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getTypeColor(checklist.type)} text-white`}>
                      {checklist.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingChecklist(checklist);
                      }}
                      className={`${isHackerTheme ? "text-green-400 hover:text-green-300 hover:bg-green-950/50" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChecklist(checklist.id);
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
              <CardContent onClick={() => setSelectedChecklistId(checklist.id)} className="cursor-pointer">
                <div className="space-y-3">
                  {(checklist.items || []).slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`${checklist.id}-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => toggleChecklistItem(checklist.id, item.id)}
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
                        {item.text.split('\n')[0].replace(/\*\*/g, '')}
                      </label>
                    </div>
                  ))}
                  {(checklist.items?.length || 0) > 3 && (
                    <p className={`text-sm ${isHackerTheme ? "text-green-500 font-mono" : "text-gray-500"}`}>
                      +{(checklist.items?.length || 0) - 3} more items...
                    </p>
                  )}
                  {(!checklist.items || checklist.items.length === 0) && (
                    <p className={`text-sm ${isHackerTheme ? "text-green-500 font-mono" : "text-gray-500"}`}>
                      No items yet. Click to add items.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        onSave={() => {
          refetch();
          setShowChecklistModal(false);
        }}
      />

      <ConfigurationModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />

      {editingChecklist && (
        <ChecklistEditModal
          isOpen={true}
          onClose={() => setEditingChecklist(null)}
          onSave={(updatedChecklistData) => {
            // Ensure we have the items property when updating
            const checklistWithItems = {
              ...editingChecklist,
              ...updatedChecklistData,
              items: editingChecklist.items || []
            };
            updateChecklist(checklistWithItems);
            setEditingChecklist(null);
          }}
          checklist={editingChecklist}
        />
      )}
    </div>
  );
}
