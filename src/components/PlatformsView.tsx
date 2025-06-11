
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  ExternalLink, 
  Edit2, 
  Users, 
  Globe, 
  Shield,
  Target,
  Building2
} from 'lucide-react';
import { PlatformModal } from './PlatformModal';
import { EditPlatformModal } from './EditPlatformModal';
import { ProgramModal } from './ProgramModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Platform {
  id: string;
  name: string;
  url?: string;
  description?: string;
  platform_type: string;
  favicon_url?: string;
  category?: string;
  is_enabled: boolean;
  programs?: Program[];
}

interface Program {
  id: string;
  name: string;
  company: string;
  scope: string;
  platform_id: string;
  program_url?: string;
  min_bounty?: number;
  max_bounty?: number;
  logo_url?: string;
  program_type?: string;
  management_type?: string;
  is_active: boolean;
}

export function PlatformsView() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [platformsResponse, programsResponse] = await Promise.all([
        supabase.from('platforms').select('*').order('name'),
        supabase.from('programs').select('*').order('name')
      ]);

      if (platformsResponse.error) throw platformsResponse.error;
      if (programsResponse.error) throw programsResponse.error;

      setPlatforms(platformsResponse.data || []);
      setPrograms(programsResponse.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load platforms and programs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug_bounty': return 'bg-red-600';
      case 'vdp': return 'bg-blue-600';
      case 'private': return 'bg-purple-600';
      case 'ctf': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bug_bounty': return 'Bug Bounty';
      case 'vdp': return 'VDP';
      case 'private': return 'Private';
      case 'ctf': return 'CTF';
      default: return type;
    }
  };

  const formatBountyRange = (program: Program) => {
    if (program.min_bounty && program.max_bounty) {
      return `$${program.min_bounty} - $${program.max_bounty}`;
    } else if (program.max_bounty) {
      return `Up to $${program.max_bounty}`;
    } else if (program.min_bounty) {
      return `From $${program.min_bounty}`;
    }
    return 'Not specified';
  };

  const getProgramsByPlatform = (platformId: string) => {
    return programs.filter(program => program.platform_id === platformId && program.is_active);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading platforms...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Bug Bounty Platforms</h1>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setShowProgramModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Target className="h-4 w-4 mr-2" />
            Add Program
          </Button>
          <Button 
            onClick={() => setShowPlatformModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Platform
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const platformPrograms = getProgramsByPlatform(platform.id);
          
          return (
            <Card key={platform.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {platform.favicon_url ? (
                      <img 
                        src={platform.favicon_url} 
                        alt={`${platform.name} favicon`}
                        className="w-8 h-8 rounded"
                      />
                    ) : (
                      <Globe className="h-8 w-8 text-blue-400" />
                    )}
                    <div>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <span>{platform.name}</span>
                        {platform.url && (
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`${getTypeColor(platform.platform_type)} text-white`}>
                          {getTypeLabel(platform.platform_type)}
                        </Badge>
                        {platform.category && (
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {platform.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPlatform(platform)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {platform.description && (
                  <CardDescription className="text-gray-400 mt-2">
                    {platform.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Active Programs</span>
                    <span className="text-white font-medium">{platformPrograms.length}</span>
                  </div>

                  {platformPrograms.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-300">Recent Programs:</h4>
                      {platformPrograms.slice(0, 3).map((program) => (
                        <div key={program.id} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              {program.logo_url && (
                                <img 
                                  src={program.logo_url} 
                                  alt={`${program.name} logo`}
                                  className="w-6 h-6 rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="text-white font-medium truncate">{program.name}</p>
                                  {program.program_type && (
                                    <Badge 
                                      variant="outline" 
                                      className="border-gray-500 text-gray-300 text-xs"
                                    >
                                      {program.program_type}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm truncate">{program.company}</p>
                                <p className="text-green-400 text-xs">{formatBountyRange(program)}</p>
                              </div>
                            </div>
                            {program.program_url && (
                              <a
                                href={program.program_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 ml-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                      {platformPrograms.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{platformPrograms.length - 3} more programs...
                        </p>
                      )}
                    </div>
                  )}

                  {platformPrograms.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No programs added yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {platforms.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No platforms yet</h3>
          <p className="text-gray-500 mb-4">Add your first bug bounty platform to get started</p>
          <Button onClick={() => setShowPlatformModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Platform
          </Button>
        </div>
      )}

      <PlatformModal
        isOpen={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        onSave={fetchData}
      />

      <ProgramModal
        isOpen={showProgramModal}
        onClose={() => setShowProgramModal(false)}
        platforms={platforms}
        onSave={fetchData}
      />

      {editingPlatform && (
        <EditPlatformModal
          isOpen={!!editingPlatform}
          onClose={() => setEditingPlatform(null)}
          platform={editingPlatform}
          onSave={fetchData}
        />
      )}
    </div>
  );
}
