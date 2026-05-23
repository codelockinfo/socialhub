import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="glass-panel animate-fade-in mx-auto my-16 flex max-w-[580px] flex-col items-center justify-center rounded-lg border border-border bg-bg-surface px-8 py-16 text-center shadow-xl max-sm:mx-4 max-sm:my-8 max-sm:px-6 max-sm:py-12">
      <div className="animate-pulse-scale mb-4 font-heading text-[6.5rem] font-extrabold leading-none tracking-tighter text-gradient-accent max-sm:text-[5rem]">
        404
      </div>
      <h2 className="mb-3 text-[1.75rem] font-bold text-text-primary max-sm:text-[1.4rem]">Signal Lost in Space</h2>
      <p className="mb-8 text-[0.95rem] leading-relaxed text-text-secondary">
        The page you are looking for has been moved, deleted, or never existed on SocialHub. Let's get you back to the network.
      </p>
      <Link
        to="/"
        className="btn-gradient rounded-full px-6 py-2.5 text-[0.95rem] active:translate-y-0"
      >
        Return to Home Feed ⚡
      </Link>
    </div>
  );
}

export default NotFound;
