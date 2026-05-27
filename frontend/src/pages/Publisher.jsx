import React, { useEffect, useState } from 'react';
import { schedulerService, userService } from '../services/api';
import { useStudio } from '../context/StudioContext';
import { PLATFORM_THEMES, ALL_PLATFORMS } from '../constants/platforms';
import ComposerModal from '../components/ComposerModal';

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
  const {
    channels,
    selectedChannel,
    selectChannel,
    selectAllChannels,
    openConnectModal,
    fetchChannels,
  } = useStudio();

  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
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

  useEffect(() => {
    if (!selectedChannel && (activeSubTab === 'community' || activeSubTab === 'analytics')) {
      setActiveSubTab('publish');
    }
  }, [selectedChannel, activeSubTab]);

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
      await fetchChannels();
      const allPosts = await schedulerService.getScheduledPosts();
      setPosts(allPosts);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleSelectChannel = channel => {
    selectChannel(channel);
    setExpandedChannelId(channel.id);
    setActiveSubTab('publish');
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

  const getFilteredChannelPosts = () => {
    const platformFilter = selectedChannel
      ? [selectedChannel.platform]
      : channels.map(c => c.platform);

    if (platformFilter.length === 0) return [];

    return posts.filter(post => {
      const matchesPlatform = post.platforms.some(p => platformFilter.includes(p));
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

  const viewTitle = selectedChannel ? selectedChannel.accountName : 'All Channels';

  return (
    <div className="flex animate-fade-in flex-col gap-6">
      {/* Mobile channel picker (sidebar has channels on desktop) */}
      {channels.length > 0 && (
        <section className="surface-card overflow-hidden lg:hidden">
          <div className="flex gap-2 overflow-x-auto px-3 py-3 scrollbar-thin">
            <button
              type="button"
              onClick={selectAllChannels}
              className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold ${
                !selectedChannel
                  ? 'border-violet-500/50 bg-violet-600/20 text-violet-200'
                  : 'border-border bg-bg-surface/60 text-text-secondary'
              }`}
            >
              All Channels
            </button>
            {channels.map(chan => {
              const theme = PLATFORM_THEMES[chan.platform] || { icon: '❓', color: '#6366f1' };
              const isSelected = selectedChannel?.id === chan.id;
              return (
                <button
                  key={chan.id}
                  type="button"
                  onClick={() => handleSelectChannel(chan)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 ${
                    isSelected
                      ? 'border-violet-500/50 bg-violet-600/20'
                      : 'border-border bg-bg-surface/60'
                  }`}
                >
                  <img src={chan.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <span className="text-sm font-semibold" style={{ color: theme.color }}>{theme.icon}</span>
                  <span className="max-w-[90px] truncate text-sm">{chan.accountName}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => openConnectModal('instagram', true)}
              className="shrink-0 rounded-xl border border-dashed border-violet-500/40 px-3 py-2 text-sm font-semibold text-violet-300"
            >
              + Add
            </button>
          </div>
        </section>
      )}

      <main className="flex flex-col gap-5">
        {channels.length > 0 ? (
          <>
            <header className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
              <div className="flex min-w-0 flex-wrap items-center gap-4">
                {selectedChannel ? (
                  <div className="relative h-[52px] w-[52px] shrink-0">
                    <img
                      src={selectedChannel.avatar}
                      alt={selectedChannel.accountName}
                      className="h-full w-full rounded-full border-2 border-border object-cover"
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#1a1b1e] text-xs text-text-primary"
                      style={{ backgroundColor: PLATFORM_THEMES[selectedChannel.platform]?.color }}
                    >
                      {PLATFORM_THEMES[selectedChannel.platform]?.icon}
                    </span>
                  </div>
                ) : (
                  <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-border bg-violet-600/20 text-2xl">
                    ⊞
                  </div>
                )}
                <div className="flex min-w-0 flex-col">
                  <h2 className="m-0 text-[1.4rem] font-extrabold tracking-tight text-text-primary">{viewTitle}</h2>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[0.78rem] text-[#868e96]">
                    <span className="h-2 w-2 rounded-full bg-[#40c057]" />
                    {selectedChannel
                      ? `Active connection • ${selectedChannel.followersCount.toLocaleString()} subscribers`
                      : `${channels.length} connected channel${channels.length === 1 ? '' : 's'}`}
                  </div>
                </div>

                {selectedChannel && (
                <div className="ml-0 sm:ml-2">
                  {isEditingGoal ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="w-[140px] rounded-md border border-[#fd7e14]/40 bg-bg-surface-hover px-2 py-0.5 text-[0.78rem] text-text-primary focus:outline-none focus:border-[#fd7e14]"
                      />
                      <button
                        type="button"
                        className="cursor-pointer rounded-md border-none bg-[#2b8a3e] px-1.5 py-0.5 text-[10px] text-text-primary"
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
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex rounded-lg border border-white/5 bg-black/25 p-0.5">
                  <button type="button" className="cursor-pointer rounded-md border-none bg-white/[0.06] px-3 py-1.5 text-[0.8rem] font-semibold text-text-primary">
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

            <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-bg-surface/40 px-3 py-2">
              {[
                { id: 'publish', label: 'Queue', icon: '📤' },
                ...(selectedChannel
                  ? [
                      { id: 'community', label: 'Inbox', icon: '💬' },
                      { id: 'analytics', label: 'Analytics', icon: '📊' },
                    ]
                  : []),
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
                    Sent (
                    {posts.filter(p => {
                      if (p.status !== 'sent') return false;
                      if (!selectedChannel) {
                        const platforms = channels.map(c => c.platform);
                        return p.platforms.some(pl => platforms.includes(pl));
                      }
                      return p.platforms.includes(selectedChannel.platform);
                    }).length}
                    )
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
                      <h3 className="m-0 mb-4 border-b border-white/[0.04] pb-2 text-[1.15rem] font-extrabold text-text-primary">
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
                                          className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-border text-[11px]"
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
                                      className="cursor-pointer rounded border-none bg-gradient-to-br from-[#2b8a3e] to-[#237032] px-2 py-1 text-xs font-semibold text-text-primary shadow-md transition hover:-translate-y-px hover:from-[#37b24d] hover:to-[#2b8a3e]"
                                      onClick={() => handlePublishNowImmediately(slot.post.id)}
                                    >
                                      Share Now
                                    </button>
                                    <button
                                      type="button"
                                      className="cursor-pointer rounded border-none bg-gradient-to-br from-[#e03131] to-[#c92a2a] px-2 py-1 text-xs font-semibold text-text-primary transition hover:-translate-y-px"
                                      onClick={() => handleDeletePost(slot.post.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-white/[0.005] px-5 py-3.5 text-[#868e96] transition hover:translate-x-[3px] hover:border-[#4c6ef5]/30 hover:bg-[#4c6ef5]/[0.02] hover:text-[#748ffc]"
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
                      <h3 className="mb-2 text-lg font-bold text-text-primary">No drafts saved yet</h3>
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
                              className="cursor-pointer rounded border-none bg-gradient-to-br from-[#e03131] to-[#c92a2a] px-2 py-1 text-xs font-semibold text-text-primary hover:-translate-y-px"
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
                      <h3 className="mb-2 text-lg font-bold text-text-primary">No sent posts found</h3>
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
              {selectedChannel && activeSubTab === 'community' && (
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="m-0 mb-1 text-[1.3rem] font-extrabold text-text-primary">
                    Inbox: Account Feedback ({selectedChannel.accountName})
                  </h3>
                  <p className="m-0 mb-5 text-[0.88rem] text-[#868e96]">
                    Respond to customer comments and engage with your audience directly.
                  </p>

                  <div className="flex flex-col gap-4">
                    {(communityComments[selectedChannel.id] || []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center text-[#868e96]">
                        <span className="mb-3 text-4xl opacity-70">💌</span>
                        <h4 className="mb-2 text-base font-bold text-[#dee2e6]">Your Inbox is clean!</h4>
                        <p className="text-sm">No new feedback or comments on this channel.</p>
                      </div>
                    ) : (
                      (communityComments[selectedChannel.id] || []).map(comment => (
                        <div
                          key={comment.id}
                          className="rounded-xl border border-white/5 bg-white/[0.015] p-4 transition hover:border-border"
                        >
                          <div className="mb-2.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={comment.avatar}
                                alt={comment.author}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div className="flex flex-col">
                                <span className="text-[0.88rem] font-bold text-text-primary">{comment.author}</span>
                                <span className="text-[0.7rem] text-[#868e96]">{comment.timestamp}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="m-0 mb-3 text-sm leading-snug text-[#e9ecef]">{comment.content}</p>
                          </div>

                          {/* Replies thread */}
                          {comment.replies.length > 0 && (
                            <div className="mb-3 flex flex-col gap-2.5 rounded-lg border border-white/[0.02] bg-bg-surface-hover p-3.5">
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
                              className="flex-1 rounded-lg border border-white/[0.08] bg-bg-surface-hover px-3 py-1.5 text-[0.82rem] text-text-primary focus:border-[#4c6ef5] focus:outline-none"
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
              {selectedChannel && activeSubTab === 'analytics' && (
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="m-0 mb-1 text-[1.3rem] font-extrabold text-text-primary">
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
                        <span className="my-0.5 text-[1.4rem] font-extrabold text-text-primary">34,120</span>
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
                        <span className="my-0.5 text-[1.4rem] font-extrabold text-text-primary">
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
                        <span className="my-0.5 text-[1.4rem] font-extrabold text-text-primary">5.8%</span>
                        <span className="text-[0.7rem] font-bold text-[#40c057]">+1.5% higher interactions</span>
                      </div>
                    </div>
                  </div>

                  {/* Growth charts widgets */}
                  <div className="grid grid-cols-1 gap-5 max-[820px]:grid-cols-1 min-[821px]:grid-cols-[3fr_2fr]">
                    <div className="rounded-xl border border-white/5 bg-white/[0.015] p-[18px]">
                      <h4 className="m-0 mb-4 text-base font-bold text-text-primary">Weekly Growth Progress</h4>
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
                              <span className="absolute -top-[18px] text-[0.68rem] font-bold text-text-primary">
                                {item.val}
                              </span>
                            </div>
                            <span className="mt-2 text-[0.72rem] text-[#868e96]">{item.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.015] p-[18px]">
                      <h4 className="m-0 mb-4 text-base font-bold text-text-primary">Channel Demographics</h4>
                      <div className="flex flex-col gap-3.5">
                        <div className="grid grid-cols-[120px_1fr_40px] items-center gap-2.5 text-[0.8rem] font-semibold">
                          <span>India (Mumbai/Delhi)</span>
                          <div className="h-2 overflow-hidden rounded bg-bg-surface-hover">
                            <div
                              className="h-full rounded bg-gradient-to-r from-[#4c6ef5] to-[#3b5bdb]"
                              style={{ width: '45%' }}
                            />
                          </div>
                          <span>45%</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr_40px] items-center gap-2.5 text-[0.8rem] font-semibold">
                          <span>United States (NY/SF)</span>
                          <div className="h-2 overflow-hidden rounded bg-bg-surface-hover">
                            <div
                              className="h-full rounded bg-gradient-to-r from-[#4c6ef5] to-[#3b5bdb]"
                              style={{ width: '30%' }}
                            />
                          </div>
                          <span>30%</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr_40px] items-center gap-2.5 text-[0.8rem] font-semibold">
                          <span>United Kingdom (London)</span>
                          <div className="h-2 overflow-hidden rounded bg-bg-surface-hover">
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
                {ALL_PLATFORMS.slice(0, 8).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openConnectModal(p.id, false)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-surface/80 px-3 py-4 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-bg-surface-hover"
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-xs font-semibold text-text-secondary">{p.name}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="btn-primary" onClick={() => openConnectModal('instagram', true)}>
                + More channels
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. Composer Modal (Overlay) */}
      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        channels={channels}
        composerPlatforms={composerPlatforms}
        onTogglePlatform={handleComposerPlatformToggle}
        content={composerContent}
        setContent={setComposerContent}
        mediaUrl={composerMediaUrl}
        setMediaUrl={setComposerMediaUrl}
        isScheduled={composerIsScheduled}
        setIsScheduled={setComposerIsScheduled}
        dateTime={composerDateTime}
        setDateTime={setComposerDateTime}
        onSubmit={handleCreatePostSubmit}
      />

    </div>
  );
}

export default Publisher;
