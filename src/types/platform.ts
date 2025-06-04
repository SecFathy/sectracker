
export interface Platform {
  id: string;
  name: string;
}

export interface PlatformProfileFormData {
  platform_id: string;
  username: string;
  profile_url: string;
  reputation_points: number;
  rank_position: string;
  total_bounties_earned: number;
  bugs_submitted: number;
  bugs_accepted: number;
}

export interface PlatformProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Platform[];
  onSave: () => void;
}
