
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Checklist {
  id: string;
  name: string;
  type: 'web' | 'mobile' | 'desktop' | 'api';
  description?: string;
}

interface ChecklistEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (checklist: Checklist) => void;
  checklist: Checklist;
}

export function ChecklistEditModal({ isOpen, onClose, onSave, checklist }: ChecklistEditModalProps) {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  
  const [formData, setFormData] = useState({
    name: checklist.name,
    type: checklist.type,
    description: checklist.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...checklist,
      ...formData,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: checklist.name,
      type: checklist.type,
      description: checklist.description || '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl ${isHackerTheme ? "bg-black border-green-600 text-green-400" : "bg-gray-800 border-gray-700 text-white"}`}>
        <DialogHeader>
          <DialogTitle className={isHackerTheme ? "text-green-400 font-mono" : "text-white"}>
            Edit Checklist
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
              Checklist Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
              required
            />
          </div>

          <div>
            <Label htmlFor="type" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
              Type
            </Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as 'web' | 'mobile' | 'desktop' | 'api'})}>
              <SelectTrigger className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isHackerTheme ? "bg-green-950 border-green-600" : "bg-gray-700 border-gray-600"}>
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="mobile">Mobile Application</SelectItem>
                <SelectItem value="desktop">Desktop Application</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
              rows={3}
            />
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
              type="submit"
              className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700 text-white"}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
