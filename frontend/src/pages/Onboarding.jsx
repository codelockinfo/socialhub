import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schedulerService } from '../services/api';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#e1306c' },
  { id: 'facebook', name: 'Facebook', icon: '🔵', color: '#1877f2' },
  { id: 'twitter', name: 'Twitter / X', icon: '🐦', color: '#1da1f2' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0077b5' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: '#ff0000' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#bd081c' },
  { id: 'threads', name: 'Threads', icon: '🧵', color: '#000000' },
  { id: 'bluesky', name: 'Bluesky', icon: '🦋', color: '#2b8aff' },
  { id: 'mastodon', name: 'Mastodon', icon: '🐘', color: '#6364ff' },
  { id: 'google', name: 'Google Business', icon: '🏪', color: '#4285f4' }
];

const DEFAULT_NAMES = {
  instagram: 'trendkut99',
  facebook: 'ncodeloke',
  twitter: 'trendkut_x',
  linkedin: 'Alex Rivera (Dev)',
  tiktok: 'trendkut_tok',
  youtube: 'TrendKut Studio',
  pinterest: 'trend_pins',
  threads: 'trend_threads',
  bluesky: 'trendkut.bsky.social',
  mastodon: 'trendkut@mastodon.social',
  google: 'TrendKut Agency'
};

function Onboarding() {
  const navigate = useNavigate();
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [themeMode, setThemeMode] = useState('dark');

  const togglePlatform = (id) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleContinue = async () => {
    if (selectedPlatforms.length === 0) return;
    setIsSubmitting(true);

    try {
      const existing = await schedulerService.getChannels();

      for (const chan of existing) {
        await schedulerService.disconnectChannel(chan.id);
      }

      for (const plat of selectedPlatforms) {
        const name = DEFAULT_NAMES[plat] || `my_${plat}`;
        let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
        if (plat === 'youtube') avatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80';
        if (plat === 'linkedin') avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';

        await schedulerService.connectChannel(
          plat,
          name,
          avatar,
          Math.floor(Math.random() * 8000) + 800
        );
      }

      navigate('/publisher');
    } catch (err) {
      console.error('Error during onboarding setup:', err);
      navigate('/publisher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/publisher');
  };

  const isDark = themeMode === 'dark';

  return (
    <div
      className={`flex min-h-screen flex-col pb-12 font-sans transition-colors duration-300 ${
        isDark ? 'bg-[#121316] text-[#f1f3f5]' : 'bg-[#f8f9fa] text-[#1e1f22]'
      }`}
    >
      <header
        className={`flex items-center justify-between border-b px-7 py-4 ${
          isDark ? 'border-white/5' : 'border-black/5'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            className={`cursor-pointer rounded-md px-2 py-1 text-xl transition-colors ${
              isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
            }`}
            onClick={() => navigate(-1)}
            title="Back"
          >
            ←
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🥞</span>
            <span className="text-lg font-extrabold tracking-tight">Buffer</span>
          </div>
        </div>

        <button
          className="cursor-pointer rounded-full p-1.5 text-lg transition-transform hover:rotate-[15deg] hover:scale-110"
          onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
          title="Toggle Theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="mx-auto mt-10 flex w-[90%] max-w-[900px] flex-col items-center text-center">
        <div className="mb-8">
          <h1 className="m-0 text-[1.8rem] font-extrabold tracking-tight">What social channel(s) are in focus?</h1>
        </div>

        <div className="mb-10 flex max-w-[820px] flex-wrap justify-center gap-4">
          {PLATFORMS.map(plat => {
            const isSelected = selectedPlatforms.includes(plat.id);
            return (
              <button
                key={plat.id}
                type="button"
                className={`relative flex h-24 w-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border px-1.5 py-3 transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected ? 'border-2 bg-white/5' : 'border'
                } ${
                  isDark
                    ? 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    : 'border-black/[0.08] bg-white shadow-sm hover:bg-[#fdfdfd] hover:shadow-md'
                }`}
                style={{
                  borderColor: isSelected ? plat.color : undefined,
                  boxShadow: isSelected ? `0 0 0 1px ${plat.color}20` : undefined
                }}
                onClick={() => togglePlatform(plat.id)}
              >
                <span className="mb-2 block text-[26px]" style={{ color: plat.color }}>
                  {plat.icon}
                </span>
                <span className="text-xs font-bold opacity-85">{plat.name}</span>
                {isSelected && (
                  <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2b8a3e] text-[8px] font-bold text-white shadow-sm">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex w-80 flex-col items-center gap-4">
          <button
            className={`flex w-full items-center justify-center rounded-lg border-none py-3.5 text-[0.95rem] font-bold transition-all ${
              selectedPlatforms.length > 0
                ? isDark
                  ? 'cursor-pointer border border-white/10 bg-[#2b2d31] text-white shadow-lg hover:-translate-y-px hover:bg-[#3b3d42]'
                  : 'cursor-pointer bg-[#1e1f22] text-white shadow-lg hover:-translate-y-px'
                : isDark
                  ? 'cursor-not-allowed bg-white/5 text-white/30'
                  : 'cursor-not-allowed bg-black/5 text-black/30'
            }`}
            onClick={handleContinue}
            disabled={selectedPlatforms.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Connecting...' : 'Continue →'}
          </button>

          <button
            className={`cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-sm font-bold text-[#868e96] transition-all ${
              isDark ? 'hover:bg-white/[0.04] hover:text-inherit' : 'hover:bg-black/[0.04] hover:text-inherit'
            }`}
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </button>
        </div>
      </main>
    </div>
  );
}

export default Onboarding;
