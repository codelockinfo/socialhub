import React, { useEffect, useState, useRef } from 'react';
import { schedulerService, userService } from '../services/api';
import './Publisher.css';

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
    setExpandedChannelId(channel.id === expandedChannelId ? null : channel.id);
    setActiveSubTab('publish'); // default submenu
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

  return (
    <div className="buffer-page-container">
      {/* 1. Left Sidebar Panel */}
      <aside className="buffer-sidebar glass-panel">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span className="logo-svg">📈</span>
            <span className="brand-name">Buffer</span>
          </div>
          <span className="plan-badge">Free</span>
        </div>

        {/* Create CTA */}
        <button className="sidebar-create-btn" onClick={() => handleOpenComposer()}>
          <span className="plus-icon">+</span> New Post
        </button>

        {/* Sidebar Nav Links */}
        <div className="sidebar-menu">
          <div className="menu-section">
            <div className="menu-item active">
              <span className="menu-icon">📅</span>
              <span className="menu-label">Publish</span>
            </div>
          </div>

          {/* Connected Channels List Accordion */}
          <div className="channels-section-wrapper">
            <div className="channels-section-header">
              <span className="section-title">CHANNELS</span>
              <div className="section-actions">
                <button className="icon-btn" onClick={() => setIsConnectModalOpen(true)} title="Add social profile">+</button>
              </div>
            </div>

            <div className="channels-accordion">
              {channels.map(chan => {
                const theme = PLATFORM_THEMES[chan.platform] || { name: chan.platform, color: '#333', icon: '❓' };
                const isSelected = selectedChannel && selectedChannel.id === chan.id;
                const isExpanded = expandedChannelId === chan.id;
                
                return (
                  <div key={chan.id} className={`accordion-item ${isSelected ? 'selected' : ''}`}>
                    <div 
                      className="accordion-header" 
                      onClick={() => handleSelectChannel(chan)}
                    >
                      <div className="accordion-brand-info">
                        <div className="avatar-mini-wrapper">
                          <img src={chan.avatar} alt={chan.accountName} className="avatar-mini" />
                          <span className="badge-mini" style={{ backgroundColor: theme.color }}>{theme.icon}</span>
                        </div>
                        <span className="chan-username">{chan.accountName}</span>
                      </div>
                      <div className="accordion-meta">
                        <span className="followers-badge">
                          {(chan.followersCount || 0) >= 1000 
                            ? `${((chan.followersCount || 0) / 1000).toFixed(1)}k` 
                            : chan.followersCount}
                        </span>
                        <button 
                          className="btn-trash" 
                          onClick={(e) => handleDisconnectChannel(chan.id, e)}
                          title="Disconnect channel"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Submenu links (only shown if expanded) */}
                    {isExpanded && (
                      <div className="accordion-submenu animate-slide-down">
                        <div 
                          className={`submenu-item ${activeSubTab === 'publish' ? 'active' : ''}`}
                          onClick={() => setActiveSubTab('publish')}
                        >
                          <span className="sub-icon">📤</span> Queue / Timeline
                        </div>
                        <div 
                          className={`submenu-item ${activeSubTab === 'community' ? 'active' : ''}`}
                          onClick={() => setActiveSubTab('community')}
                        >
                          <span className="sub-icon">💬</span> Community Inbox
                        </div>
                        <div 
                          className={`submenu-item ${activeSubTab === 'analytics' ? 'active' : ''}`}
                          onClick={() => setActiveSubTab('analytics')}
                        >
                          <span className="sub-icon">📊</span> Analytics / Growth
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Connect footer */}
        <div className="connect-channels-footer">
          <div className="connect-label">Connect Channels</div>
          <div className="footer-platform-row">
            <span className="f-icon" onClick={() => setIsConnectModalOpen(true)} title="Connect Threads">🧵</span>
            <span className="f-icon" onClick={() => setIsConnectModalOpen(true)} title="Connect LinkedIn">💼</span>
            <span className="f-icon" onClick={() => setIsConnectModalOpen(true)} title="Connect YouTube">📺</span>
            <span className="f-icon" onClick={() => setIsConnectModalOpen(true)} title="Connect Facebook">🔵</span>
          </div>
        </div>

        {currentUser && (
          <div className="sidebar-profile-card">
            <img src={currentUser.avatar} alt={currentUser.fullName} className="prof-avatar" />
            <div className="prof-info">
              <span className="prof-name">{currentUser.fullName}</span>
              <span className="prof-org">My Organization</span>
            </div>
          </div>
        )}
      </aside>

      {/* 2. Main Work Panel */}
      <main className="buffer-main-workspace">
        {selectedChannel ? (
          <>
            {/* Header section */}
            <header className="workspace-header glass-panel">
              <div className="header-channel-details">
                <div className="header-avatar-circle">
                  <img src={selectedChannel.avatar} alt={selectedChannel.accountName} className="header-avatar" />
                  <span className="header-badge" style={{ backgroundColor: PLATFORM_THEMES[selectedChannel.platform]?.color }}>
                    {PLATFORM_THEMES[selectedChannel.platform]?.icon}
                  </span>
                </div>
                <div className="header-info-col">
                  <h2>{selectedChannel.accountName}</h2>
                  <div className="header-status-line">
                    <span className="status-indicator"></span> 
                    Active connection • {selectedChannel.followersCount.toLocaleString()} Subscribers
                  </div>
                </div>

                <div className="goal-container">
                  {isEditingGoal ? (
                    <div className="goal-editor">
                      <input 
                        type="text" 
                        value={goalInput} 
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="goal-input"
                      />
                      <button className="goal-save-btn" onClick={handleGoalSave}>✓</button>
                    </div>
                  ) : (
                    <div className="goal-badge" onClick={() => setIsEditingGoal(true)}>
                      🎯 Goal: {postingGoal} <span className="pencil">✏️</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="header-actions-row">
                <div className="view-selector">
                  <button className="view-btn active">📑 List View</button>
                  <button className="view-btn">📅 Calendar</button>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenComposer()}>
                  + New Post
                </button>
              </div>
            </header>

            {/* Sub-menu Navigation (Queue, Sent, Drafts, Inbox, etc.) */}
            {activeSubTab === 'publish' && (
              <div className="workspace-tabs-row glass-panel">
                <div className="secondary-tabs">
                  <button 
                    className={`subtab-btn ${activeQueueSubTab === 'queue' ? 'active' : ''}`}
                    onClick={() => setActiveQueueSubTab('queue')}
                  >
                    Queue
                  </button>
                  <button 
                    className={`subtab-btn ${activeQueueSubTab === 'drafts' ? 'active' : ''}`}
                    onClick={() => setActiveQueueSubTab('drafts')}
                  >
                    Drafts
                  </button>
                  <button 
                    className={`subtab-btn ${activeQueueSubTab === 'sent' ? 'active' : ''}`}
                    onClick={() => setActiveQueueSubTab('sent')}
                  >
                    Sent ({posts.filter(p => p.status === 'sent' && p.platforms.includes(selectedChannel.platform)).length})
                  </button>
                </div>

                <div className="workspace-timezone-indicator">
                  <span className="tz-icon">🌎</span> Timezone: <strong>Asia/Kolkata (IST)</strong>
                </div>
              </div>
            )}

            {/* Workspace View Renderer */}
            <div className="workspace-content-pane">
              
              {/* Tab: Publish Timeline Queue */}
              {activeSubTab === 'publish' && activeQueueSubTab === 'queue' && (
                <div className="timeline-view-wrapper glass-panel">
                  {getGroupedTimeline().map((day, dIdx) => (
                    <div key={dIdx} className="timeline-day-group">
                      <h3 className="timeline-day-title">{day.label}</h3>
                      
                      <div className="timeline-slots-container">
                        {day.slots.map((slot, sIdx) => (
                          <div key={sIdx} className={`timeline-slot-item ${slot.post ? 'has-post' : 'is-empty'}`}>
                            {/* Left Time label */}
                            <div className="slot-time-col">
                              <span className="time-badge">{slot.time}</span>
                            </div>

                            {/* Timeline Connector Line node */}
                            <div className="slot-connector-col">
                              <div className="connector-bullet"></div>
                              <div className="connector-line"></div>
                            </div>

                            {/* Right Content display */}
                            <div className="slot-content-col">
                              {slot.post ? (
                                <div className="timeline-post-card">
                                  <div className="post-header-info">
                                    <div className="targeted-badges">
                                      {slot.post.platforms.map(p => (
                                        <span 
                                          key={p} 
                                          className="platform-micro-icon"
                                          style={{ backgroundColor: PLATFORM_THEMES[p]?.color }}
                                          title={PLATFORM_THEMES[p]?.name}
                                        >
                                          {PLATFORM_THEMES[p]?.icon}
                                        </span>
                                      ))}
                                    </div>
                                    <span className="post-countdown-alert">
                                      ⏱️ {renderCountdown(slot.post.scheduledTime)}
                                    </span>
                                  </div>
                                  
                                  <p className="post-text">{slot.post.content}</p>
                                  
                                  {slot.post.mediaUrl && (
                                    <div className="post-media-box">
                                      <img src={slot.post.mediaUrl} alt="Scheduled attached file" className="post-media-img" />
                                    </div>
                                  )}

                                  <div className="post-card-actions">
                                    <button 
                                      className="btn btn-success btn-xs"
                                      onClick={() => handlePublishNowImmediately(slot.post.id)}
                                    >
                                      Share Now
                                    </button>
                                    <button 
                                      className="btn btn-danger btn-xs"
                                      onClick={() => handleDeletePost(slot.post.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="timeline-empty-slot-placeholder"
                                  onClick={() => handleOpenComposer(slot.dateKey, slot.time)}
                                >
                                  <span className="plus-sign">+</span>
                                  <span className="placeholder-text">
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
                <div className="drafts-view-container glass-panel">
                  {getFilteredChannelPosts().length === 0 ? (
                    <div className="empty-state-workspace">
                      <span>📝</span>
                      <h3>No drafts saved yet</h3>
                      <p>Save posts as drafts inside the composer to keep them as ideas.</p>
                    </div>
                  ) : (
                    <div className="drafts-list-grid">
                      {getFilteredChannelPosts().map(draft => (
                        <div key={draft.id} className="draft-post-card">
                          <p className="draft-content">{draft.content}</p>
                          {draft.mediaUrl && (
                            <img src={draft.mediaUrl} alt="Attached draft" className="draft-image" />
                          )}
                          <div className="draft-actions">
                            <button 
                              className="btn btn-primary btn-xs"
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
                              className="btn btn-danger btn-xs"
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
                <div className="sent-view-container glass-panel">
                  {getFilteredChannelPosts().length === 0 ? (
                    <div className="empty-state-workspace">
                      <span>📤</span>
                      <h3>No sent posts found</h3>
                      <p>Once your posts are successfully shared on social channels, they will be listed here.</p>
                    </div>
                  ) : (
                    <div className="sent-posts-grid">
                      {getFilteredChannelPosts().map(post => (
                        <div key={post.id} className="sent-post-card">
                          <div className="sent-header">
                            <span className="published-stamp">
                              ✅ Published on {new Date(post.scheduledTime).toLocaleString()}
                            </span>
                          </div>

                          <div className="sent-body">
                            <p className="sent-text">{post.content}</p>
                            {post.mediaUrl && (
                              <img src={post.mediaUrl} alt="Published media" className="sent-image" />
                            )}
                          </div>

                          {/* Analytics Widgets */}
                          <div className="sent-analytics-row">
                            <div className="metric-box">
                              <span className="metric-label">Reach</span>
                              <span className="metric-val">{(post.reachCount || 0).toLocaleString()}</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Likes</span>
                              <span className="metric-val">{(post.likesCount || 0).toLocaleString()}</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Comments</span>
                              <span className="metric-val">{(post.commentsCount || 0).toLocaleString()}</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Shares</span>
                              <span className="metric-val">{(post.sharesCount || 0).toLocaleString()}</span>
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
                <div className="community-inbox-container glass-panel">
                  <h3>Inbox: Account Feedback ({selectedChannel.accountName})</h3>
                  <p className="subtitle">Respond to customer comments and engage with your audience directly.</p>

                  <div className="inbox-messages-list">
                    {(communityComments[selectedChannel.id] || []).length === 0 ? (
                      <div className="empty-state-inbox">
                        <span>💌</span>
                        <h4>Your Inbox is clean!</h4>
                        <p>No new feedback or comments on this channel.</p>
                      </div>
                    ) : (
                      (communityComments[selectedChannel.id] || []).map(comment => (
                        <div key={comment.id} className="message-item-card">
                          <div className="msg-header">
                            <div className="msg-author-meta">
                              <img src={comment.avatar} alt={comment.author} className="msg-avatar" />
                              <div className="msg-author-details">
                                <span className="author-name">{comment.author}</span>
                                <span className="author-time">{comment.timestamp}</span>
                              </div>
                            </div>
                          </div>

                          <div className="msg-body">
                            <p className="msg-text">{comment.content}</p>
                          </div>

                          {/* Replies thread */}
                          {comment.replies.length > 0 && (
                            <div className="replies-thread-box">
                              {comment.replies.map((reply, rIdx) => (
                                <div key={rIdx} className="thread-reply-item">
                                  <span className="reply-avatar">⚡</span>
                                  <div className="reply-content-box">
                                    <span className="reply-author">@{reply.author}</span>
                                    <p className="reply-text">{reply.content}</p>
                                    <span className="reply-time">{reply.timestamp}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply composition panel */}
                          <div className="msg-reply-composer">
                            <input 
                              type="text" 
                              placeholder="Write a reply as admin..." 
                              value={newReplyText[comment.id] || ''}
                              onChange={(e) => setNewReplyText({ ...newReplyText, [comment.id]: e.target.value })}
                              className="reply-text-input"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddReply(comment.id);
                              }}
                            />
                            <button 
                              className="btn btn-primary btn-xs"
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
                <div className="analytics-dashboard-container glass-panel">
                  <h3>Performance Report ({selectedChannel.accountName})</h3>
                  <p className="subtitle">Social media audience analytics, reach metrics, and follower growth stats.</p>

                  {/* Summary widgets grid */}
                  <div className="analytics-grid">
                    <div className="stat-widget-card">
                      <div className="widget-icon" style={{ backgroundColor: 'rgba(76, 110, 245, 0.15)', color: '#4c6ef5' }}>📊</div>
                      <div className="widget-details">
                        <span className="widget-title">Impressions</span>
                        <span className="widget-value">34,120</span>
                        <span className="widget-badge up">+12.4% vs last week</span>
                      </div>
                    </div>

                    <div className="stat-widget-card">
                      <div className="widget-icon" style={{ backgroundColor: 'rgba(64, 192, 87, 0.15)', color: '#40c057' }}>👥</div>
                      <div className="widget-details">
                        <span className="widget-title">Audience Growth</span>
                        <span className="widget-value">+{selectedChannel.followersCount ? Math.floor(selectedChannel.followersCount * 0.08) : 124}</span>
                        <span className="widget-badge up">+8.2% new subscribers</span>
                      </div>
                    </div>

                    <div className="stat-widget-card">
                      <div className="widget-icon" style={{ backgroundColor: 'rgba(253, 126, 20, 0.15)', color: '#fd7e14' }}>✨</div>
                      <div className="widget-details">
                        <span className="widget-title">Engagement Rate</span>
                        <span className="widget-value">5.8%</span>
                        <span className="widget-badge up">+1.5% higher interactions</span>
                      </div>
                    </div>
                  </div>

                  {/* Growth charts widgets */}
                  <div className="chart-widgets-row">
                    <div className="chart-card-box">
                      <h4>Weekly Growth Progress</h4>
                      <div className="bar-chart-container">
                        {[
                          { day: 'Mon', val: '65%' },
                          { day: 'Tue', val: '75%' },
                          { day: 'Wed', val: '80%' },
                          { day: 'Thu', val: '92%' },
                          { day: 'Fri', val: '88%' },
                          { day: 'Sat', val: '95%' },
                          { day: 'Sun', val: '100%' }
                        ].map((item, idx) => (
                          <div key={idx} className="chart-column">
                            <div className="bar-fill" style={{ height: item.val }}>
                              <span className="bar-label">{item.val}</span>
                            </div>
                            <span className="column-day">{item.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="performance-table-box">
                      <h4>Channel Demographics</h4>
                      <div className="demographics-list">
                        <div className="demo-item">
                          <span>India (Mumbai/Delhi)</span>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-fill" style={{ width: '45%' }}></div>
                          </div>
                          <span>45%</span>
                        </div>
                        <div className="demo-item">
                          <span>United States (NY/SF)</span>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-fill" style={{ width: '30%' }}></div>
                          </div>
                          <span>30%</span>
                        </div>
                        <div className="demo-item">
                          <span>United Kingdom (London)</span>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-fill" style={{ width: '15%' }}></div>
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
          <div className="empty-state-main glass-panel">
            <span>🔌</span>
            <h2>Get Started by Connecting a Channel</h2>
            <p>Connect your Facebook, Instagram, LinkedIn, or YouTube account to manage your queues.</p>
            <button className="btn btn-primary" onClick={() => setIsConnectModalOpen(true)}>
              Connect Social Channel
            </button>
          </div>
        )}
      </main>

      {/* 3. Composer Modal (Overlay) */}
      {isComposerOpen && (
        <div className="modal-backdrop">
          <div className="composer-overlay-modal glass-panel animate-scale-up">
            <div className="modal-header">
              <h3>Compose Social Post</h3>
              <button className="modal-close" onClick={() => setIsComposerOpen(false)}>✕</button>
            </div>

            <form onSubmit={(e) => handleCreatePostSubmit(e)}>
              {/* Select platforms checkboxes */}
              <div className="form-group">
                <label>Select channels to publish to:</label>
                <div className="composer-platform-selectors">
                  {channels.map(chan => {
                    const theme = PLATFORM_THEMES[chan.platform];
                    const isChecked = composerPlatforms.includes(chan.platform);
                    return (
                      <button
                        key={chan.id}
                        type="button"
                        className={`platform-select-btn ${isChecked ? 'selected' : ''}`}
                        onClick={() => handleComposerPlatformToggle(chan.platform)}
                        style={{ '--platform-color': theme.color }}
                      >
                        <img src={chan.avatar} alt={chan.accountName} className="btn-avatar" />
                        <span className="btn-icon">{theme.icon}</span>
                        {isChecked && <span className="checkmark">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text content area */}
              <div className="form-group">
                <div className="textarea-header">
                  <label>Caption</label>
                  <span className="char-count">{composerContent.length} characters</span>
                </div>
                <textarea
                  className="composer-textarea"
                  placeholder="Draft your post details here..."
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  required
                />
                <div className="emoji-quick-row">
                  {['🚀', '✨', '🔥', '🌗', '💻', '🎉', '💡', '👇'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className="emoji-btn"
                      onClick={() => setComposerContent(prev => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image url attachment */}
              <div className="form-group">
                <label>Attached Image / Media Link</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={composerMediaUrl}
                  onChange={(e) => setComposerMediaUrl(e.target.value)}
                  className="composer-input"
                />
                
                <div className="preset-images-label">Or select template photo:</div>
                <div className="preset-images-grid">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`preset-image-btn ${composerMediaUrl === img.url ? 'active' : ''}`}
                      onClick={() => setComposerMediaUrl(img.url)}
                      style={{ backgroundImage: `url(${img.url})` }}
                    />
                  ))}
                  {composerMediaUrl && (
                    <button
                      type="button"
                      className="clear-media-btn"
                      onClick={() => setComposerMediaUrl('')}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {composerMediaUrl && (
                  <div className="media-preview-container">
                    <img src={composerMediaUrl} alt="Attached Preview" className="media-preview" />
                  </div>
                )}
              </div>

              {/* Scheduling check */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={composerIsScheduled}
                    onChange={(e) => setComposerIsScheduled(e.target.checked)}
                  />
                  Schedule this post for a specific time
                </label>
              </div>

              {composerIsScheduled && (
                <div className="form-group schedule-time-picker animate-slide-down">
                  <label>Choose Date & Time</label>
                  <input
                    type="datetime-local"
                    value={composerDateTime}
                    onChange={(e) => setComposerDateTime(e.target.value)}
                    className="composer-input"
                    required
                  />
                </div>
              )}

              {/* Actions row */}
              <div className="composer-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => handleCreatePostSubmit(e, 'draft')}
                >
                  Save Draft
                </button>

                {composerIsScheduled ? (
                  <button type="submit" className="btn btn-primary">
                    Schedule Post
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success"
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
        <div className="modal-backdrop">
          <div className="connect-modal glass-panel animate-scale-up">
            <div className="modal-header">
              <h3>Connect Social Channel</h3>
              <button className="modal-close" onClick={() => setIsConnectModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleConnectChannelSubmit}>
              <div className="form-group">
                <label>Select Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="composer-input"
                >
                  <option value="facebook">Facebook Page</option>
                  <option value="instagram">Instagram Professional Account</option>
                  <option value="linkedin">LinkedIn Profile</option>
                  <option value="twitter">X / Twitter Account</option>
                  <option value="youtube">YouTube Channel</option>
                  <option value="threads">Threads Account</option>
                </select>
              </div>

              <div className="form-group">
                <label>Account / Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g. ncodeloke or trendkut99"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="composer-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Followers / Subscriber Count</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newFollowers}
                  onChange={(e) => setNewFollowers(e.target.value)}
                  className="composer-input"
                  min="0"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsConnectModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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
