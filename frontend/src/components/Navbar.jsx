import React from 'react';

function Navbar({ title = 'Dashboard', subtitle = '' }) {
  return (
    <header className="sticky top-0 z-[90] border-b border-border bg-bg-elevated/80 px-6 py-4 backdrop-blur-xl max-md:fixed max-md:left-0 max-md:right-0 max-md:px-4 max-md:py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading truncate text-xl font-bold tracking-tight text-text-primary max-md:text-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 hidden truncate text-sm text-text-muted sm:block">{subtitle}</p>
          )}
        </div>

        <div className="relative hidden max-w-md flex-1 md:mx-8 md:flex">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search posts, people, tags..."
            className="w-full rounded-xl border border-border bg-bg-surface/80 py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-surface text-text-secondary transition-all hover:border-violet-500/30 hover:bg-bg-surface-hover hover:text-text-primary"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-bg-elevated" />
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-surface text-text-secondary transition-all hover:border-violet-500/30 hover:bg-bg-surface-hover hover:text-text-primary"
            aria-label="Settings"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
