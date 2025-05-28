
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Bug, Target, DollarSign } from 'lucide-react';
import { PlatformModal } from '@/components/PlatformModal';
import { BugModal } from '@/components/BugModal';

interface Platform {
  id: string;
  name: string;
  url: string;
  programs: Program[];
}

interface Program {
  id: string;
  name: string;
  company: string;
  scope: string;
  bugs: BugReport[];
}

interface BugReport {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Reported' | 'Triaged' | 'Resolved' | 'Duplicate' | 'N/A';
  reward: string;
  description: string;
  date: string;
}

export function PlatformsView() {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: '1',
      name: 'HackerOne',
      url: 'https://hackerone.com',
      programs: [
        {
          id: '1',
          name: 'Example Corp',
          company: 'Example Corporation',
          scope: '*.example.com',
          bugs: [
            {
              id: '1',
              title: 'XSS in user profile',
              severity: 'High',
              status: 'Resolved',
              reward: '$500',
              description: 'Stored XSS vulnerability in user profile bio field',
              date: '2024-01-15'
            }
          ]
        }
      ]
    }
  ]);
  
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-600';
      case 'Triaged': return 'bg-blue-600';
      case 'Reported': return 'bg-yellow-600';
      case 'Duplicate': return 'bg-gray-600';
      case 'N/A': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Platforms & Bug Reports</h1>
        <Button 
          onClick={() => setShowPlatformModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Platform
        </Button>
      </div>

      <div className="space-y-6">
        {platforms.map((platform) => (
          <Card key={platform.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <span>{platform.name}</span>
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedPlatform(platform.id);
                    setShowBugModal(true);
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Add Bug
                </Button>
              </div>
              <p className="text-sm text-gray-400">{platform.url}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platform.programs.map((program) => (
                  <div key={program.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{program.name}</h3>
                        <p className="text-sm text-gray-400">{program.company} • {program.scope}</p>
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {program.bugs.length} bugs
                      </Badge>
                    </div>
                    
                    {program.bugs.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300">Recent Bugs:</h4>
                        {program.bugs.map((bug) => (
                          <div key={bug.id} className="flex items-center justify-between p-3 bg-gray-900 rounded border border-gray-700">
                            <div className="flex-1">
                              <h5 className="text-white font-medium">{bug.title}</h5>
                              <p className="text-sm text-gray-400">{bug.description}</p>
                              <p className="text-xs text-gray-500 mt-1">{bug.date}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge className={`${getSeverityColor(bug.severity)} text-white`}>
                                {bug.severity}
                              </Badge>
                              <Badge className={`${getStatusColor(bug.status)} text-white`}>
                                {bug.status}
                              </Badge>
                              {bug.reward && (
                                <div className="flex items-center text-green-400">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  <span className="text-sm font-medium">{bug.reward}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlatformModal 
        isOpen={showPlatformModal} 
        onClose={() => setShowPlatformModal(false)}
        onSave={(platform) => {
          setPlatforms([...platforms, { ...platform, programs: [] }]);
          setShowPlatformModal(false);
        }}
      />

      <BugModal
        isOpen={showBugModal}
        onClose={() => setShowBugModal(false)}
        platforms={platforms}
        selectedPlatform={selectedPlatform}
        selectedProgram={selectedProgram}
        onSave={(bug, platformId, programId) => {
          // Add bug logic here
          setShowBugModal(false);
        }}
      />
    </div>
  );
}
