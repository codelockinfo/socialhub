import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { schedulerService } from '../services/api';
import { DEFAULT_ACCOUNT_NAMES, getDefaultAvatar } from '../constants/platforms';

const StudioContext = createContext(null);

export function StudioProvider({ children }) {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectModalPlatform, setConnectModalPlatform] = useState('facebook');
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const fetchChannels = useCallback(async () => {
    try {
      const chans = await schedulerService.getChannels();
      setChannels(chans);
      return chans;
    } catch (err) {
      console.error('Error fetching channels:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 10000);
    return () => clearInterval(interval);
  }, [fetchChannels]);

  const openConnectModal = (platform = 'facebook', allPlatforms = false) => {
    setConnectModalPlatform(platform);
    setShowAllPlatforms(allPlatforms);
    setIsConnectModalOpen(true);
  };

  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
    setShowAllPlatforms(false);
  };

  const connectChannel = async (platform, accountName, followersCount = 1200) => {
    const avatar = getDefaultAvatar(platform);
    const newChan = await schedulerService.connectChannel(
      platform,
      accountName,
      avatar,
      parseInt(followersCount, 10) || 0
    );
    await fetchChannels();
    setSelectedChannel(newChan);
    closeConnectModal();
    return newChan;
  };

  const disconnectChannel = async (id) => {
    await schedulerService.disconnectChannel(id);
    if (selectedChannel?.id === id) {
      setSelectedChannel(null);
    }
    await fetchChannels();
  };

  const selectChannel = (channel) => {
    setSelectedChannel(channel);
  };

  const selectAllChannels = () => {
    setSelectedChannel(null);
  };

  const value = {
    channels,
    selectedChannel,
    setSelectedChannel,
    selectChannel,
    selectAllChannels,
    fetchChannels,
    connectChannel,
    disconnectChannel,
    isConnectModalOpen,
    connectModalPlatform,
    showAllPlatforms,
    openConnectModal,
    closeConnectModal,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used within StudioProvider');
  }
  return ctx;
}

export function useStudioOptional() {
  return useContext(StudioContext);
}
