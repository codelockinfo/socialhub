import React, { useEffect, useState } from 'react';
import { ALL_PLATFORMS, DEFAULT_ACCOUNT_NAMES } from '../constants/platforms';
import { useStudio } from '../context/StudioContext';

function ConnectChannelModal() {
  const {
    isConnectModalOpen,
    closeConnectModal,
    connectModalPlatform,
    showAllPlatforms,
    connectChannel,
    channels,
  } = useStudio();

  const [platform, setPlatform] = useState(connectModalPlatform);
  const [accountName, setAccountName] = useState('');
  const [followers, setFollowers] = useState('1200');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isConnectModalOpen) {
      setPlatform(connectModalPlatform);
      setAccountName(DEFAULT_ACCOUNT_NAMES[connectModalPlatform] || '');
      setFollowers(String(Math.floor(Math.random() * 8000) + 800));
    }
  }, [isConnectModalOpen, connectModalPlatform]);

  if (!isConnectModalOpen) return null;

  const connectedPlatforms = new Set(channels.map(c => c.platform));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountName.trim()) return;
    setIsSubmitting(true);
    try {
      await connectChannel(platform, accountName.trim(), followers);
      setAccountName('');
    } catch (err) {
      console.error('Error connecting channel:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={closeConnectModal}
    >
      <div
        className="glass-panel animate-scale-up max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-[#1e1f22] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h3 className="m-0 text-lg font-bold text-text-primary">Connect a channel</h3>
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent p-1 text-lg text-[#868e96] hover:text-text-primary"
            onClick={closeConnectModal}
          >
            ✕
          </button>
        </div>

        {showAllPlatforms && (
          <div className="mb-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#868e96]">
              Choose platform
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {ALL_PLATFORMS.map(plat => {
                const isConnected = connectedPlatforms.has(plat.id);
                const isSelected = platform === plat.id;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    disabled={isConnected}
                    onClick={() => {
                      setPlatform(plat.id);
                      setAccountName(DEFAULT_ACCOUNT_NAMES[plat.id] || '');
                    }}
                    className={`relative flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition ${
                      isConnected
                        ? 'cursor-not-allowed border-white/5 opacity-40'
                        : isSelected
                          ? 'border-2 bg-bg-surface-hover'
                          : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06]'
                    }`}
                    style={isSelected && !isConnected ? { borderColor: plat.color } : undefined}
                    title={isConnected ? 'Already connected' : plat.name}
                  >
                    <span className="text-xl" style={{ color: plat.color }}>
                      {plat.icon}
                    </span>
                    <span className="text-[10px] font-bold leading-tight text-[#adb5bd]">{plat.name}</span>
                    {isConnected && (
                      <span className="absolute right-1 top-1 text-[8px] text-[#40c057]">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!showAllPlatforms && (
            <div className="mb-4 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#adb5bd]">Platform</label>
              <select
                value={platform}
                onChange={e => {
                  const id = e.target.value;
                  setPlatform(id);
                  setAccountName(DEFAULT_ACCOUNT_NAMES[id] || '');
                }}
                className="w-full rounded-lg border border-white/[0.08] bg-bg-surface-hover px-3 py-2 text-sm text-text-primary focus:border-[#4c6ef5] focus:outline-none"
              >
                {ALL_PLATFORMS.map(plat => (
                  <option key={plat.id} value={plat.id} disabled={connectedPlatforms.has(plat.id)}>
                    {plat.name}
                    {connectedPlatforms.has(plat.id) ? ' (connected)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4 flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#adb5bd]">Account / channel name</label>
            <input
              type="text"
              placeholder="e.g. ncodeloke or trendkut99"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-bg-surface-hover px-3 py-2 text-sm text-text-primary placeholder:text-[#868e96] focus:border-[#4c6ef5] focus:outline-none"
              required
            />
          </div>

          <div className="mb-4 flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#adb5bd]">Followers / subscribers</label>
            <input
              type="number"
              value={followers}
              onChange={e => setFollowers(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-bg-surface-hover px-3 py-2 text-sm text-text-primary focus:border-[#4c6ef5] focus:outline-none"
              min="0"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-white/[0.06] pt-4">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-white/[0.08] bg-bg-surface-hover px-[18px] py-2.5 text-sm font-semibold text-[#dee2e6] hover:bg-white/10"
              onClick={closeConnectModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || connectedPlatforms.has(platform)}
              className="btn-gradient-buffer cursor-pointer rounded-lg border-none px-[18px] py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Connecting...' : 'Connect account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConnectChannelModal;
