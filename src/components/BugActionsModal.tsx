
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Archive, RotateCcw } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  company: string;
}

interface Bug {
  id: string;
  program_id: string | null;
  title: string;
  description: string | null;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  status: 'Draft' | 'Submitted' | 'Triaged' | 'Accepted' | 'Duplicate' | 'Not Applicable' | 'Resolved' | 'Bounty Awarded';
  vulnerability_type: string | null;
  poc_steps: string | null;
  impact_description: string | null;
  remediation_suggestion: string | null;
  bounty_amount: number | null;
  submission_date: string | null;
  program: Program;
}

interface BugActionsModalProps {
  bug: Bug | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'edit' | 'delete' | 'archive' | 'unarchive';
}

export function BugActionsModal({ bug, isOpen, onClose, onSave, mode }: BugActionsModalProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formData, setFormData] = useState({
    program_id: '',
    title: '',
    description: '',
    severity: 'Medium' as const,
    status: 'Draft' as const,
    vulnerability_type: '',
    poc_steps: '',
    impact_description: '',
    remediation_suggestion: '',
    bounty_amount: 0,
    submission_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && mode === 'edit') {
      fetchPrograms();
      if (bug) {
        setFormData({
          program_id: bug.program_id || '',
          title: bug.title,
          description: bug.description || '',
          severity: bug.severity,
          status: bug.status,
          vulnerability_type: bug.vulnerability_type || '',
          poc_steps: bug.poc_steps || '',
          impact_description: bug.impact_description || '',
          remediation_suggestion: bug.remediation_suggestion || '',
          bounty_amount: bug.bounty_amount || 0,
          submission_date: bug.submission_date || '',
        });
      }
    }
  }, [isOpen, mode, bug]);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name, company')
        .eq('is_active', true);

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bug) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bugs')
        .update({
          ...formData,
          program_id: formData.program_id || null,
          submission_date: formData.submission_date || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bug.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bug report updated successfully!",
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

  const handleDelete = async () => {
    if (!bug) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bugs')
        .delete()
        .eq('id', bug.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bug report deleted successfully!",
      });

      onSave();
      onClose();
      setShowDeleteDialog(false);
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

  const handleArchive = async () => {
    if (!bug) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bugs')
        .update({ 
          status: 'Resolved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bug.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bug report archived successfully!",
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

  const handleUnarchive = async () => {
    if (!bug) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bugs')
        .update({ 
          status: 'Submitted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bug.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bug report unarchived successfully!",
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

  if (mode === 'delete') {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Bug Report</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete "{bug?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (mode === 'archive') {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Archive Bug Report</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to archive "{bug?.title}"? This will mark it as resolved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleArchive}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (mode === 'unarchive') {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Unarchive Bug Report</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to unarchive "{bug?.title}"? This will mark it as submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnarchive}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Unarchiving...' : 'Unarchive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bug Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="program">Program</Label>
              <Select value={formData.program_id} onValueChange={(value) => setFormData({...formData, program_id: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.company} - {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value: any) => setFormData({...formData, severity: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Informational">Informational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Triaged">Triaged</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Duplicate">Duplicate</SelectItem>
                  <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Bounty Awarded">Bounty Awarded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vulnerability_type">Vulnerability Type</Label>
              <Input
                id="vulnerability_type"
                value={formData.vulnerability_type}
                onChange={(e) => setFormData({...formData, vulnerability_type: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="e.g., XSS, SQL Injection, CSRF"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-gray-700 border-gray-600"
              required
            />
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
            <Label htmlFor="poc_steps">Proof of Concept Steps</Label>
            <Textarea
              id="poc_steps"
              value={formData.poc_steps}
              onChange={(e) => setFormData({...formData, poc_steps: e.target.value})}
              className="bg-gray-700 border-gray-600"
              rows={4}
              placeholder="Step-by-step reproduction steps..."
            />
          </div>

          <div>
            <Label htmlFor="impact_description">Impact Description</Label>
            <Textarea
              id="impact_description"
              value={formData.impact_description}
              onChange={(e) => setFormData({...formData, impact_description: e.target.value})}
              className="bg-gray-700 border-gray-600"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="remediation_suggestion">Remediation Suggestion</Label>
            <Textarea
              id="remediation_suggestion"
              value={formData.remediation_suggestion}
              onChange={(e) => setFormData({...formData, remediation_suggestion: e.target.value})}
              className="bg-gray-700 border-gray-600"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bounty_amount">Bounty Amount ($)</Label>
              <Input
                id="bounty_amount"
                type="number"
                step="0.01"
                value={formData.bounty_amount}
                onChange={(e) => setFormData({...formData, bounty_amount: parseFloat(e.target.value) || 0})}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="submission_date">Submission Date</Label>
              <Input
                id="submission_date"
                type="date"
                value={formData.submission_date}
                onChange={(e) => setFormData({...formData, submission_date: e.target.value})}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
              {loading ? 'Updating...' : 'Update Bug Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
