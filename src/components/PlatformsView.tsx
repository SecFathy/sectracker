
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Bug, Target, DollarSign, User, Eye, Filter, Edit, Trash2, Archive, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PlatformProfileModal } from '@/components/PlatformProfileModal';
import { ProgramModal } from '@/components/ProgramModal';
import { BugReportModal } from '@/components/BugReportModal';
import { BugDetailsModal } from '@/components/BugDetailsModal';
import { BugActionsModal } from '@/components/BugActionsModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  severity: string;
  status: string;
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
          <Card key={profile.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Target className="h-5 w-5 text-cyan-400" />
                  <span>{profile.platform.name}</span>
                </CardTitle>
                <Badge className="bg-cyan-600 text-white">
                  {profile.platform.platform_type}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">@{profile.username}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Reputation</span>
                  <span className="text-cyan-400 font-bold">{profile.reputation_points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Rank</span>
                  <span className="text-white">{profile.rank_position || 'Unranked'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Bounties</span>
                  <span className="text-green-400 font-bold">${profile.total_bounties_earned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Bugs Submitted</span>
                  <span className="text-white">{profile.bugs_submitted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Bugs Accepted</span>
                  <span className="text-green-400">{profile.bugs_accepted}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bugs with Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Bug Reports</CardTitle>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filters</span>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <Input
                placeholder="Search bugs..."
                value={bugFilters.search}
                onChange={(e) => setBugFilters({...bugFilters, search: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Select value={bugFilters.severity} onValueChange={(value) => setBugFilters({...bugFilters, severity: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Informational">Informational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={bugFilters.status} onValueChange={(value) => setBugFilters({...bugFilters, status: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Triaged">Triaged</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Bounty Awarded">Bounty Awarded</SelectItem>
                  <SelectItem value="Duplicate">Duplicate</SelectItem>
                  <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Input
                placeholder="Vulnerability Type"
                value={bugFilters.vulnerabilityType}
                onChange={(e) => setBugFilters({...bugFilters, vulnerabilityType: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBugs.map((bug) => (
              <div key={bug.id} className="flex items-center justify-between p-4 bg-gray-900 rounded border border-gray-700">
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
                      onClick={() => handleViewBug(bug)}
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
                          onClick={() => handleBugAction(bug, 'edit')}
                          className="text-gray-300 hover:bg-gray-600"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleBugAction(bug, bug.status === 'Resolved' ? 'unarchive' : 'archive')}
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
                          onClick={() => handleBugAction(bug, 'delete')}
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
