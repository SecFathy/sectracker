
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, Calendar, DollarSign, Target } from 'lucide-react';

interface BugDetailsModalProps {
  bug: any;
  isOpen: boolean;
  onClose: () => void;
}

export function BugDetailsModal({ bug, isOpen, onClose }: BugDetailsModalProps) {
  if (!bug) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5 text-red-400" />
            <span>{bug.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap gap-3">
            <Badge className={`${getSeverityColor(bug.severity)} text-white`}>
              {bug.severity}
            </Badge>
            <Badge className={`${getStatusColor(bug.status)} text-white`}>
              {bug.status}
            </Badge>
            {bug.vulnerability_type && (
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {bug.vulnerability_type}
              </Badge>
            )}
          </div>

          {/* Program Info */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Program Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><span className="text-gray-400">Company:</span> <span className="text-white">{bug.program?.company}</span></div>
                <div><span className="text-gray-400">Program:</span> <span className="text-white">{bug.program?.name}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {bug.description && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">{bug.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Proof of Concept */}
          {bug.poc_steps && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Proof of Concept</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-gray-300 bg-gray-800 p-3 rounded border border-gray-700 overflow-x-auto whitespace-pre-wrap">
                  {bug.poc_steps}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Impact */}
          {bug.impact_description && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">{bug.impact_description}</p>
              </CardContent>
            </Card>
          )}

          {/* Remediation */}
          {bug.remediation_suggestion && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Remediation Suggestion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">{bug.remediation_suggestion}</p>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bug.bounty_amount && (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-gray-400">Bounty Amount:</span>
                    <span className="text-green-400 font-bold">${bug.bounty_amount}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {bug.submission_date && (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-400">Submission Date:</span>
                    <span className="text-white">{bug.submission_date}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
