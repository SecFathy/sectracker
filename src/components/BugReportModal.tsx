
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id: string;
  name: string;
  company: string;
  platform_id: string;
}

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: Program[];
  onSave: () => void;
}

export function BugReportModal({ isOpen, onClose, programs, onSave }: BugReportModalProps) {
  const [formData, setFormData] = useState({
    program_id: '',
    title: '',
    description: '',
    severity: '',
    status: 'Draft',
    bounty_amount: 0,
    submission_date: '',
    vulnerability_type: '',
    poc_steps: '',
    impact_description: '',
    remediation_suggestion: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const severityOptions = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
  const statusOptions = ['Draft', 'Submitted', 'Triaged', 'Accepted', 'Duplicate', 'Not Applicable', 'Resolved', 'Bounty Awarded'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bugs')
        .insert({
          user_id: user.data.user.id,
          ...formData,
          bounty_amount: formData.bounty_amount || null,
          submission_date: formData.submission_date || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bug report created successfully!",
      });

      setFormData({
        program_id: '',
        title: '',
        description: '',
        severity: '',
        status: 'Draft',
        bounty_amount: 0,
        submission_date: '',
        vulnerability_type: '',
        poc_steps: '',
        impact_description: '',
        remediation_suggestion: '',
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
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bug Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="program">Program</Label>
            <Select value={formData.program_id} onValueChange={(value) => setFormData({...formData, program_id: value})}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name} ({program.company})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Bug Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-gray-700 border-gray-600"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {severityOptions.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
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
                placeholder="e.g., XSS, SQL Injection"
              />
            </div>
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-700 border-gray-600"
              rows={4}
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Creating...' : 'Create Bug Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
