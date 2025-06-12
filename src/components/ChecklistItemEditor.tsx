
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Save, X } from 'lucide-react';

interface ChecklistItemEditorProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave: (text: string) => void;
  onCancel?: () => void;
  initialText: string;
  title?: string;
  isHackerTheme?: boolean;
}

export function ChecklistItemEditor({ 
  isOpen = true,
  onClose, 
  onSave, 
  onCancel,
  initialText, 
  title = "Edit Item",
  isHackerTheme = false
}: ChecklistItemEditorProps) {
  const [text, setText] = useState(initialText);

  const handleSave = () => {
    onSave(text.trim());
    if (onClose) onClose();
  };

  const handleClose = () => {
    setText(initialText); // Reset to original text
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  // If no dialog is needed (inline editing)
  if (!isOpen && onClose === undefined) {
    return (
      <div className="space-y-4">
        <div>
          <Label>Item Text</Label>
          <Tabs defaultValue="write" className="w-full">
            <TabsList className={`grid w-full grid-cols-2 ${isHackerTheme ? "bg-green-950" : "bg-gray-700"}`}>
              <TabsTrigger value="write" className={isHackerTheme ? "data-[state=active]:bg-green-900" : "data-[state=active]:bg-gray-600"}>Write</TabsTrigger>
              <TabsTrigger value="preview" className={isHackerTheme ? "data-[state=active]:bg-green-900" : "data-[state=active]:bg-gray-600"}>Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter item text (markdown supported)..."
                className={`${isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600"} min-h-[200px] font-mono`}
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
              <div className={`${isHackerTheme ? "bg-green-950 border-green-600" : "bg-gray-700 border-gray-600"} border rounded p-4 min-h-[200px]`}>
                {text.trim() ? (
                  <MarkdownRenderer content={text} />
                ) : (
                  <p className={`${isHackerTheme ? "text-green-500 font-mono" : "text-gray-400"} italic`}>Preview will appear here...</p>
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
            className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-green-600 hover:bg-green-700"}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isHackerTheme ? "bg-black border-green-600 text-green-300" : "bg-gray-800 border-gray-700 text-white"} max-w-2xl max-h-[80vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={isHackerTheme ? "text-green-400 font-mono" : "text-white"}>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className={isHackerTheme ? "text-green-300 font-mono" : "text-white"}>Item Text</Label>
            <Tabs defaultValue="write" className="w-full">
              <TabsList className={`grid w-full grid-cols-2 ${isHackerTheme ? "bg-green-950" : "bg-gray-700"}`}>
                <TabsTrigger value="write" className={isHackerTheme ? "data-[state=active]:bg-green-900" : "data-[state=active]:bg-gray-600"}>Write</TabsTrigger>
                <TabsTrigger value="preview" className={isHackerTheme ? "data-[state=active]:bg-green-900" : "data-[state=active]:bg-gray-600"}>Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="mt-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter item text (markdown supported)..."
                  className={`${isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600"} min-h-[200px] font-mono`}
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
                <div className={`${isHackerTheme ? "bg-green-950 border-green-600" : "bg-gray-700 border-gray-600"} border rounded p-4 min-h-[200px]`}>
                  {text.trim() ? (
                    <MarkdownRenderer content={text} />
                  ) : (
                    <p className={`${isHackerTheme ? "text-green-500 font-mono" : "text-gray-400"} italic`}>Preview will appear here...</p>
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
              className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-green-600 hover:bg-green-700"}
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
