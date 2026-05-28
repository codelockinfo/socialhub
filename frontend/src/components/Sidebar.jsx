import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { userService } from "../services/api";
import { useStudioOptional } from "../context/StudioContext";
import {
  ALL_PLATFORMS,
  PLATFORM_THEMES,
} from "../constants/platforms";
import { Plus, PenTool, LayoutGrid, MessageCircle, BarChart3, ChevronDown, ChevronRight, Layers } from "lucide-react";

function Sidebar() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const studio = useStudioOptional();
  
  const [expandedChannel, setExpandedChannel] = useState(null);

  useEffect(() => {
    userService.getCurrentUser().then((data) => setUser(data));
  }, []);

  // Use optional studio context safely
  const channels = studio?.channels || [];
  const selectedChannel = studio?.selectedChannel;
  const selectChannel = studio?.selectChannel || (() => {});
  const openConnectModal = studio?.openConnectModal || (() => {});

  const handleChannelClick = (chan) => {
    if (expandedChannel === chan.id) {
      setExpandedChannel(null);
    } else {
      setExpandedChannel(chan.id);
      selectChannel(chan);
    }
  };

  const navItemClass = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-slate-400 hover:text-slate-100 hover:bg-white/5";
  const activeNavItemClass = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-indigo-400 bg-indigo-500/10";

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-[#0b1120] md:bottom-auto md:left-0 md:top-0 md:flex md:h-screen md:w-[260px] md:flex-col md:border-r md:border-t-0 overflow-y-auto scrollbar-hide">
      
      {/* 1. Header & Create Button */}
      <div className="p-4 md:p-6 pb-2">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30">
            <Layers className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SocialHub</span>
        </div>

        <button 
          className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 px-4 transition-all shadow-lg shadow-emerald-500/20"
          onClick={() => {}}
        >
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      {/* 2. Primary Navigation */}
      <div className="px-4 py-2 flex flex-col gap-1">
        <NavLink to="/publisher/create" className={navItemClass}>
          <PenTool className="h-4 w-4" /> Create
        </NavLink>
        <NavLink to="/publisher" className={location.pathname === '/publisher' && !selectedChannel ? activeNavItemClass : navItemClass} onClick={() => selectChannel(null)}>
          <LayoutGrid className="h-4 w-4" /> Publish
          <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">0</span>
        </NavLink>
        <NavLink to="/publisher/community" className={navItemClass}>
          <MessageCircle className="h-4 w-4" /> Community
        </NavLink>
      </div>

      {/* 3. Channels List */}
      <div className="px-4 pt-4 pb-2 mt-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block px-2">Channels</span>
        <div className="flex flex-col gap-1">
          {channels.map((chan) => {
            const isExpanded = expandedChannel === chan.id;
            const theme = PLATFORM_THEMES[chan.platform] || { icon: "❓", color: "#6366f1" };
            
            return (
              <div key={chan.id}>
                <button
                  onClick={() => handleChannelClick(chan)}
                  className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                    isExpanded ? 'bg-white/5 text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="relative h-6 w-6 shrink-0">
                    <img src={chan.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                    <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full text-[8px] text-white" style={{ backgroundColor: theme.color }}>
                      {theme.icon}
                    </span>
                  </div>
                  <span className="truncate font-medium flex-1 text-left">{chan.accountName}</span>
                  {isExpanded ? <ChevronDown className="h-3 w-3 text-slate-500" /> : <ChevronRight className="h-3 w-3 text-slate-600" />}
                </button>
                
                {/* Nested Sub-menu */}
                {isExpanded && (
                  <div className="ml-8 mt-1 mb-2 flex flex-col gap-1 border-l border-white/10 pl-2">
                    <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-indigo-400 bg-indigo-500/10 font-medium">
                      <LayoutGrid className="h-3.5 w-3.5" /> Publish
                    </button>
                    <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-slate-400 hover:text-slate-200 hover:bg-white/5">
                      <MessageCircle className="h-3.5 w-3.5" /> Community
                    </button>
                    <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-slate-400 hover:text-slate-200 hover:bg-white/5">
                      <BarChart3 className="h-3.5 w-3.5" /> Analytics
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Connect Channels */}
      <div className="px-4 py-4 mt-auto border-t border-white/5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block px-2">Connect Channels</span>
        <div className="flex flex-col gap-1">
          {['instagram', 'linkedin', 'facebook'].map(pid => {
            const plat = ALL_PLATFORMS.find(p => p.id === pid);
            if(!plat) return null;
            return (
              <button key={pid} onClick={() => openConnectModal(pid, false)} className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
                <span className="text-lg" style={{ color: plat.color }}>{plat.icon}</span>
                {plat.name}
              </button>
            )
          })}
          <button onClick={() => openConnectModal('instagram', true)} className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
            <Plus className="h-4 w-4" /> More channels
          </button>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;
