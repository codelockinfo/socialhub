import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { PLATFORM_THEMES } from '../constants/platforms';
import { FaHashtag, FaImage, FaMagic, FaTimes, FaExpand, FaCheckSquare, FaPinterest, FaInstagram } from 'react-icons/fa';
import { FaFaceSmile } from 'react-icons/fa6';
import { IoImageOutline, IoMusicalNotesOutline, IoTextOutline, IoPricetagOutline } from 'react-icons/io5';

export default function ComposerModal({
  isOpen,
  onClose,
  channels,
  composerPlatforms,
  onTogglePlatform,
  content,
  setContent,
  mediaUrl,
  setMediaUrl,
  isScheduled,
  setIsScheduled,
  dateTime,
  setDateTime,
  onSubmit,
}) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  
  // Post type state (global instead of Instagram only)
  const [postType, setPostType] = useState('Post'); // Post, Reel, Story

  const [isVideo, setIsVideo] = useState(false);
  const fileInputRef = React.useRef(null);

  if (!isOpen) return null;

  // When customizing, we only preview the active tab. Otherwise we preview all selected.
  const platformsToPreview = isCustomizing && activeTab ? [activeTab] : composerPlatforms;

  const handleCustomizeClick = () => {
    if (!isCustomizing && composerPlatforms.length > 0) {
      setIsCustomizing(true);
      setActiveTab(composerPlatforms[0]);
    } else {
      setIsCustomizing(false);
      setActiveTab(null);
    }
  };

  const handleTabClick = (platform) => {
    if (isCustomizing) {
      setActiveTab(platform);
    } else {
      onTogglePlatform(platform);
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      setIsVideo(isVid);
      
      // Auto-correct postType based on media type
      if (isVid && postType === 'Post') {
        setPostType('Reel');
      } else if (!isVid && postType === 'Reel') {
        setPostType('Post');
      }

      // Create a local URL for preview
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
    }
  };

  const clearMedia = (e) => {
    e.stopPropagation();
    setMediaUrl('');
    setIsVideo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ height: '85vh', maxHeight: '800px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
          <div className="flex items-center gap-4">
            <h2 className="m-0 text-lg font-bold text-gray-800">Create Post</h2>
            <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              <FaHashtag /> Tags <span className="text-[10px]">▼</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800">
              <IoImageOutline className="text-lg" /> Templates
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800">
              <FaMagic className="text-violet-500" /> AI Assistant
            </button>
            <button 
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition ${isPreviewVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            >
              <IoImageOutline /> Preview
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <button className="text-gray-400 hover:text-gray-600">
              <FaExpand />
            </button>
            <button className="text-xl text-gray-400 hover:text-gray-600" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Left Column - Editor */}
          <div className={`flex flex-col p-5 overflow-y-auto bg-white ${isPreviewVisible ? 'w-1/2' : 'w-full'}`}>
            
            {/* Account Selector Row (Acts as Tabs if customizing) */}
            <div className="mb-4 flex flex-wrap gap-2">
              {channels.map(chan => {
                const theme = PLATFORM_THEMES[chan.platform];
                const isSelected = composerPlatforms.includes(chan.platform);
                
                // If customizing, only show selected platforms as tabs
                if (isCustomizing && !isSelected) return null;

                const isTabActive = isCustomizing && activeTab === chan.platform;

                return (
                  <button
                    key={chan.id}
                    onClick={() => handleTabClick(chan.platform)}
                    className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 transition ${
                      isCustomizing 
                        ? (isTabActive ? 'border-transparent ring-2 ring-red-500 ring-offset-2 opacity-100' : 'border-gray-200 opacity-50 hover:opacity-100')
                        : (isSelected ? 'border-transparent ring-2 ring-red-500 ring-offset-2 opacity-100' : 'border-gray-200 opacity-60 hover:opacity-100')
                    }`}
                  >
                    <img src={chan.avatar} alt={chan.accountName} className="h-full w-full object-cover" />
                    <span 
                      className="absolute bottom-0 right-0 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[9px] text-white border border-white"
                      style={{ backgroundColor: theme?.color || '#000' }}
                    >
                      {theme?.icon}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Editor Box */}
            <div className="relative mb-4 flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden p-1">
              
              {/* Post Type Selector */}
              <div className="flex items-center gap-6 border-b border-gray-100 p-3 bg-gray-50/50">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Post Type:</span>
                <div className="flex items-center gap-5 text-sm font-semibold text-gray-700">
                  <label className={`flex items-center gap-1.5 ${mediaUrl && isVideo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input type="radio" name="postType" checked={postType === 'Post'} onChange={() => setPostType('Post')} disabled={mediaUrl && isVideo} className="accent-green-600 w-4 h-4 disabled:cursor-not-allowed" /> Post
                  </label>
                  <label className={`flex items-center gap-1.5 ${mediaUrl && !isVideo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input type="radio" name="postType" checked={postType === 'Reel'} onChange={() => setPostType('Reel')} disabled={mediaUrl && !isVideo} className="accent-green-600 w-4 h-4 disabled:cursor-not-allowed" /> Reel
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="postType" checked={postType === 'Story'} onChange={() => setPostType('Story')} className="accent-green-600 w-4 h-4" /> Story
                  </label>
                </div>
              </div>

              {/* Text Area Container */}
              <div className="flex min-h-[140px] items-start p-3">
                <textarea
                  className="min-h-[120px] w-full resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                  placeholder="Start writing or get inspired with Templates"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between border-t border-gray-100 p-2 px-4">
                <div className="flex items-center gap-3 text-gray-500">
                  <button className="flex items-center gap-1 hover:text-gray-800"><span className="text-lg">+</span> <span className="text-xs">▼</span></button>
                  <button className="hover:text-gray-800"><FaFaceSmile /></button>
                  <button className="hover:text-gray-800"><FaHashtag /></button>
                </div>
                <div className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-medium">
                  2187
                </div>
              </div>
            </div>

            {/* Media Upload Zone */}
            <div 
              className="mb-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 w-32 h-32 transition hover:border-green-500 hover:bg-green-50 cursor-pointer overflow-hidden relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {mediaUrl ? (
                <>
                  {isVideo ? (
                    <video src={mediaUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                  ) : (
                    <img src={mediaUrl} alt="Uploaded media" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <button 
                      onClick={clearMedia}
                      className="text-white bg-red-500 rounded-full p-2 hover:bg-red-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <IoImageOutline className="mb-2 text-2xl text-gray-400" />
                  <p className="text-xs text-center font-medium text-gray-500">
                    Drag & drop or <br/><span className="text-green-600">select a file</span>
                  </p>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleMediaUpload} 
                accept="image/*,video/*"
              />
            </div>
            
            {/* Instagram Specific Bottom Options */}
            {isCustomizing && activeTab === 'instagram' && (
              <div className="flex flex-col gap-4 py-2">
                <div className="flex items-center gap-4">
                  <span className="w-24 text-xs font-semibold text-gray-600">Add Stickers</span>
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"><IoMusicalNotesOutline /> Music</button>
                    <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"><IoTextOutline /> Text</button>
                    <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"><FaHashtag /> Topics</button>
                    <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"><IoPricetagOutline /> Tag Products</button>
                    <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">⚙ Automatic ▼</button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-24 text-xs font-semibold text-gray-600">First Comment</span>
                  <input type="text" placeholder="Your comment" className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-green-500 focus:outline-none" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-24 text-xs font-semibold text-gray-600">Share to Feed</span>
                  <div className="relative inline-block w-8 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 border-green-500 appearance-none cursor-pointer" defaultChecked style={{ right: 0 }}/>
                      <label htmlFor="toggle" className="toggle-label block overflow-hidden h-4 rounded-full bg-green-500 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Live Preview */}
          {isPreviewVisible && (
            <div className="flex w-1/2 flex-col bg-[#f8f9fa] p-5 border-l border-gray-200 overflow-y-auto">
              <div className="mb-6 flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-800">
                  {isCustomizing && activeTab ? `${PLATFORM_THEMES[activeTab]?.name} Preview` : 'Post Previews'}
                </h3>
                <span className="cursor-help rounded-full border border-gray-300 text-xs text-gray-500 w-4 h-4 flex items-center justify-center">i</span>
              </div>

              {/* Mockup Containers */}
              <div className="flex flex-col gap-8 flex-1 items-center">
                {platformsToPreview.length === 0 && (
                  <p className="text-sm text-gray-500">Select a platform to see preview</p>
                )}
                {platformsToPreview.map(platform => {
                  const theme = PLATFORM_THEMES[platform];
                  const channel = channels.find(c => c.platform === platform);
                  
                  // Reel UI
                  if (postType === 'Reel') {
                    return (
                      <div key={platform} className="w-[300px] h-[550px] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.1)] overflow-hidden relative bg-gradient-to-b from-gray-800 to-black text-white flex flex-col justify-end p-4">
                        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                          {mediaUrl ? (
                            isVideo ? (
                              <video src={mediaUrl} className="w-full h-full object-cover opacity-60" autoPlay loop muted playsInline />
                            ) : (
                              <img src={mediaUrl} className="w-full h-full object-cover opacity-60" />
                            )
                          ) : (
                            theme?.icon
                          )}
                        </div>
                        <div className="relative z-10 flex items-end justify-between w-full">
                          <div className="flex flex-col gap-2 w-3/4">
                            <div className="flex items-center gap-2">
                              <img src={channel?.avatar || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full border border-white" />
                              <span className="text-sm font-bold">{channel?.accountName || 'Unknown'}</span>
                              <button className="text-xs font-semibold px-2 py-0.5 border border-white rounded-md">Follow</button>
                            </div>
                            <div className="text-sm line-clamp-2">
                              {content || 'Your reel caption here...'}
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-4 text-xl">
                            <div className="flex flex-col items-center gap-1"><span className="hover:text-red-500 cursor-pointer">♡</span><span className="text-xs">0</span></div>
                            <div className="flex flex-col items-center gap-1"><span className="hover:text-blue-500 cursor-pointer">💬</span><span className="text-xs">0</span></div>
                            <div className="flex flex-col items-center gap-1"><span className="hover:text-green-500 cursor-pointer">🔁</span></div>
                            <div className="flex flex-col items-center gap-1"><span className="hover:text-gray-300 cursor-pointer">🔖</span></div>
                            <img src={channel?.avatar} className="w-6 h-6 rounded-md border border-white mt-2" />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Story UI
                  if (postType === 'Story') {
                    return (
                      <div key={platform} className="w-[300px] h-[550px] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.1)] overflow-hidden relative bg-gray-900 text-white flex flex-col">
                        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                          {mediaUrl ? (
                            isVideo ? (
                              <video src={mediaUrl} className="w-full h-full object-cover opacity-80" autoPlay loop muted playsInline />
                            ) : (
                              <img src={mediaUrl} className="w-full h-full object-cover opacity-80" />
                            )
                          ) : (
                            theme?.icon
                          )}
                        </div>
                        
                        <div className="relative z-10 flex flex-col p-4 w-full bg-gradient-to-b from-black/50 to-transparent pt-6">
                          <div className="w-full h-0.5 bg-white/30 rounded-full mb-3 flex overflow-hidden">
                             <div className="h-full bg-white w-1/3"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <img src={channel?.avatar || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full border border-white" />
                            <span className="text-sm font-bold">{channel?.accountName || 'Unknown'}</span>
                            <span className="text-xs text-gray-300 ml-1">1h</span>
                            <span className="ml-auto text-xl">⋮</span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto p-4 flex items-center gap-2">
                          <div className="flex-1 rounded-full border border-white/50 px-4 py-2 text-sm text-white/70">Send message</div>
                          <span className="text-xl">♡</span>
                          <span className="text-xl">✈</span>
                        </div>
                      </div>
                    );
                  }

                  // Default UI
                  return (
                    <div key={platform} className="flex flex-col gap-2 w-[320px]">
                      {!isCustomizing && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <span style={{ color: theme?.color }}>{theme?.icon}</span> {theme?.name}
                        </div>
                      )}
                      <div className="w-full rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-200 overflow-hidden relative">
                         <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                           <img src={channel?.avatar || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full border border-gray-100" />
                           <span className="text-sm font-bold text-gray-800">{channel?.accountName || 'Unknown'}</span>
                           <span className="ml-auto text-gray-400 font-bold tracking-widest leading-none mb-2">...</span>
                         </div>
                         <div className="h-72 w-full bg-gray-100 flex items-center justify-center text-4xl text-gray-300 overflow-hidden relative">
                            {mediaUrl ? (
                              isVideo ? (
                                <video src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
                              ) : (
                                <img src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" />
                              )
                            ) : (
                              theme?.icon
                            )}
                         </div>
                         <div className="flex items-center gap-3 px-3 pt-3 text-lg text-gray-600">
                           <span className="hover:text-red-500 cursor-pointer">♡</span>
                           <span className="hover:text-blue-500 cursor-pointer">💬</span>
                           <span className="hover:text-green-500 cursor-pointer">🔁</span>
                           <span className="ml-auto hover:text-gray-800 cursor-pointer">🔖</span>
                         </div>
                         <div className="p-3 text-sm text-gray-800 whitespace-pre-wrap">
                           <span className="font-bold mr-2">{channel?.accountName || 'Unknown'}</span>
                           {content || <span className="text-gray-400 font-normal">See your post's preview here</span>}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-green-500" />
              Create Another
            </label>
            <div className="h-4 w-px bg-gray-200"></div>
            <button className="text-sm font-semibold text-gray-500 hover:text-gray-800" onClick={(e) => onSubmit(e, 'draft')}>
              Save Draft
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-gray-300 bg-white shadow-sm overflow-hidden">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-200">
                <FaCheckSquare className="text-gray-400" /> Next Available <span className="text-xs text-gray-400">▼</span>
              </button>
              {isCustomizing ? (
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => onSubmit(e, 'sent')}
                  disabled={!content}
                >
                  Schedule Post
                </button>
              ) : (
                <button 
                  className="bg-[#d3f9d8] hover:bg-[#b2f2bb] text-[#2b8a3e] px-6 py-2 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCustomizeClick}
                  disabled={composerPlatforms.length === 0}
                >
                  Customize for each network ➔
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
