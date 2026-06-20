import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/services/api';

interface Profile {
  username: string;
  displayName: string;
  profileImage?: string;
  creditScore: number;
  tier: string;
  accountAgeDays: number;
  totalCompleted: number;
  totalEarned: number;
  onTimeReleases: number;
}

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/public-profile/${username}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Profile not found');
        }

        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'TIER_1':
        return 'text-emerald-400';
      case 'TIER_2':
        return 'text-blue-400';
      case 'TIER_3':
        return 'text-yellow-400';
      default:
        return 'text-white/60';
    }
  };

  const getTierLabel = (tier: string) => {
    return tier.replace('_', ' ');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Public Profile</h1>
            <p className="text-white/60 text-sm">View member reputation</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="text-white/60">Loading profile...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-300 font-semibold">{error}</p>
            <p className="text-white/60 text-sm mt-2">
              This profile is private or doesn't exist
            </p>
          </div>
        )}

        {profile && (
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-start gap-6 mb-8">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.displayName}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-2 border-white/20">
                    <span className="text-3xl font-bold text-white">
                      {profile.displayName[0].toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {profile.displayName}
                  </h2>
                  <p className="text-white/60 text-lg mb-4">@{profile.username}</p>

                  <div className="flex gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Member for</p>
                      <p className="text-xl font-semibold text-white">
                        {profile.accountAgeDays} days
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Credit Tier</p>
                      <p className={`text-xl font-semibold ${getTierColor(profile.tier)}`}>
                        {getTierLabel(profile.tier)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Credit Score */}
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 text-center w-32">
                  <p className="text-white/60 text-sm mb-2">Credit Score</p>
                  <p className="text-4xl font-bold text-blue-400">{profile.creditScore}</p>
                  <p className="text-white/40 text-xs mt-2">/100</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-2">Escrows Completed</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {profile.totalCompleted}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-2">On-Time Releases</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {profile.onTimeReleases}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-2">Total Earned</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {(Number(profile.totalEarned) / 1e9).toFixed(2)} SUI
                  </p>
                </div>
              </div>
            </div>

            {/* Reputation Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Reputation</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/80">Completion Rate</span>
                  <span className="text-white font-semibold">
                    {profile.totalCompleted > 0 ? '100%' : 'No History'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/80">Reliability Score</span>
                  <span className="text-emerald-400 font-semibold">
                    {profile.onTimeReleases > 0 ? 'Excellent' : 'No History'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-white/80">Member Status</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-semibold">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
