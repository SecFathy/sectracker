import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bug, Target, User, ExternalLink, Users, Edit, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PlatformModal } from '@/components/PlatformModal';
import { EditPlatformModal } from '@/components/EditPlatformModal';
import { PlatformProfileModal } from '@/components/PlatformProfileModal';
import { ProgramModal } from '@/components/ProgramModal';
import { BugReportModal } from '@/components/BugReportModal';
import { BugDetailsModal } from '@/components/BugDetailsModal';
import { BugActionsModal } from '@/components/BugActionsModal';
import { PlatformProfileCard } from '@/components/PlatformProfileCard';
import { BugFilters } from '@/components/BugFilters';
import { BugReportCard } from '@/components/BugReportCard';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Platform {
  id: string;
  name: string;
  url: string;
  platform_type: string;
  description: string;
  favicon_url?: string;
  is_enabled?: boolean;
  category?: string;
}

interface UserPlatformProfile {
  id: string;
  platform_id: string;
  username: string;
  profile_url: string;
  reputation_points: number;
  rank_position: string;
  total_bounties_earned: number;
  bugs_submitted: number;
  bugs_accepted: number;
  platform: Platform;
}

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

export function PlatformsView() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserPlatformProfile[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showBugDetails, setShowBugDetails] = useState(false);
  const [showBugActions, setShowBugActions] = useState(false);
  const [showEditPlatformModal, setShowEditPlatformModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [selectedBugForAction, setSelectedBugForAction] = useState<Bug | null>(null);
  const [bugActionMode, setBugActionMode] = useState<'edit' | 'delete' | 'archive' | 'unarchive'>('edit');
  const [bugFilters, setBugFilters] = useState({
    severity: 'all',
    status: 'all',
    vulnerabilityType: '',
    search: ''
  });
  const [selectedPlatformForEdit, setSelectedPlatformForEdit] = useState<Platform | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    // Fetch platforms
    const { data: platformsData } = await supabase
      .from('platforms')
      .select('*')
      .order('name');

    // Fetch user platform profiles
    const { data: profilesData } = await supabase
      .from('user_platform_profiles')
      .select(`
        *,
        platform:platforms(*)
      `)
      .eq('user_id', user.data.user.id);

    // Fetch programs
    const { data: programsData } = await supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('name');

    // Fetch user's bugs
    const { data: bugsData } = await supabase
      .from('bugs')
      .select(`
        *,
        program:programs(*)
      `)
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });

    setPlatforms(platformsData || []);
    setUserProfiles(profilesData || []);
    setPrograms(programsData || []);
    setBugs(bugsData || []);
  };

  const handleSavePlatform = async (platform: { id: string; name: string; url: string }) => {
    try {
      const { error } = await supabase
        .from('platforms')
        .insert({
          name: platform.name,
          url: platform.url,
          platform_type: 'bug_bounty',
          description: `Custom platform: ${platform.name}`
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform added successfully!",
      });

      fetchData();
      setShowPlatformModal(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditPlatform = (platform: Platform) => {
    setSelectedPlatformForEdit(platform);
    setShowEditPlatformModal(true);
  };

  const handleTogglePlatform = async (platform: Platform) => {
    try {
      const { error } = await supabase
        .from('platforms')
        .update({ is_enabled: !platform.is_enabled })
        .eq('id', platform.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Platform ${!platform.is_enabled ? 'enabled' : 'disabled'} successfully!`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredBugs = bugs.filter(bug => {
    const matchesSeverity = bugFilters.severity === 'all' || bug.severity === bugFilters.severity;
    const matchesStatus = bugFilters.status === 'all' || bug.status === bugFilters.status;
    const matchesVulnType = !bugFilters.vulnerabilityType || bug.vulnerability_type?.toLowerCase().includes(bugFilters.vulnerabilityType.toLowerCase());
    const matchesSearch = !bugFilters.search || 
      bug.title.toLowerCase().includes(bugFilters.search.toLowerCase()) ||
      bug.description?.toLowerCase().includes(bugFilters.search.toLowerCase()) ||
      bug.program.name.toLowerCase().includes(bugFilters.search.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesVulnType && matchesSearch;
  });

  const handleViewBug = (bug: Bug) => {
    setSelectedBug(bug);
    setShowBugDetails(true);
  };

  const handleBugAction = (bug: Bug, action: 'edit' | 'delete' | 'archive' | 'unarchive') => {
    setSelectedBugForAction(bug);
    setBugActionMode(action);
    setShowBugActions(true);
  };

  // Filter platforms by enabled status and separate into those with profiles and those without
  const enabledPlatforms = platforms.filter(platform => platform.is_enabled !== false);
  
  const platformsWithProfiles = enabledPlatforms.filter(platform => 
    userProfiles.some(profile => profile.platform_id === platform.id)
  );
  
  const platformsWithoutProfiles = enabledPlatforms.filter(platform => 
    !userProfiles.some(profile => profile.platform_id === platform.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Platforms & Bug Reports</h1>
          <p className="text-gray-400 mt-1">Manage your bug bounty platforms and track your progress</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowPlatformModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Platform
          </Button>
          <Button 
            onClick={() => setShowProfileModal(true)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <User className="h-4 w-4 mr-2" />
            Add Profile
          </Button>
          <Button 
            onClick={() => setShowProgramModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Target className="h-4 w-4 mr-2" />
            Add Program
          </Button>
          <Button 
            onClick={() => setShowBugModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Bug className="h-4 w-4 mr-2" />
            Add Bug
          </Button>
        </div>
      </div>

      {/* Platforms Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-600 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{platforms.length}</p>
                <p className="text-sm text-gray-400">Total Platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{userProfiles.length}</p>
                <p className="text-sm text-gray-400">Your Profiles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bug className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{bugs.length}</p>
                <p className="text-sm text-gray-400">Total Bugs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{programs.length}</p>
                <p className="text-sm text-gray-400">Active Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Platform Profiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your Platform Profiles</h2>
          <Badge variant="secondary" className="bg-green-600 text-white">
            {userProfiles.length} Active
          </Badge>
        </div>
        
        {userProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProfiles.map((profile) => (
              <PlatformProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Platform Profiles Yet</h3>
              <p className="text-gray-400 mb-4">Start by creating a profile on one of the available platforms below.</p>
              <Button 
                onClick={() => setShowProfileModal(true)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <User className="h-4 w-4 mr-2" />
                Create Your First Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Platforms */}
      {platformsWithoutProfiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Available Platforms</h2>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {platformsWithoutProfiles.length} Available
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformsWithoutProfiles.map((platform) => (
              <Card key={platform.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center space-x-2">
                      {platform.favicon_url ? (
                        <img 
                          src={platform.favicon_url} 
                          alt={`${platform.name} favicon`}
                          className="h-5 w-5"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Target className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-lg">{platform.name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {platform.category && (
                        <Badge className="bg-gray-700 text-gray-300 text-xs">
                          {platform.category}
                        </Badge>
                      )}
                      <Button
                        onClick={() => handleEditPlatform(platform)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {platform.description || 'Bug bounty platform'}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setShowProfileModal(true)}
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700 flex-1"
                    >
                      <User className="h-3 w-3 mr-1" />
                      Create Profile
                    </Button>
                    {platform.url && (
                      <Button 
                        onClick={() => window.open(platform.url, '_blank')}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Platforms Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">All Platforms Management</h2>
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            {platforms.length} Total
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <Card key={platform.id} className={`bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors ${!platform.is_enabled ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    {platform.favicon_url ? (
                      <img 
                        src={platform.favicon_url} 
                        alt={`${platform.name} favicon`}
                        className="h-5 w-5"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Target className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-lg">{platform.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {platform.category && (
                      <Badge className="bg-gray-700 text-gray-300 text-xs">
                        {platform.category}
                      </Badge>
                    )}
                    <Button
                      onClick={() => handleTogglePlatform(platform)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      {platform.is_enabled !== false ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      onClick={() => handleEditPlatform(platform)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {platform.description || 'Bug bounty platform'}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant={platform.is_enabled !== false ? "default" : "secondary"}>
                    {platform.is_enabled !== false ? "Enabled" : "Disabled"}
                  </Badge>
                  {platform.url && (
                    <Button 
                      onClick={() => window.open(platform.url, '_blank')}
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Bugs with Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Bug Reports</CardTitle>
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {filteredBugs.length} Reports
            </Badge>
          </div>
          <BugFilters filters={bugFilters} onFiltersChange={setBugFilters} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBugs.map((bug) => (
              <BugReportCard
                key={bug.id}
                bug={bug}
                onViewBug={handleViewBug}
                onBugAction={handleBugAction}
              />
            ))}
            {filteredBugs.length === 0 && (
              <div className="text-center py-8">
                <Bug className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {bugs.length === 0 ? "No Bug Reports Yet" : "No Bugs Match Filters"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {bugs.length === 0 
                    ? "Start by adding your first bug report!" 
                    : "Try adjusting your filters to see more results."
                  }
                </p>
                {bugs.length === 0 && (
                  <Button 
                    onClick={() => setShowBugModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Add Your First Bug
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <PlatformModal 
        isOpen={showPlatformModal} 
        onClose={() => setShowPlatformModal(false)}
        onSave={fetchData}
      />

      <EditPlatformModal
        isOpen={showEditPlatformModal}
        onClose={() => setShowEditPlatformModal(false)}
        platform={selectedPlatformForEdit}
        onSave={fetchData}
      />

      <PlatformProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        platforms={platforms}
        onSave={fetchData}
      />

      <ProgramModal
        isOpen={showProgramModal}
        onClose={() => setShowProgramModal(false)}
        platforms={platforms}
        onSave={fetchData}
      />

      <BugReportModal
        isOpen={showBugModal}
        onClose={() => setShowBugModal(false)}
        onSave={fetchData}
      />

      <BugDetailsModal
        bug={selectedBug}
        isOpen={showBugDetails}
        onClose={() => setShowBugDetails(false)}
      />

      <BugActionsModal
        bug={selectedBugForAction}
        isOpen={showBugActions}
        onClose={() => setShowBugActions(false)}
        onSave={fetchData}
        mode={bugActionMode}
      />
    </div>
  );
}
