import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="notfound-container glass-panel animate-fade-in">
      <div className="error-badge text-gradient-accent">404</div>
      <h2 className="error-title">Signal Lost in Space</h2>
      <p className="error-description">
        The page you are looking for has been moved, deleted, or never existed on SocialHub. Let's get you back to the network.
      </p>
      <Link to="/" className="home-back-btn">
        Return to Home Feed ⚡
      </Link>
    </div>
  );
}

export default NotFound;
