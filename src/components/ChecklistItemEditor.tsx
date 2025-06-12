
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Save, X } from 'lucide-react';

interface ChecklistItemEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialText: string;
  title: string;
}

export function ChecklistItemEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  initialText, 
  title 
}: ChecklistItemEditorProps) {
  const [text, setText] = useState(initialText);

  const handleSave = () => {
    onSave(text.trim());
    onClose();
  };

  const handleClose = () => {
    setText(initialText); // Reset to original text
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Item Text</Label>
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="write" className="data-[state=active]:bg-gray-600">Write</TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-gray-600">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="mt-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter item text (markdown supported)..."
                  className="bg-gray-700 border-gray-600 min-h-[200px] font-mono"
                  rows={8}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleSave();
                    } else if (e.key === 'Escape') {
                      handleClose();
                    }
                  }}
                  autoFocus
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div className="bg-gray-700 border border-gray-600 rounded p-4 min-h-[200px]">
                  {text.trim() ? (
                    <MarkdownRenderer content={text} />
                  ) : (
                    <p className="text-gray-400 italic">Preview will appear here...</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
