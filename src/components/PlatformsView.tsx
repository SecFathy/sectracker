
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bug, Target, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PlatformProfileModal } from '@/components/PlatformProfileModal';
import { ProgramModal } from '@/components/ProgramModal';
import { BugReportModal } from '@/components/BugReportModal';
import { BugDetailsModal } from '@/components/BugDetailsModal';
import { BugActionsModal } from '@/components/BugActionsModal';
import { PlatformProfileCard } from '@/components/PlatformProfileCard';
import { BugFilters } from '@/components/BugFilters';
import { BugReportCard } from '@/components/BugReportCard';
import { Database } from '@/integrations/supabase/types';

interface Platform {
  id: string;
  name: string;
  url: string;
  platform_type: string;
  description: string;
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showBugDetails, setShowBugDetails] = useState(false);
  const [showBugActions, setShowBugActions] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Platforms & Bug Reports</h1>
        <div className="flex space-x-2">
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

      {/* User Platform Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userProfiles.map((profile) => (
          <PlatformProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      {/* Recent Bugs with Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Bug Reports</CardTitle>
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
              <p className="text-gray-400 text-center py-8">
                {bugs.length === 0 ? "No bug reports yet. Start by adding your first bug report!" : "No bugs match the current filters."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
