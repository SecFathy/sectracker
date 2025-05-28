
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Platform {
  id: string;
  name: string;
}

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Platform[];
  onSave: () => void;
}

export function ProgramModal({ isOpen, onClose, platforms, onSave }: ProgramModalProps) {
  const [formData, setFormData] = useState({
    platform_id: '',
    name: '',
    company: '',
    scope: '',
    max_bounty: 0,
    min_bounty: 0,
    program_url: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('programs')
        .insert(formData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Program created successfully!",
      });

      setFormData({
        platform_id: '',
        name: '',
        company: '',
        scope: '',
        max_bounty: 0,
        min_bounty: 0,
        program_url: '',
      });
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
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Bug Bounty Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select value={formData.platform_id} onValueChange={(value) => setFormData({...formData, platform_id: value})}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-gray-700 border-gray-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="bg-gray-700 border-gray-600"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="scope">Scope</Label>
            <Textarea
              id="scope"
              value={formData.scope}
              onChange={(e) => setFormData({...formData, scope: e.target.value})}
              className="bg-gray-700 border-gray-600"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_bounty">Min Bounty ($)</Label>
              <Input
                id="min_bounty"
                type="number"
                step="0.01"
                value={formData.min_bounty}
                onChange={(e) => setFormData({...formData, min_bounty: parseFloat(e.target.value) || 0})}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="max_bounty">Max Bounty ($)</Label>
              <Input
                id="max_bounty"
                type="number"
                step="0.01"
                value={formData.max_bounty}
                onChange={(e) => setFormData({...formData, max_bounty: parseFloat(e.target.value) || 0})}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="program_url">Program URL</Label>
            <Input
              id="program_url"
              type="url"
              value={formData.program_url}
              onChange={(e) => setFormData({...formData, program_url: e.target.value})}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Creating...' : 'Create Program'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
