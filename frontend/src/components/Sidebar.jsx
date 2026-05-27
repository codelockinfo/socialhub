import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { userService } from "../services/api";
import { useStudioOptional } from "../context/StudioContext";
import {
  ALL_PLATFORMS,
  PLATFORM_THEMES,
  QUICK_CONNECT_PLATFORMS,
} from "../constants/platforms";

const navItems = [
  {
    to: "/feed",
    label: "Home",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    to: "/explore",
    label: "Explore",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    to: "/publisher",
    label: "Studio",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    to: "/profile",
    label: "Profile",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
];

const navLinkClass = ({ isActive }) =>
  [
    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
    "max-md:flex-1 max-md:flex-col max-md:gap-1 max-md:px-2 max-md:py-2 max-md:text-[10px]",
    isActive
      ? "nav-pill-active"
      : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary",
  ].join(" ");

function StudioChannelsPanel() {
  const studio = useStudioOptional();
  const location = useLocation();

  if (!studio || location.pathname !== "/publisher") return null;

  const {
    channels,
    selectedChannel,
    selectChannel,
    selectAllChannels,
    openConnectModal,
    disconnectChannel,
  } = studio;

  const quickPlatforms = ALL_PLATFORMS.filter((p) =>
    QUICK_CONNECT_PLATFORMS.includes(p.id),
  );
  const isAllSelected = selectedChannel === null;

  return (
    <div className="mt-4 hidden flex-col border-t border-border pt-4 lg:flex">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Channels
        </span>
        <button
          type="button"
          onClick={() => openConnectModal("instagram", true)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition hover:bg-bg-surface-hover hover:text-text-primary"
          title="Add channel"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={selectAllChannels}
        className={`mb-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition ${
          isAllSelected
            ? "bg-violet-600/20 font-semibold text-violet-200"
            : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-surface text-sm">
          ⊞
        </span>
        <span className="truncate">All Channels</span>
      </button>

      <div className="max-h-[200px] space-y-0.5 overflow-y-auto scrollbar-thin">
        {channels.length === 0 ? (
          <p className="px-2 py-2 text-xs text-text-muted">
            No channels connected yet.
          </p>
        ) : (
          channels.map((chan) => {
            const theme = PLATFORM_THEMES[chan.platform] || {
              icon: "❓",
              color: "#6366f1",
            };
            const isSelected = selectedChannel?.id === chan.id;
            return (
              <div
                key={chan.id}
                type="button"
                onClick={() => selectChannel(chan)}
                className={`group/chan flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition ${
                  isSelected
                    ? "bg-violet-600/20 font-semibold text-violet-200"
                    : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                }`}
              >
                <div className="relative h-7 w-7 shrink-0">
                  <img
                    src={chan.avatar}
                    alt=""
                    className="h-full w-full rounded-full object-cover ring-1 ring-white/10"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full text-[8px] text-white"
                    style={{ backgroundColor: theme.color }}
                  >
                    {theme.icon}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm">{chan.accountName}</span>
                  <span className="truncate text-[10px] text-text-muted">
                    {theme.name}
                  </span>
                </div>
                <button
                  type="button"
                  className="hidden shrink-0 text-xs text-text-muted opacity-0 transition hover:text-red-400 group-hover/chan:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Disconnect this channel?")) {
                      disconnectChannel(chan.id);
                    }
                  }}
                  title="Disconnect"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-text-muted">
          Connect channels
        </p>
        <div className="flex flex-wrap gap-2 px-1">
          {quickPlatforms.map((plat) => (
            <button
              key={plat.id}
              type="button"
              onClick={() => openConnectModal(plat.id, false)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-surface/80 px-2.5 py-1.5 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-bg-surface-hover"
              title={`Connect ${plat.name}`}
            >
              <span className="text-sm" style={{ color: plat.color }}>
                {plat.icon}
              </span>
              <span className="text-xs font-medium text-text-secondary">
                {plat.name}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => openConnectModal("facebook", true)}
          className="mt-2 w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-violet-400 transition hover:bg-violet-600/10 hover:text-violet-300"
        >
          + More channels
        </button>
      </div>
    </div>
  );
}

function Sidebar() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isStudio = location.pathname === "/publisher";

  useEffect(() => {
    userService.getCurrentUser().then((data) => setUser(data));
  }, []);

  return (
    <aside
      className={`fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-bg-elevated/95 px-3 py-2 backdrop-blur-xl max-md:rounded-t-2xl md:bottom-auto md:left-0 md:top-0 md:flex md:h-screen md:flex-col md:border-r md:border-t-0 md:px-3 md:py-5 ${
        isStudio ? "lg:w-[280px]" : "lg:w-[260px]"
      } md:w-[88px]`}
    >
      <div className="mb-0 flex items-center justify-center gap-2 md:mb-6 md:justify-start lg:mb-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg shadow-lg shadow-violet-600/30">
          ⚡
        </div>
        <span className="font-heading hidden text-xl font-bold tracking-tight text-gradient lg:inline">
          SocialHub
        </span>
      </div>

      <nav className="flex flex-1 flex-row justify-around gap-1 md:flex-col md:justify-start md:gap-1">
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={navLinkClass} title={label}>
            <svg
              className="h-5 w-5 shrink-0 opacity-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={icon}
              />
            </svg>
            <span className="hidden lg:inline">{label}</span>
            <span className="md:hidden lg:hidden">{label}</span>
          </NavLink>
        ))}
      </nav>

      <StudioChannelsPanel />

      {user && (
        <div className="mt-2 hidden items-center gap-3 rounded-xl border border-border bg-bg-surface/60 p-3 md:mt-auto md:flex">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-violet-500/40"
          />
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold text-text-primary">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-text-muted">@{user.username}</p>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
