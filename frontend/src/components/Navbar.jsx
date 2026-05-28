import React from 'react';
import { Search, Bell, Settings, ChevronRight } from 'lucide-react';

function Navbar({ title = 'Dashboard', subtitle = '' }) {
  return (
    <header className="sticky top-0 z-[90] border-b border-white/10 bg-[#0f172a]/80 px-6 py-4 backdrop-blur-xl max-md:fixed max-md:left-0 max-md:right-0 max-md:px-4 max-md:py-3 shadow-sm shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-100 max-md:text-lg">
                {title}
              </h1>
              {subtitle && <ChevronRight className="h-4 w-4 text-slate-500 hidden sm:block" />}
            </div>
            {subtitle && (
              <p className="mt-0.5 hidden truncate text-sm text-slate-400 sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="relative hidden max-w-md flex-1 md:mx-8 md:flex">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts, people, tags..."
            className="w-full rounded-xl border border-white/10 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-indigo-500/30 hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-pink-500 ring-2 ring-[#0f172a]" />
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-indigo-500/30 hover:bg-white/10 hover:text-white"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
