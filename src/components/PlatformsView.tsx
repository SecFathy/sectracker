
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink, Settings, Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlatformModal } from './PlatformModal';
import { EditPlatformModal } from './EditPlatformModal';
import { PlatformProfileModal } from './PlatformProfileModal';
import { HackerOneIntegrationModal } from './HackerOneIntegrationModal';
import { HackerOneDataCard } from './HackerOneDataCard';

interface Platform {
  id: string;
  name: string;
  url: string;
  platform_type: string;
  description: string;
  favicon_url?: string;
  is_enabled: boolean;
  category: string;
}

interface PlatformProfile {
  id: string;
  platform_id: string;
  username: string;
  profile_url?: string;
  reputation_points: number;
  rank_position?: string;
  total_bounties_earned: number;
  bugs_submitted: number;
  bugs_accepted: number;
  platforms: {
    name: string;
    url: string;
    favicon_url?: string;
  };
}

interface BugReport {
  id: string;
  title: string;
  severity: string;
  status: string;
  platform_name: string;
  created_at: string;
}

export function PlatformsView() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [profiles, setProfiles] = useState<PlatformProfile[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [stats, setStats] = useState({
    totalPlatforms: 0,
    enabledPlatforms: 0,
    totalProfiles: 0,
    totalBugReports: 0
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHackerOneModalOpen, setIsHackerOneModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('');
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch platforms
      const { data: platformsData, error: platformsError } = await supabase
        .from('platforms')
        .select('*')
        .order('name');

      if (platformsError) throw platformsError;

      // Fetch user profiles with platform info
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_platform_profiles')
        .select(`
          id,
          platform_id,
          username,
          profile_url,
          reputation_points,
          rank_position,
          total_bounties_earned,
          bugs_submitted,
          bugs_accepted,
          platforms (
            name,
            url,
            favicon_url
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch bug reports
      const { data: bugReportsData, error: bugReportsError } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (bugReportsError) throw bugReportsError;

      setPlatforms(platformsData || []);
      setProfiles(profilesData || []);
      setBugReports(bugReportsData || []);

      // Calculate stats
      const enabledPlatforms = platformsData?.filter(p => p.is_enabled).length || 0;
      setStats({
        totalPlatforms: platformsData?.length || 0,
        enabledPlatforms,
        totalProfiles: profilesData?.length || 0,
        totalBugReports: bugReportsData?.length || 0
      });

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load platform data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditPlatform = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsEditModalOpen(true);
  };

  const handleDeletePlatform = async (platformId: string) => {
    try {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', platformId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform deleted successfully!",
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

  const handleHackerOneIntegration = (platformId: string) => {
    setSelectedPlatformId(platformId);
    setIsHackerOneModalOpen(true);
  };

  const isHackerOnePlatform = (platform: Platform) => {
    return platform.name.toLowerCase().includes('hackerone') || 
           platform.url.toLowerCase().includes('hackerone.com');
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.totalPlatforms}</div>
            <div className="text-sm text-gray-400">Total Platforms</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{stats.enabledPlatforms}</div>
            <div className="text-sm text-gray-400">Enabled Platforms</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-400">{stats.totalProfiles}</div>
            <div className="text-sm text-gray-400">Your Profiles</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-400">{stats.totalBugReports}</div>
            <div className="text-sm text-gray-400">Bug Reports</div>
          </CardContent>
        </Card>
      </div>

      {/* Your Platform Profiles */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Platform Profiles
              </CardTitle>
              <CardDescription>Platforms where you have created profiles</CardDescription>
            </div>
            <Button 
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No platform profiles yet. Add your first profile to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <Card key={profile.id} className="bg-gray-700 border-gray-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {profile.platforms.favicon_url && (
                        <img 
                          src={profile.platforms.favicon_url} 
                          alt="" 
                          className="w-5 h-5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      {profile.platforms.name}
                    </CardTitle>
                    <CardDescription>@{profile.username}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400">Reputation</div>
                        <div className="font-semibold">{profile.reputation_points}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Rank</div>
                        <div className="font-semibold">{profile.rank_position || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Bounties</div>
                        <div className="font-semibold text-green-400">${profile.total_bounties_earned}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Success Rate</div>
                        <div className="font-semibold">
                          {profile.bugs_submitted > 0 
                            ? `${Math.round((profile.bugs_accepted / profile.bugs_submitted) * 100)}%`
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-gray-400">
                        {profile.bugs_accepted}/{profile.bugs_submitted} bugs accepted
                      </div>
                      {profile.profile_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(profile.profile_url, '_blank')}
                          className="border-gray-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* HackerOne Integration Button */}
                    {isHackerOnePlatform(platforms.find(p => p.id === profile.platform_id) || {} as Platform) && (
                      <Button
                        onClick={() => handleHackerOneIntegration(profile.platform_id)}
                        className="w-full bg-green-600 hover:bg-green-700 mt-3"
                        size="sm"
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        View HackerOne Data
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Platforms Management */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                All Platforms Management
              </CardTitle>
              <CardDescription>Manage available platforms and their settings</CardDescription>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Platform
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <Card key={platform.id} className="bg-gray-700 border-gray-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {platform.favicon_url && (
                        <img 
                          src={platform.favicon_url} 
                          alt="" 
                          className="w-5 h-5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      {platform.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlatform(platform)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlatform(platform.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={platform.is_enabled ? "default" : "secondary"}>
                      {platform.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant="outline" className="border-gray-500">
                      {platform.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-400">
                    {platform.description}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-400">
                      Type: {platform.platform_type}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(platform.url, '_blank')}
                      className="border-gray-600"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* HackerOne Data Display */}
      {selectedPlatformId && platforms.find(p => p.id === selectedPlatformId && isHackerOnePlatform(p)) && (
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>HackerOne Integration</CardTitle>
            <CardDescription>Live data from your HackerOne account</CardDescription>
          </CardHeader>
          <CardContent>
            <HackerOneDataCard platformId={selectedPlatformId} />
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <PlatformModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={fetchData}
      />

      <EditPlatformModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        platform={selectedPlatform}
        onSave={fetchData}
      />

      <PlatformProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        platforms={platforms}
        onSave={fetchData}
      />

      <HackerOneIntegrationModal
        isOpen={isHackerOneModalOpen}
        onClose={() => setIsHackerOneModalOpen(false)}
        platformId={selectedPlatformId}
        onSuccess={fetchData}
      />
    </div>
  );
}
