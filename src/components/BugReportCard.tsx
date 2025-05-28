
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DollarSign, Eye, Edit, Trash2, Archive, RotateCcw } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

interface Program {
  id: string;
  platform_id: string;
  name: string;
  company: string;
  scope: string;
  max_bounty: number;
  min_bounty: number;
  program_url: string;
  is_active: boolean;
}

interface Bug {
  id: string;
  program_id: string;
  title: string;
  description: string;
  severity: Database['public']['Enums']['bug_severity'];
  status: Database['public']['Enums']['bug_status'];
  bounty_amount: number;
  submission_date: string;
  vulnerability_type: string;
  poc_steps: string | null;
  impact_description: string | null;
  remediation_suggestion: string | null;
  program: Program;
}

interface BugReportCardProps {
  bug: Bug;
  onViewBug: (bug: Bug) => void;
  onBugAction: (bug: Bug, action: 'edit' | 'delete' | 'archive' | 'unarchive') => void;
}

export function BugReportCard({ bug, onViewBug, onBugAction }: BugReportCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      case 'Informational': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-600';
      case 'Bounty Awarded': return 'bg-emerald-600';
      case 'Accepted': return 'bg-blue-600';
      case 'Triaged': return 'bg-cyan-600';
      case 'Submitted': return 'bg-yellow-600';
      case 'Draft': return 'bg-gray-600';
      case 'Duplicate': return 'bg-purple-600';
      case 'Not Applicable': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 rounded border border-gray-700">
      <div className="flex-1">
        <h5 className="text-white font-medium">{bug.title}</h5>
        <p className="text-sm text-gray-400">{bug.program.name} • {bug.program.company}</p>
        <p className="text-xs text-gray-500 mt-1">{bug.submission_date}</p>
        {bug.vulnerability_type && (
          <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs mt-1">
            {bug.vulnerability_type}
          </Badge>
        )}
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <Badge className={`${getSeverityColor(bug.severity)} text-white`}>
          {bug.severity}
        </Badge>
        <Badge className={`${getStatusColor(bug.status)} text-white`}>
          {bug.status}
        </Badge>
        {bug.bounty_amount && (
          <div className="flex items-center text-green-400">
            <DollarSign className="h-3 w-3 mr-1" />
            <span className="text-sm font-medium">${bug.bounty_amount}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewBug(bug)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-700 border-gray-600">
              <DropdownMenuItem 
                onClick={() => onBugAction(bug, 'edit')}
                className="text-gray-300 hover:bg-gray-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onBugAction(bug, bug.status === 'Resolved' ? 'unarchive' : 'archive')}
                className="text-gray-300 hover:bg-gray-600"
              >
                {bug.status === 'Resolved' ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onBugAction(bug, 'delete')}
                className="text-red-400 hover:bg-gray-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
