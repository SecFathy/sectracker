
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Platform, PlatformProfileFormData } from '@/types/platform';
import { PlatformSelector } from './PlatformSelector';
import { PlatformFormFields } from './PlatformFormFields';
import { HackerOneInfo } from './HackerOneInfo';

interface PlatformProfileFormProps {
  platforms: Platform[];
  onSave: () => void;
  onClose: () => void;
}

export function PlatformProfileForm({ platforms, onSave, onClose }: PlatformProfileFormProps) {
  const [formData, setFormData] = useState<PlatformProfileFormData>({
    platform_id: '',
    username: '',
    profile_url: '',
    reputation_points: 0,
    rank_position: '',
    total_bounties_earned: 0,
    bugs_submitted: 0,
    bugs_accepted: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedPlatform = platforms.find(p => p.id === formData.platform_id);
  const isHackerOne = selectedPlatform?.name === 'HackerOne';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      if (isHackerOne) {
        onClose();
        navigate('/hackerone-setup');
        return;
      }

      const { data: existingProfile, error: checkError } = await supabase
        .from('user_platform_profiles')
        .select('id')
        .eq('user_id', user.data.user.id)
        .eq('platform_id', formData.platform_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingProfile) {
        toast({
          title: "Profile Already Exists",
          description: "You already have a profile for this platform. Please use the integration button to update your data.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('user_platform_profiles')
        .insert({
          user_id: user.data.user.id,
          ...formData,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform profile created successfully!",
      });

      setFormData({
        platform_id: '',
        username: '',
        profile_url: '',
        reputation_points: 0,
        rank_position: '',
        total_bounties_earned: 0,
        bugs_submitted: 0,
        bugs_accepted: 0,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <PlatformSelector
        platforms={platforms}
        selectedPlatformId={formData.platform_id}
        onPlatformChange={(value) => setFormData({...formData, platform_id: value})}
      />

      {isHackerOne ? (
        <HackerOneInfo />
      ) : (
        <PlatformFormFields formData={formData} setFormData={setFormData} />
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose} className="border-gray-600">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
          {isHackerOne ? 'Continue to Setup' : loading ? 'Creating...' : 'Create Profile'}
        </Button>
      </div>
    </form>
  );
}
