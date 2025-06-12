
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ChecklistModal({ isOpen, onClose, onSave }: ChecklistModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    checklist_type: 'web',
  });
  const [checklistItems, setChecklistItems] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create the checklist first
      const { data: checklist, error: checklistError } = await supabase
        .from('security_checklists')
        .insert({
          ...formData,
          user_id: user.id,
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // Parse markdown items and create checklist items
      if (checklistItems.trim()) {
        const lines = checklistItems.split('\n').filter(line => line.trim());
        const items = lines.map((line, index) => ({
          text: line.replace(/^[-*+]\s*/, '').trim(), // Remove markdown list markers
          checklist_id: checklist.id,
          order_index: index,
          is_completed: false
        }));

        const { error: itemsError } = await supabase
          .from('checklist_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Security checklist created successfully!",
      });

      setFormData({
        name: '',
        description: '',
        checklist_type: 'web',
      });
      setChecklistItems('');
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Security Checklist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Checklist Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-700 border-gray-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="checklist_type">Type</Label>
            <Select value={formData.checklist_type} onValueChange={(value) => setFormData({...formData, checklist_type: value})}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="mobile">Mobile Application</SelectItem>
                <SelectItem value="desktop">Desktop Application</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-700 border-gray-600"
              rows={3}
            />
          </div>

          <div>
            <Label>Checklist Items</Label>
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="write" className="data-[state=active]:bg-gray-600">Write</TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-gray-600">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="mt-2">
                <Textarea
                  value={checklistItems}
                  onChange={(e) => setChecklistItems(e.target.value)}
                  placeholder="Enter checklist items (one per line):&#10;- Test for SQL Injection&#10;- Check for XSS vulnerabilities&#10;- Verify authentication mechanisms"
                  className="bg-gray-700 border-gray-600 min-h-[200px] font-mono"
                  rows={8}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div className="bg-gray-700 border border-gray-600 rounded p-4 min-h-[200px]">
                  {checklistItems.trim() ? (
                    <MarkdownRenderer content={checklistItems} />
                  ) : (
                    <p className="text-gray-400 italic">Preview will appear here...</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Creating...' : 'Create Checklist'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
