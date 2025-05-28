
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (tip: any) => void;
  tip?: any;
  viewMode?: boolean;
}

export function TipModal({ isOpen, onClose, onSave, tip, viewMode = false }: TipModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (tip) {
      setTitle(tip.title);
      setCategory(tip.category);
      setContent(tip.content);
      setTags(tip.tags.join(', '));
    } else {
      setTitle('');
      setCategory('');
      setContent('');
      setTags('');
    }
  }, [tip]);

  const handleSave = () => {
    if (title && category && content && onSave) {
      onSave({
        title,
        category,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      setTitle('');
      setCategory('');
      setContent('');
      setTags('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{viewMode ? 'View Tip' : 'Add New Tip'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., XSS in AngularJS Applications"
              className="bg-gray-700 border-gray-600 text-white"
              readOnly={viewMode}
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-300">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., XSS, SQL Injection, CSRF"
              className="bg-gray-700 border-gray-600 text-white"
              readOnly={viewMode}
            />
          </div>
          <div>
            <Label htmlFor="content" className="text-gray-300">
              Content
              {viewMode && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(content)}
                  className="ml-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed tip, payload, or technique..."
              className="bg-gray-700 border-gray-600 text-white font-mono"
              rows={viewMode ? 15 : 8}
              readOnly={viewMode}
            />
          </div>
          <div>
            <Label htmlFor="tags" className="text-gray-300">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., xss, angularjs, javascript"
              className="bg-gray-700 border-gray-600 text-white"
              readOnly={viewMode}
            />
            {viewMode && tip && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tip.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {!viewMode && (
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save Tip
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              {viewMode ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
