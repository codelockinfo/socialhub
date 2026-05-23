import React, { useEffect, useState } from 'react';
import { schedulerService, userService } from '../services/api';

const PLATFORM_THEMES = {
  facebook: { name: 'Facebook Page', color: '#1877f2', icon: '🔵', prefix: 'fb/' },
  instagram: { name: 'Instagram Professional', color: '#e1306c', icon: '📸', prefix: 'ig/' },
  linkedin: { name: 'LinkedIn Profile', color: '#0077b5', icon: '💼', prefix: 'li/' },
  twitter: { name: 'X / Twitter', color: '#1da1f2', icon: '🐦', prefix: 'x/' },
  youtube: { name: 'YouTube Channel', color: '#ff0000', icon: '📺', prefix: 'yt/' },
  threads: { name: 'Threads Account', color: '#000000', icon: '🧵', prefix: 'th/' }
};

const PRESET_IMAGES = [
  { name: 'Modern Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80' },
  { name: 'Colorful Gradient', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80' },
  { name: 'Scenic Mountain', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { name: 'Business Growth', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80' }
];

// Helper to format Date as "Today, May 23"
const getDayLabel = (date) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
};

function Publisher() {
  // Core Data States
  const [channels, setChannels] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Navigation States (Active Channel and submenu item)
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [expandedChannelId, setExpandedChannelId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('publish'); // 'publish', 'community', 'analytics'
  const [activeQueueSubTab, setActiveQueueSubTab] = useState('queue'); // 'queue', 'drafts', 'approvals', 'sent'
  
  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerContent, setComposerContent] = useState('');
  const [composerMediaUrl, setComposerMediaUrl] = useState('');
  const [composerPlatforms, setComposerPlatforms] = useState([]);
  const [composerIsScheduled, setComposerIsScheduled] = useState(true);
  const [composerDateTime, setComposerDateTime] = useState('');
  
  // Connect Channel Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [newPlatform, setNewPlatform] = useState('facebook');
  const [newAccountName, setNewAccountName] = useState('');
  const [newFollowers, setNewFollowers] = useState('1200');

  // Simulated Community State (Inbox comments)
  const [communityComments, setCommunityComments] = useState({
    'chan-1': [
      { id: 'c1', author: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', content: 'Awesome layout! This dashboard looks extremely clean.', timestamp: '10 mins ago', replies: [] },
      { id: 'c2', author: 'Marcus Knight', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', content: 'Can we schedule video posts directly through the queue?', timestamp: '1 hour ago', replies: [{ author: 'ncodeloke', content: 'Yes, video uploads are supported as reels/posts!', timestamp: '30 mins ago' }] }
    ],
    'chan-2': [
      { id: 'c3', author: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80', content: 'The dark mode colors are looking stunning. Great job 👏', timestamp: '4 hours ago', replies: [] }
    ],
    'chan-3': [
      { id: 'c4', author: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80', content: 'Will there be a calendar grid view option in the future?', timestamp: 'Yesterday', replies: [] }
    ]
  });
  const [newReplyText, setNewReplyText] = useState({});

  // Simulated posting goal
  const [postingGoal, setPostingGoal] = useState('3 posts per week');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(postingGoal);

  // Time ticks
  const [tick, setTick] = useState(0);

  // Fetch initial data
  useEffect(() => {
    fetchData();
    userService.getCurrentUser().then(user => setCurrentUser(user));
    
    // Interval for updates
    const dataInterval = setInterval(fetchData, 10000);
    const tickInterval = setInterval(() => setTick(prev => prev + 1), 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, []);

  const fetchData = async () => {
    try {
      const chans = await schedulerService.getChannels();
      setChannels(chans);
      
      const allPosts = await schedulerService.getScheduledPosts();
      setPosts(allPosts);
      
      // Default select the first channel if none is selected
      if (chans.length > 0 && !selectedChannel) {
        setSelectedChannel(chans[0]);
        setExpandedChannelId(chans[0].id);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Helper when user selects a channel from sidebar
  const handleSelectChannel = (channel) => {
    setSelectedChannel(channel);
    setExpandedChannelId(channel.id);
    setActiveSubTab('publish');
  };

  // Form handlers
  const handleConnectChannelSubmit = async (e) => {
    e.preventDefault();
    if (!newAccountName) return;

    try {
      let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
      if (newPlatform === 'youtube') {
        avatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80';
      } else if (newPlatform === 'linkedin') {
        avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
      }

      const newChan = await schedulerService.connectChannel(
        newPlatform,
        newAccountName,
        avatar,
        parseInt(newFollowers, 10)
      );

      setNewAccountName('');
      setIsConnectModalOpen(false);
      
      // Auto select new channel
      setSelectedChannel(newChan);
      setExpandedChannelId(newChan.id);
      
      fetchData();
    } catch (err) {
      console.error('Error connecting channel:', err);
    }
  };

  const handleDisconnectChannel = async (id, e) => {
    e.stopPropagation(); // don't trigger selection
    if (!confirm('Are you sure you want to disconnect this channel?')) return;
    try {
      await schedulerService.disconnectChannel(id);
      if (selectedChannel && selectedChannel.id === id) {
        setSelectedChannel(null);
      }
      fetchData();
    } catch (err) {
      console.error('Error disconnecting channel:', err);
    }
  };

  // Compose Trigger
  const handleOpenComposer = (presetDate = null, presetTime = null) => {
    // Determine which platforms are default selected
    if (selectedChannel) {
      setComposerPlatforms([selectedChannel.platform]);
    } else if (channels.length > 0) {
      setComposerPlatforms([channels[0].platform]);
    }

    if (presetDate && presetTime) {
      // Create pre-filled ISO string for inputs (Local YYYY-MM-DDTHH:MM)
      const now = new Date();
      if (presetDate === 'tomorrow') {
        now.setDate(now.getDate() + 1);
      }
      
      const [hours, minutes] = presetTime.split(':');
      const period = presetTime.split(' ')[1];
      let hr = parseInt(hours, 10);
      if (period === 'PM' && hr !== 12) hr += 12;
      if (period === 'AM' && hr === 12) hr = 0;
      
      now.setHours(hr);
      now.setMinutes(parseInt(minutes, 10));
      now.setSeconds(0);
      
      // Format as Local string suitable for datetime-local value
      const pad = (num) => String(num).padStart(2, '0');
      const localStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      
      setComposerDateTime(localStr);
      setComposerIsScheduled(true);
    } else {
      setComposerDateTime('');
      setComposerIsScheduled(false);
    }

    setComposerContent('');
    setComposerMediaUrl('');
    setIsComposerOpen(true);
  };

  const handleCreatePostSubmit = async (e, forceStatus = null) => {
    e.preventDefault();
    if (!composerContent) return;
    if (composerPlatforms.length === 0) {
      alert('Please select at least one social channel.');
      return;
    }

    let status = forceStatus || (composerIsScheduled ? 'queued' : 'sent');
    let scheduledTime = null;

    if (status === 'queued') {
      if (!composerDateTime) {
        alert('Please select a date & time or choose "Publish Now".');
        return;
      }
      scheduledTime = new Date(composerDateTime).toISOString();
    }

    try {
      await schedulerService.createScheduledPost(
        composerContent,
        composerMediaUrl || null,
        composerPlatforms,
        status,
        scheduledTime
      );

      setIsComposerOpen(false);
      
      // Select appropriate sub tab
      if (status === 'sent') {
        setActiveQueueSubTab('sent');
      } else if (status === 'draft') {
        setActiveQueueSubTab('drafts');
      } else {
        setActiveQueueSubTab('queue');
      }

      fetchData();
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handlePublishNowImmediately = async (id) => {
    try {
      await schedulerService.publishImmediately(id);
      setActiveQueueSubTab('sent');
      fetchData();
    } catch (err) {
      console.error('Error publishing immediately:', err);
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await schedulerService.deleteScheduledPost(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleGoalSave = () => {
    setPostingGoal(goalInput);
    setIsEditingGoal(false);
  };

  // Add simulated comment reply
  const handleAddReply = (commentId) => {
    const text = newReplyText[commentId];
    if (!text) return;

    setCommunityComments(prev => {
      const channelId = selectedChannel?.id || 'chan-1';
      const comments = prev[channelId] || [];
      const updated = comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...c.replies, { author: 'ncodeloke', content: text, timestamp: 'Just now' }]
          };
        }
        return c;
      });
      return {
        ...prev,
        [channelId]: updated
      };
    });

    setNewReplyText(prev => ({ ...prev, [commentId]: '' }));
  };

  // Live Timer countdown renderer
  const renderCountdown = (targetDateStr) => {
    const diff = new Date(targetDateStr) - new Date();
    if (diff <= 0) return 'Publishing...';
    
    const secs = Math.floor((diff / 1000) % 60);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);

    return `Publishes in ${parts.join(' ')}`;
  };

  // Toggle platform selector inside the composer
  const handleComposerPlatformToggle = (platform) => {
    if (composerPlatforms.includes(platform)) {
      setComposerPlatforms(composerPlatforms.filter(p => p !== platform));
    } else {
      setComposerPlatforms([...composerPlatforms, platform]);
    }
  };

  // Filter posts specific to the selected channel and status
  const getFilteredChannelPosts = () => {
    if (!selectedChannel) return [];
    
    return posts.filter(post => {
      // Post must target selected platform
      const matchesPlatform = post.platforms.includes(selectedChannel.platform);
      if (!matchesPlatform) return false;

      // Match tab status
      if (activeQueueSubTab === 'queue') return post.status === 'queued';
      if (activeQueueSubTab === 'sent') return post.status === 'sent';
      if (activeQueueSubTab === 'drafts') return post.status === 'draft';
      return false;
    });
  };

  // Group queued posts by Date (e.g. May 23, May 24)
  const getGroupedTimeline = () => {
    const activePosts = getFilteredChannelPosts();
    
    // Create standard timeline layout for Today and Tomorrow
    const dates = [new Date(), new Date(Date.now() + 86400000)];
    
    return dates.map(d => {
      const dateLabel = getDayLabel(d);
      const isToday = d.toDateString() === new Date().toDateString();
      const dateKey = isToday ? 'today' : 'tomorrow';
      
      // Standard recommended slots
      const standardSlots = [
        { time: '9:00 AM', label: 'Morning Slot' },
        { time: '1:30 PM', label: 'Lunch Break Slot' },
        { time: '4:25 PM', label: 'Optimal Time Slot' },
        { time: '8:00 PM', label: 'Evening Slot' }
      ];

      // Match actual scheduled posts to their time slots (or list them chronologically)
      // For each post scheduled on this day:
      const dayPosts = activePosts.filter(p => {
        if (!p.scheduledTime) return false;
        const pDate = new Date(p.scheduledTime);
        return pDate.toDateString() === d.toDateString();
      });

      // Assemble timeline slots:
      const timelineSlots = standardSlots.map(slot => {
        // Find if any post is scheduled around this hour
        const [hourStr, minPeriod] = slot.time.split(':');
        const [minStr, period] = minPeriod.split(' ');
        let slotHour = parseInt(hourStr, 10);
        if (period === 'PM' && slotHour !== 12) slotHour += 12;
        if (period === 'AM' && slotHour === 12) slotHour = 0;
        
        // Find post matching hour slot (+/- 1 hour tolerance)
        const matchingPost = dayPosts.find(p => {
          const pDate = new Date(p.scheduledTime);
          const pVal = pDate.getHours();
          return pVal === slotHour;
        });

        return {
          time: slot.time,
          post: matchingPost || null,
          dateKey: dateKey
        };
      });

      // Add any posts that didn't fit into the standard slots as custom slots
      dayPosts.forEach(p => {
        const pDate = new Date(p.scheduledTime);
        const pHour = pDate.getHours();
        const pMin = String(pDate.getMinutes()).padStart(2, '0');
        const period = pHour >= 12 ? 'PM' : 'AM';
        const normHour = pHour % 12 === 0 ? 12 : pHour % 12;
        const timeStr = `${normHour}:${pMin} ${period}`;

        // If no slot matches this time exactly, add it
        const exists = timelineSlots.some(s => s.time === timeStr || (s.post && s.post.id === p.id));
        if (!exists) {
          timelineSlots.push({
            time: timeStr,
            post: p,
            dateKey: dateKey,
            isCustom: true
          });
        }
      });

      // Sort timeline slots by time
      timelineSlots.sort((a, b) => {
        const timeToMinutes = (timeStr) => {
          const [hourStr, minPeriod] = timeStr.split(':');
          const [minStr, period] = minPeriod.split(' ');
          let h = parseInt(hourStr, 10);
          if (period === 'PM' && h !== 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          return h * 60 + parseInt(minStr, 10);
        };
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      });

      return {
        label: dateLabel,
        slots: timelineSlots
      };
    });
  };

  const CONNECT_PLATFORMS = [
    { id: 'facebook', label: 'Facebook', icon: '🔵', color: '#1877f2' },
    { id: 'instagram', label: 'Instagram', icon: '📸', color: '#e1306c' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0077b5' },
    { id: 'youtube', label: 'YouTube', icon: '📺', color: '#ff0000' },
  ];

  return (
    <div className="flex animate-fade-in flex-col gap-6">
      {/* Studio toolbar — channels + actions */}
      <section className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-gradient-to-r from-violet-600/15 via-transparent to-cyan-500/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">SocialHub</p>
            <p className="font-heading text-lg font-bold text-text-primary">Connected channels</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => setIsConnectModalOpen(true)}>
              + Add channel
            </button>
            <button type="button" className="btn-primary" onClick={() => handleOpenComposer()}>
              New post
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-thin">
          {channels.length === 0 ? (
            <p className="px-2 py-2 text-sm text-text-muted">No channels yet — connect one below.</p>
          ) : (
            channels.map(chan => {
              const theme = PLATFORM_THEMES[chan.platform] || { icon: '❓', color: '#6366f1' };
              const isSelected = selectedChannel?.id === chan.id;
              return (
                <button
                  key={chan.id}
                  type="button"
                  onClick={() => handleSelectChannel(chan)}
                  className={`group/chan flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 transition-all ${
                    isSelected
                      ? 'border-violet-500/50 bg-violet-600/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                      : 'border-border bg-bg-surface/60 hover:border-border-hover hover:bg-bg-surface-hover'
                  }`}
                >
                  <div className="relative h-8 w-8 shrink-0">
                    <img src={chan.avatar} alt="" className="h-full w-full rounded-full object-cover ring-2 ring-white/10" />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px]"
                      style={{ backgroundColor: theme.color }}
                    >
                      {theme.icon}
                    </span>
                  </div>
                  <span className="max-w-[120px] truncate text-sm font-semibold text-text-primary">{chan.accountName}</span>
                  <button
                    type="button"
                    className="ml-1 hidden text-xs text-text-muted opacity-0 transition group-hover/chan:opacity-100 hover:text-red-400 sm:inline"
                    onClick={(e) => handleDisconnectChannel(chan.id, e)}
                    title="Disconnect"
                  >
                    ✕
                  </button>
                </button>
              );
            })
          )}
        </div>

        {selectedChannel && (
          <div className="flex flex-wrap gap-1 border-t border-border px-4 py-2">
            {[
              { id: 'publish', label: 'Queue', icon: '📤' },
              { id: 'community', label: 'Inbox', icon: '💬' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-violet-600/25 text-violet-200'
                    : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-primary'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        )}
      </section>

      <main className="flex flex-col gap-5">
        {selectedChannel ? (
          <>
            {/* Header section */}
            <header className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
              <div className="flex min-w-0 flex-wrap items-center gap-4">
                <div className="relative h-[52px] w-[52px] shrink-0">
                  <img
                    src={selectedChannel.avatar}
                    alt={selectedChannel.accountName}
                    className="h-full w-full rounded-full border-2 border-white/10 object-cover"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#1a1b1e] text-xs"
                    style={{ backgroundColor: PLATFORM_THEMES[selectedChannel.platform]?.color }}
                  >
                    {PLATFORM_THEMES[selectedChannel.platform]?.icon}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col">
                  <h2 className="m-0 text-[1.4rem] font-extrabold tracking-tight text-white">
                    {selectedChannel.accountName}
                  </h2>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[0.78rem] text-[#868e96]">
                    <span className="h-2 w-2 rounded-full bg-[#40c057]" />
                    Active connection • {selectedChannel.followersCount.toLocaleString()} Subscribers
                  </div>
                </div>

                <div className="ml-0 sm:ml-2">
                  {isEditingGoal ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="w-[140px] rounded-md border border-[#fd7e14]/40 bg-black/20 px-2 py-0.5 text-[0.78rem] text-white focus:outline-none focus:border-[#fd7e14]"
                      />
                      <button
                        type="button"
                        className="cursor-pointer rounded-md border-none bg-[#2b8a3e] px-1.5 py-0.5 text-[10px] text-white"
                        onClick={handleGoalSave}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#fd7e14]/20 bg-[#fd7e14]/10 px-2.5 py-1 text-[0.78rem] font-bold text-[#ff922b] transition hover:bg-[#fd7e14]/[0.18]"
                      onClick={() => setIsEditingGoal(true)}
                    >
                      🎯 Goal: {postingGoal} <span>✏️</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex rounded-lg border border-white/5 bg-black/25 p-0.5">
                  <button type="button" className="cursor-pointer rounded-md border-none bg-white/[0.06] px-3 py-1.5 text-[0.8rem] font-semibold text-white">
                    📑 List View
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-[0.8rem] font-semibold text-[#868e96] transition hover:text-[#dee2e6]"
                  >
                    📅 Calendar
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-gradient-buffer cursor-pointer rounded-lg border-none px-[18px] py-2.5 text-sm font-semibold hover:-translate-y-px"
                  onClick={() => handleOpenComposer()}
                >
                  + New Post
                </button>
              </div>
            </header>

            {/* Sub-menu Navigation (Queue, Sent, Drafts, Inbox, etc.) */}
            {activeSubTab === 'publish' && (
              <div className="glass-panel flex items-center justify-between rounded-2xl px-6 py-3">
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={`cursor-pointer border-b-2 bg-transparent px-4 py-2 text-[0.92rem] font-bold transition ${
                      activeQueueSubTab === 'queue'
                        ? 'border-[#4c6ef5] text-[#4c6ef5]'
                        : 'border-transparent text-[#868e96] hover:text-[#dee2e6]'
                    }`}
                    onClick={() => setActiveQueueSubTab('queue')}
                  >
                    Queue
                  </button>
                  <button
                    type="button"
                    className={`cursor-pointer border-b-2 bg-transparent px-4 py-2 text-[0.92rem] font-bold transition ${
                      activeQueueSubTab === 'drafts'
                        ? 'border-[#4c6ef5] text-[#4c6ef5]'
                        : 'border-transparent text-[#868e96] hover:text-[#dee2e6]'
                    }`}
                    onClick={() => setActiveQueueSubTab('drafts')}
                  >
                    Drafts
                  </button>
                  <button
                    type="button"
                    className={`cursor-pointer border-b-2 bg-transparent px-4 py-2 text-[0.92rem] font-bold transition ${
                      activeQueueSubTab === 'sent'
                        ? 'border-[#4c6ef5] text-[#4c6ef5]'
                        : 'border-transparent text-[#868e96] hover:text-[#dee2e6]'
                    }`}
                    onClick={() => setActiveQueueSubTab('sent')}
                  >
                    Sent ({posts.filter(p => p.status === 'sent' && p.platforms.includes(selectedChannel.platform)).length})
                  </button>
                </div>

                <div className="text-[0.8rem] text-[#868e96]">
                  <span>🌎</span> Timezone: <strong className="text-[#dee2e6]">Asia/Kolkata (IST)</strong>
                </div>
              </div>
            )}

            {/* Workspace View Renderer */}
            <div className="flex flex-col">
              
              {/* Tab: Publish Timeline Queue */}
              {activeSubTab === 'publish' && activeQueueSubTab === 'queue' && (
                <div className="glass-panel flex flex-col gap-[30px] rounded-2xl p-6">
                  {getGroupedTimeline().map((day, dIdx) => (
                    <div key={dIdx} className="flex flex-col">
                      <h3 className="m-0 mb-4 border-b border-white/[0.04] pb-2 text-[1.15rem] font-extrabold text-white">
                        {day.label}
                      </h3>

                      <div className="flex flex-col">
                        {day.slots.map((slot, sIdx) => (
                          <div
                            key={sIdx}
                            className={`relative grid grid-cols-[90px_40px_1fr] items-stretch pb-5 last:pb-0 ${slot.post ? '' : ''}`}
                          >
                            {/* Left Time label */}
                            <div className="flex justify-end pt-2.5">
                              <span className="h-fit rounded-md bg-white/[0.04] px-2 py-0.5 text-[0.82rem] font-bold text-[#adb5bd]">
                                {slot.time}
                              </span>
                            </div>

                            {/* Timeline Connector Line node */}
                            <div className="relative flex flex-col items-center">
                              <div
                                className={`z-[2] mt-3.5 h-3 w-3 rounded-full border-2 ${
                                  slot.post
                                    ? 'border-[#4c6ef5] bg-[#2b2d31] shadow-[0_0_8px_rgba(76,110,245,0.4)]'
                                    : 'border-white/15 bg-[#1e1f22] shadow-none'
                                }`}
                              />
                              {sIdx < day.slots.length - 1 && (
                                <div className="absolute top-[18px] bottom-[-18px] z-[1] w-0.5 bg-white/[0.08]" />
                              )}
                            </div>

                            {/* Right Content display */}
                            <div className="pl-3">
                              {slot.post ? (
                                <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.025] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition hover:border-[#4c6ef5]/25 hover:bg-white/[0.035] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
                                  <div className="mb-2.5 flex items-center justify-between">
                                    <div className="flex gap-1">
                                      {slot.post.platforms.map(p => (
                                        <span
                                          key={p}
                                          className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/10 text-[11px]"
                                          style={{ backgroundColor: PLATFORM_THEMES[p]?.color }}
                                          title={PLATFORM_THEMES[p]?.name}
                                        >
                                          {PLATFORM_THEMES[p]?.icon}
                                        </span>
                                      ))}
                                    </div>
                                    <span className="rounded-md border border-[#ffd43b]/15 bg-[#ffd43b]/10 px-2 py-0.5 text-[0.76rem] font-bold text-[#ffd43b]">
                                      ⏱️ {renderCountdown(slot.post.scheduledTime)}
                                    </span>
                                  </div>

                                  <p className="m-0 mb-2.5 whitespace-pre-wrap text-sm leading-snug text-[#e9ecef]">
                                    {slot.post.content}
                                  </p>

                                  {slot.post.mediaUrl && (
                                    <div className="mb-3 max-w-[320px] overflow-hidden rounded-lg border border-white/[0.08]">
                                      <img
                                        src={slot.post.mediaUrl}
                                        alt="Scheduled attached file"
                                        className="max-h-40 w-full object-cover"
                                      />
                                    </div>
                                  )}

                                  <div className="flex gap-2 border-t border-white/[0.04] pt-2.5">
                                    <button
                                      type="button"
                                      className="cursor-pointer rounded border-none bg-gradient-to-br from-[#2b8a3e] to-[#237032] px-2 py-1 text-xs font-semibold text-white shadow-md transition hover:-translate-y-px hover:from-[#37b24d] hover:to-[#2b8a3e]"
                                      onClick={() => handlePublishNowImmediately(slot.post.id)}
                                    >
                                      Share Now
                                    </button>
                                    <button
                                      type="button"
                                      className="cursor-pointer rounded border-none bg-gradient-to-br from-[#e03131] to-[#c92a2a] px-2 py-1 text-xs font-semibold text-white transition hover:-translate-y-px"
                                      onClick={() => handleDeletePost(slot.post.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.005] px-5 py-3.5 text-[#868e96] transition hover:translate-x-[3px] hover:border-[#4c6ef5]/30 hover:bg-[#4c6ef5]/[0.02] hover:text-[#748ffc]"
                                  onClick={() => handleOpenComposer(slot.dateKey, slot.time)}
                                >
                                  <span className="text-xl font-light">+</span>
                                  <span className="text-[0.85rem] font-medium">
                                    Great time to post! Create a new post or start with a template.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Drafts List */}
              {activeSubTab === 'publish' && activeQueueSubTab === 'drafts' && (
                <div className="glass-panel rounded-2xl p-6">
                  {getFilteredChannelPosts().length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-5 py-[50px] text-center text-[#868e96]">
                      <span className="mb-3 text-5xl opacity-60">📝</span>
                      <h3 className="mb-2 text-lg font-bold text-white">No drafts saved yet</h3>
                      <p>Save posts as drafts inside the composer to keep them as ideas.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
                      {getFilteredChannelPosts().map(draft => (
                        <div
                          key={draft.id}
                          className="flex flex-col justify-between rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4"
                        >
                          <p className="mb-2.5 text-sm leading-snug">{draft.content}</p>
                          {draft.mediaUrl && (
                            <img
                              src={draft.mediaUrl}
                              alt="Attached draft"
                              className="mb-3 max-h-[150px] w-full rounded-lg border border-white/[0.08] object-cover"
                            />
                          )}
                          <div className="flex gap-2 border-t border-white/[0.04] pt-2.5">
                            <button
                              type="button"
                              className="btn-gradient-buffer cursor-pointer rounded border-none px-2 py-1 text-xs font-semibold hover:-translate-y-px"
                              onClick={() => {
                                setComposerContent(draft.content);
                                setComposerMediaUrl(draft.mediaUrl || '');
                                setComposerPlatforms(draft.platforms);
                                setComposerIsScheduled(true);
                                setIsComposerOpen(true);
                              }}
                            >
                              Edit & Schedule
                            </button>
                            <button
                              type="button"
                              className="cursor-pointer rounded border-none bg-gradient-to-br from-[#e03131] to-[#c92a2a] px-2 py-1 text-xs font-semibold text-white hover:-translate-y-px"
                              onClick={() => handleDeletePost(draft.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Sent Posts / Analytics */}
              {activeSubTab === 'publish' && activeQueueSubTab === 'sent' && (
                <div className="glass-panel rounded-2xl p-6">
                  {getFilteredChannelPosts().length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-5 py-[50px] text-center text-[#868e96]">
                      <span className="mb-3 text-5xl opacity-60">📤</span>
                      <h3 className="mb-2 text-lg font-bold text-white">No sent posts found</h3>
                      <p>Once your posts are successfully shared on social channels, they will be listed here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
                      {getFilteredChannelPosts().map(post => (
                        <div
                          key={post.id}
                          className="flex flex-col justify-between rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4"
                        >
                          <div className="mb-2.5">
                            <span className="rounded-md border border-[#40c057]/15 bg-[#40c057]/10 px-2 py-0.5 text-[0.72rem] text-[#40c057]">
                              ✅ Published on {new Date(post.scheduledTime).toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <p className="mb-2.5 text-sm leading-snug">{post.content}</p>
                            {post.mediaUrl && (
                              <img
                                src={post.mediaUrl}
                                alt="Published media"
                                className="mb-3 max-h-[150px] w-full rounded-lg border border-white/[0.08] object-cover"
                              />
                            )}
                          </div>

                          {/* Analytics Widgets */}
                          <div className="grid grid-cols-4 gap-1.5 border-t border-white/[0.04] pt-3">
                            <div className="flex flex-col rounded-lg border border-white/[0.03] bg-white/[0.015] px-0.5 py-1.5 text-center">
                              <span className="text-[0.62rem] uppercase text-[#868e96]">Reach</span>
                              <span className="mt-px text-[0.85rem] font-bold text-[#748ffc]">
                                {(post.reachCount || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col rounded-lg border border-white/[0.03] bg-white/[0.015] px-0.5 py-1.5 text-center">
                              <span className="text-[0.62rem] uppercase text-[#868e96]">Likes</span>
                              <span className="mt-px text-[0.85rem] font-bold text-[#748ffc]">
                                {(post.likesCount || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col rounded-lg border border-white/[0.03] bg-white/[0.015] px-0.5 py-1.5 text-center">
                              <span className="text-[0.62rem] uppercase text-[#868e96]">Comments</span>
                              <span className="mt-px text-[0.85rem] font-bold text-[#748ffc]">
                                {(post.commentsCount || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col rounded-lg border border-white/[0.03] bg-white/[0.015] px-0.5 py-1.5 text-center">
                              <span className="text-[0.62rem] uppercase text-[#868e96]">Shares</span>
                              <span className="mt-px text-[0.85rem] font-bold text-[#748ffc]">
                                {(post.sharesCount || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Community Inbox */}
              {activeSubTab === 'community' && (
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="m-0 mb-1 text-[1.3rem] font-extrabold text-white">
                    Inbox: Account Feedback ({selectedChannel.accountName})
                  </h3>
                  <p className="m-0 mb-5 text-[0.88rem] text-[#868e96]">
                    Respond to customer comments and engage with your audience directly.
                  </p>

                  <div className="flex flex-col gap-4">
                    {(communityComments[selectedChannel.id] || []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-6 py-12 text-center text-[#868e96]">
                        <span className="mb-3 text-4xl opacity-70">💌</span>
                        <h4 className="mb-2 text-base font-bold text-[#dee2e6]">Your Inbox is clean!</h4>
                        <p className="text-sm">No new feedback or comments on this channel.</p>
                      </div>
                    ) : (
                      (communityComments[selectedChannel.id] || []).map(comment => (
                        <div
                          key={comment.id}
                          className="rounded-xl border border-white/5 bg-white/[0.015] p-4 transition hover:border-white/10"
                        >
                          <div className="mb-2.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={comment.avatar}
                                alt={comment.author}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div className="flex flex-col">
                                <span className="text-[0.88rem] font-bold text-white">{comment.author}</span>
                                <span className="text-[0.7rem] text-[#868e96]">{comment.timestamp}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="m-0 mb-3 text-sm leading-snug text-[#e9ecef]">{comment.content}</p>
                          </div>

                          {/* Replies thread */}
                          {comment.replies.length > 0 && (
                            <div className="mb-3 flex flex-col gap-2.5 rounded-lg border border-white/[0.02] bg-black/20 p-3.5">
                              {comment.replies.map((reply, rIdx) => (
                                <div key={rIdx} className="flex gap-2">
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4c6ef5]/15 text-[11px]">
                                    ⚡
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-[0.78rem] font-bold text-[#748ffc]">@{reply.author}</span>
                                    <p className="my-px text-[0.82rem] leading-snug text-[#ced4da]">{reply.content}</p>
                                    <span className="text-[0.65rem] text-[#868e96]">{reply.timestamp}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply composition panel */}
                          <div className="flex gap-2 border-t border-white/5 pt-3">
                            <input
                              type="text"
                              placeholder="Write a reply as admin..."
                              value={newReplyText[comment.id] || ''}
                              onChange={(e) => setNewReplyText({ ...newReplyText, [comment.id]: e.target.value })}
                              className="flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-1.5 text-[0.82rem] text-white focus:border-[#4c6ef5] focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddReply(comment.id);
                              }}
                            />
                            <button
                              type="button"
                              className="btn-gradient-buffer shrink-0 cursor-pointer rounded border-none px-2 py-1 text-xs font-semibold hover:-translate-y-px"
                              onClick={() => handleAddReply(comment.id)}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Analytics Dashboard */}
              {activeSubTab === 'analytics' && (
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="m-0 mb-1 text-[1.3rem] font-extrabold text-white">
                    Performance Report ({selectedChannel.accountName})
                  </h3>
                  <p className="m-0 mb-5 text-[0.88rem] text-[#868e96]">
                    Social media audience analytics, reach metrics, and follower growth stats.
                  </p>

                  {/* Summary widgets grid */}
                  <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.015] p-[18px]">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-[10px] text-xl"
                        style={{ backgroundColor: 'rgba(76, 110, 245, 0.15)', color: '#4c6ef5' }}
                      >
                        📊
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.78rem] font-bold uppercase text-[#868e96]">Impressions</span>
                        <span className="my-0.5 text-[1.4rem] font-extrabold text-white">34,120</span>
                        <span className="text-[0.7rem] font-bold text-[#40c057]">+12.4% vs last week</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.015] p-[18px]">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-[10px] text-xl"
                        style={{ backgroundColor: 'rgba(64, 192, 87, 0.15)', color: '#40c057' }}
                      >
                        👥
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.78rem] font-bold uppercase text-[#868e96]">Audience Growth</span>
                        <span className="my-0.5 text-[1.4rem] font-extrabold text-white">
                          +{selectedChannel.followersCount ? Math.floor(selectedChannel.followersCount * 0.08) : 124}
                        </span>
                        <span className="text-[0.7rem] font-bold text-[#40c057]">+8.2% new subscribers</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.015] p-[18px]">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-[10px] text-xl"
                        style={{ backgroundColor: 'rgba(253, 126, 20, 0.15)', color: '#fd7e14' }}
                      >
                        ✨
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.78rem] font-bold uppercase text-[#868e96]">Engagement Rate</span>
                        <span className="my-0.5 text-[1.4rem] font-extrabold text-white">5.8%</span>
                        <span className="text-[0.7rem] font-bold text-[#40c057]">+1.5% higher interactions</span>
                      </div>
                    </div>
                  </div>

                  {/* Growth charts widgets */}
                  <div className="grid grid-cols-1 gap-5 max-[820px]:grid-cols-1 min-[821px]:grid-cols-[3fr_2fr]">
                    <div className="rounded-xl border border-white/5 bg-white/[0.015] p-[18px]">
                      <h4 className="m-0 mb-4 text-base font-bold text-white">Weekly Growth Progress</h4>
                      <div className="flex h-[180px] items-end justify-between border-b-2 border-white/[0.06] px-0 py-2.5">
                        {[
                          { day: 'Mon', val: '65%' },
                          { day: 'Tue', val: '75%' },
                          { day: 'Wed', val: '80%' },
                          { day: 'Thu', val: '92%' },
                          { day: 'Fri', val: '88%' },
                          { day: 'Sat', val: '95%' },
                          { day: 'Sun', val: '100%' }
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex h-full w-[calc(100%/7-10px)] flex-col items-center justify-end"
                          >
                            <div
                              className="relative flex w-full items-start justify-center rounded-t bg-gradient-to-t from-[#3b5bdb] to-[#4c6ef5] transition duration-500 hover:bg-[#5c7cfa] hover:shadow-[0_0_10px_rgba(76,110,245,0.4)]"
                              style={{ height: item.val }}
                            >
                              <span className="absolute -top-[18px] text-[0.68rem] font-bold text-white">
                                {item.val}
                              </span>
                            </div>
                            <span className="mt-2 text-[0.72rem] text-[#868e96]">{item.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.015] p-[18px]">
                      <h4 className="m-0 mb-4 text-base font-bold text-white">Channel Demographics</h4>
                      <div className="flex flex-col gap-3.5">
                        <div className="grid grid-cols-[120px_1fr_40px] items-center gap-2.5 text-[0.8rem] font-semibold">
                          <span>India (Mumbai/Delhi)</span>
                          <div className="h-2 overflow-hidden rounded bg-white/5">
                            <div
                              className="h-full rounded bg-gradient-to-r from-[#4c6ef5] to-[#3b5bdb]"
                              style={{ width: '45%' }}
                            />
                          </div>
                          <span>45%</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr_40px] items-center gap-2.5 text-[0.8rem] font-semibold">
                          <span>United States (NY/SF)</span>
                          <div className="h-2 overflow-hidden rounded bg-white/5">
                            <div
                              className="h-full rounded bg-gradient-to-r from-[#4c6ef5] to-[#3b5bdb]"
                              style={{ width: '30%' }}
                            />
                          </div>
                          <span>30%</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr_40px] items-center gap-2.5 text-[0.8rem] font-semibold">
                          <span>United Kingdom (London)</span>
                          <div className="h-2 overflow-hidden rounded bg-white/5">
                            <div
                              className="h-full rounded bg-gradient-to-r from-[#4c6ef5] to-[#3b5bdb]"
                              style={{ width: '15%' }}
                            />
                          </div>
                          <span>15%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        ) : (
          <div className="surface-card relative overflow-hidden p-10 text-center md:p-14">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-cyan-500/15" />
            <div className="relative mx-auto max-w-lg">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-4xl shadow-xl shadow-violet-600/30">
                ⚡
              </div>
              <h2 className="font-heading mb-3 text-2xl font-bold text-text-primary md:text-3xl">
                Connect your first channel
              </h2>
              <p className="mb-8 text-text-secondary">
                Link Facebook, Instagram, LinkedIn, or YouTube to schedule posts, track analytics, and reply to comments — all in one place.
              </p>
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CONNECT_PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setIsConnectModalOpen(true)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-surface/80 px-3 py-4 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-bg-surface-hover"
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-xs font-semibold text-text-secondary">{p.label}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="btn-primary" onClick={() => setIsConnectModalOpen(true)}>
                Connect a channel
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. Composer Modal (Overlay) */}
      {isComposerOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setIsComposerOpen(false)}
        >
          <div
            className="glass-panel animate-scale-up w-full max-w-[580px] rounded-2xl border border-white/10 bg-[#1e1f22] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="m-0 text-lg font-bold text-white">Compose Social Post</h3>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent p-1 text-lg text-[#868e96] hover:text-white"
                onClick={() => setIsComposerOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => handleCreatePostSubmit(e)}>
              {/* Select platforms checkboxes */}
              <div className="mb-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#adb5bd]">Select channels to publish to:</label>
                <div className="flex flex-wrap gap-2.5">
                  {channels.map(chan => {
                    const theme = PLATFORM_THEMES[chan.platform];
                    const isChecked = composerPlatforms.includes(chan.platform);
                    return (
                      <button
                        key={chan.id}
                        type="button"
                        className={`relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 bg-white/5 transition hover:scale-105 ${
                          isChecked ? 'ring-2 ring-offset-2 ring-offset-[#1e1f22]' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={
                          isChecked
                            ? { borderColor: theme.color, boxShadow: `0 0 0 2px ${theme.color}55` }
                            : undefined
                        }
                        onClick={() => handleComposerPlatformToggle(chan.platform)}
                        title={chan.accountName}
                      >
                        <img
                          src={chan.avatar}
                          alt={chan.accountName}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#1e1f22] text-[9px]">
                          {theme.icon}
                        </span>
                        {isChecked && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4c6ef5] text-[10px] font-bold text-white">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text content area */}
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#adb5bd]">Caption</label>
                  <span className="text-xs text-[#868e96]">{composerContent.length} characters</span>
                </div>
                <textarea
                  className="w-full resize-y rounded-lg border border-white/[0.08] bg-black/25 p-3 text-sm text-white placeholder:text-[#868e96] focus:border-[#4c6ef5] focus:outline-none"
                  placeholder="Draft your post details here..."
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  required
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {['🚀', '✨', '🔥', '🌗', '💻', '🎉', '💡', '👇'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className="cursor-pointer rounded border-none bg-transparent p-1 text-lg transition hover:bg-white/10"
                      onClick={() => setComposerContent(prev => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image url attachment */}
              <div className="mb-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#adb5bd]">Attached Image / Media Link</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={composerMediaUrl}
                  onChange={(e) => setComposerMediaUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[#868e96] focus:border-[#4c6ef5] focus:outline-none"
                />

                <div className="mb-1 mt-1 text-xs text-[#868e96]">Or select template photo:</div>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`h-16 w-16 shrink-0 cursor-pointer rounded-lg border-2 bg-cover bg-center transition hover:border-[#4c6ef5] ${
                        composerMediaUrl === img.url
                          ? 'border-[#4c6ef5] ring-2 ring-[#4c6ef5]/50'
                          : 'border-transparent'
                      }`}
                      onClick={() => setComposerMediaUrl(img.url)}
                      style={{ backgroundImage: `url(${img.url})` }}
                      title={img.name}
                    />
                  ))}
                  {composerMediaUrl && (
                    <button
                      type="button"
                      className="cursor-pointer rounded border border-[#fa5252]/30 bg-transparent px-2 py-1 text-xs text-[#fa5252] hover:bg-[#fa5252]/10"
                      onClick={() => setComposerMediaUrl('')}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {composerMediaUrl && (
                  <div className="mt-2 max-h-48 overflow-hidden rounded-lg border border-white/[0.08]">
                    <img src={composerMediaUrl} alt="Attached Preview" className="max-h-48 w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Scheduling check */}
              <div className="mb-4 flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#dee2e6]">
                  <input
                    type="checkbox"
                    checked={composerIsScheduled}
                    onChange={(e) => setComposerIsScheduled(e.target.checked)}
                    className="accent-[#4c6ef5]"
                  />
                  Schedule this post for a specific time
                </label>
              </div>

              {composerIsScheduled && (
                <div className="mb-4 flex animate-slide-down flex-col gap-2">
                  <label className="text-sm font-semibold text-[#adb5bd]">Choose Date & Time</label>
                  <input
                    type="datetime-local"
                    value={composerDateTime}
                    onChange={(e) => setComposerDateTime(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#4c6ef5] focus:outline-none"
                    required
                  />
                </div>
              )}

              {/* Actions row */}
              <div className="mt-6 flex justify-end gap-3 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-white/[0.08] bg-white/5 px-[18px] py-2.5 text-sm font-semibold text-[#dee2e6] transition hover:-translate-y-px hover:bg-white/10 hover:text-white"
                  onClick={(e) => handleCreatePostSubmit(e, 'draft')}
                >
                  Save Draft
                </button>

                {composerIsScheduled ? (
                  <button type="submit" className="btn-gradient-buffer cursor-pointer rounded-lg border-none px-[18px] py-2.5 text-sm font-semibold hover:-translate-y-px">
                    Schedule Post
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg border-none bg-gradient-to-br from-[#2b8a3e] to-[#237032] px-[18px] py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-px hover:from-[#37b24d] hover:to-[#2b8a3e]"
                    onClick={(e) => handleCreatePostSubmit(e, 'sent')}
                  >
                    Publish Now
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Connect Channel Modal */}
      {isConnectModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setIsConnectModalOpen(false)}
        >
          <div
            className="glass-panel animate-scale-up w-full max-w-md rounded-2xl border border-white/10 bg-[#1e1f22] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="m-0 text-lg font-bold text-white">Connect Social Channel</h3>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent p-1 text-lg text-[#868e96] hover:text-white"
                onClick={() => setIsConnectModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectChannelSubmit}>
              <div className="mb-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#adb5bd]">Select Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#4c6ef5] focus:outline-none"
                >
                  <option value="facebook">Facebook Page</option>
                  <option value="instagram">Instagram Professional Account</option>
                  <option value="linkedin">LinkedIn Profile</option>
                  <option value="twitter">X / Twitter Account</option>
                  <option value="youtube">YouTube Channel</option>
                  <option value="threads">Threads Account</option>
                </select>
              </div>

              <div className="mb-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#adb5bd]">Account / Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g. ncodeloke or trendkut99"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[#868e96] focus:border-[#4c6ef5] focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#adb5bd]">Followers / Subscriber Count</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newFollowers}
                  onChange={(e) => setNewFollowers(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[#868e96] focus:border-[#4c6ef5] focus:outline-none"
                  min="0"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-white/[0.08] bg-white/5 px-[18px] py-2.5 text-sm font-semibold text-[#dee2e6] transition hover:-translate-y-px hover:bg-white/10 hover:text-white"
                  onClick={() => setIsConnectModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gradient-buffer cursor-pointer rounded-lg border-none px-[18px] py-2.5 text-sm font-semibold hover:-translate-y-px">
                  Connect Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Publisher;
