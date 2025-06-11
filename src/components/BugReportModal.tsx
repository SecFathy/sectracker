
import React, { useState, useEffect } from 'react';
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

interface Program {
  id: string;
  name: string;
  company: string;
  platform_id: string;
  platforms?: Platform;
}

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingReport?: any;
}

export function BugReportModal({ isOpen, onClose, onSave, editingReport }: BugReportModalProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [formData, setFormData] = useState({
    program_id: '',
    title: '',
    description: '',
    severity: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational',
    status: 'Draft' as 'Draft' | 'Submitted' | 'Triaged' | 'Accepted' | 'Duplicate' | 'Not Applicable' | 'Resolved' | 'Bounty Awarded',
    vulnerability_type: '',
    poc_steps: '',
    impact_description: '',
    remediation_suggestion: '',
    bounty_amount: 0,
    submission_date: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, fetching data...');
      fetchPlatforms();
      fetchPrograms();
      
      if (editingReport) {
        console.log('Editing report:', editingReport);
        setFormData({
          program_id: editingReport.program_id || '',
          title: editingReport.title || '',
          description: editingReport.description || '',
          severity: editingReport.severity || 'Medium',
          status: editingReport.status || 'Draft',
          vulnerability_type: editingReport.vulnerability_type || '',
          poc_steps: editingReport.poc_steps || '',
          impact_description: editingReport.impact_description || '',
          remediation_suggestion: editingReport.remediation_suggestion || '',
          bounty_amount: editingReport.bounty_amount || 0,
          submission_date: editingReport.submission_date || '',
        });
      } else {
        console.log('Creating new report, resetting form...');
        setFormData({
          program_id: '',
          title: '',
          description: '',
          severity: 'Medium',
          status: 'Draft',
          vulnerability_type: '',
          poc_steps: '',
          impact_description: '',
          remediation_suggestion: '',
          bounty_amount: 0,
          submission_date: '',
        });
        setSelectedPlatform('');
      }
    }
  }, [isOpen, editingReport]);

  // Separate useEffect for setting selected platform when editing
  useEffect(() => {
    if (editingReport && editingReport.program_id && programs.length > 0) {
      console.log('Finding platform for edited report...');
      const program = programs.find(p => p.id === editingReport.program_id);
      if (program) {
        console.log('Found program:', program, 'Setting platform to:', program.platform_id);
        setSelectedPlatform(program.platform_id);
      }
    }
  }, [editingReport, programs]);

  // Handle platform selection and program filtering
  useEffect(() => {
    console.log('Platform or programs changed. Selected platform:', selectedPlatform, 'Programs count:', programs.length);
    
    if (selectedPlatform && programs.length > 0) {
      const filtered = programs.filter(program => program.platform_id === selectedPlatform);
      console.log('Filtered programs for platform', selectedPlatform, ':', filtered);
      setFilteredPrograms(filtered);
      
      // Reset program selection if current program doesn't belong to selected platform
      if (formData.program_id) {
        const currentProgram = programs.find(p => p.id === formData.program_id);
        if (currentProgram && currentProgram.platform_id !== selectedPlatform) {
          console.log('Resetting program selection - current program not in selected platform');
          setFormData(prev => ({ ...prev, program_id: '' }));
        }
      }
    } else {
      console.log('No platform selected or no programs, showing all programs');
      setFilteredPrograms(programs);
    }
  }, [selectedPlatform, programs, formData.program_id]);

  const fetchPlatforms = async () => {
    try {
      console.log('Fetching platforms...');
      const { data, error } = await supabase
        .from('platforms')
        .select('id, name')
        .eq('is_enabled', true)
        .order('name');

      if (error) throw error;
      console.log('Platforms fetched:', data);
      setPlatforms(data || []);
    } catch (error: any) {
      console.error('Error fetching platforms:', error);
      toast({
        title: "Error",
        description: "Failed to load platforms",
        variant: "destructive",
      });
    }
  };

  const fetchPrograms = async () => {
    try {
      console.log('Fetching programs...');
      const { data, error } = await supabase
        .from('programs')
        .select(`
          id, 
          name, 
          company, 
          platform_id,
          platforms!inner(id, name)
        `)
        .eq('is_active', true)
        .order('company');

      if (error) throw error;
      console.log('Programs fetched:', data);
      setPrograms(data || []);
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      });
    }
  };

  const handlePlatformChange = (platformId: string) => {
    console.log('Platform changed to:', platformId);
    setSelectedPlatform(platformId);
    // Reset program selection when platform changes
    setFormData(prev => ({ ...prev, program_id: '' }));
  };

  const handleProgramChange = (programId: string) => {
    console.log('Program changed to:', programId);
    setFormData(prev => ({ ...prev, program_id: programId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting form data:', formData);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const bugData = {
        ...formData,
        user_id: user.id,
        program_id: formData.program_id || null,
        submission_date: formData.submission_date || null,
      };

      console.log('Bug data to save:', bugData);

      if (editingReport) {
        const { error } = await supabase
          .from('bugs')
          .update(bugData)
          .eq('id', editingReport.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Bug report updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('bugs')
          .insert(bugData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Bug report created successfully!",
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving bug report:', error);
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
          <DialogTitle>{editingReport ? 'Edit' : 'Create'} Bug Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select a platform first" />
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

            <div>
              <Label htmlFor="program">Program</Label>
              <Select 
                value={formData.program_id} 
                onValueChange={handleProgramChange}
                disabled={!selectedPlatform}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder={selectedPlatform ? "Select a program" : "Select platform first"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {filteredPrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.company} - {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational') => setFormData({...formData, severity: value})}>
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

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'Draft' | 'Submitted' | 'Triaged' | 'Accepted' | 'Duplicate' | 'Not Applicable' | 'Resolved' | 'Bounty Awarded') => setFormData({...formData, status: value})}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="vulnerability_type">Vulnerability Type</Label>
            <Input
              id="vulnerability_type"
              value={formData.vulnerability_type}
              onChange={(e) => setFormData({...formData, vulnerability_type: e.target.value})}
              className="bg-gray-700 border-gray-600"
              placeholder="e.g., XSS, SQL Injection, CSRF"
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
              {loading ? (editingReport ? 'Updating...' : 'Creating...') : (editingReport ? 'Update Bug Report' : 'Create Bug Report')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
