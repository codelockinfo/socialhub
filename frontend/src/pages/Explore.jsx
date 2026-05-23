import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './Explore.css';

const RECOMMENDED_USERS = [
  {
    id: 'rec-1',
    fullName: 'David Miller',
    username: 'david_codes',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    bio: 'Software engineer at Stripe. Tinkering with Rust & Vite.',
    isFollowing: false
  },
  {
    id: 'rec-2',
    fullName: 'Sophia Patel',
    username: 'sophiart',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    bio: 'Digital illustrator & UI Designer. Drawing colors from life.',
    isFollowing: false
  },
  {
    id: 'rec-3',
    fullName: 'Marcus Aurelius',
    username: 'stoicdev',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    bio: 'Writing code for servers and reflections for life.',
    isFollowing: true
  }
];

const EXPLORE_POSTS = [
  {
    id: 'exp-1',
    category: 'technology',
    title: 'React 19 Core Features Explained',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
    readsCount: '1.2k reads'
  },
  {
    id: 'exp-2',
    category: 'art',
    title: 'Colors of Glassmorphism in Modern Interfaces',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    readsCount: '984 reads'
  },
  {
    id: 'exp-3',
    category: 'photography',
    title: 'Chasing the Sunset: Golden Hours Tips',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    readsCount: '2.5k reads'
  },
  {
    id: 'exp-4',
    category: 'technology',
    title: 'Why Vite has replaced Webpack in 2026',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    readsCount: '3.1k reads'
  }
];

function Explore() {
  const [trends, setTrends] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [creators, setCreators] = useState(RECOMMENDED_USERS);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    userService.getTrendingTopics().then(data => setTrends(data));
  }, []);

  const handleFollowToggle = (id) => {
    setCreators(prevCreators =>
      prevCreators.map(creator => {
        if (creator.id === id) {
          const isFollowingNow = !creator.isFollowing;
          // Dynamically adjust following count in local storage mock user
          const mockUser = JSON.parse(localStorage.getItem('socialhub_mock_user'));
          if (mockUser) {
            mockUser.followingCount = isFollowingNow 
              ? mockUser.followingCount + 1 
              : mockUser.followingCount - 1;
            localStorage.setItem('socialhub_mock_user', JSON.stringify(mockUser));
          }
          return { ...creator, isFollowing: isFollowingNow };
        }
        return creator;
      })
    );
  };

  const filteredExplorePosts = EXPLORE_POSTS.filter(post => {
    if (activeTab === 'trending') return true;
    return post.category === activeTab;
  });

  const searchedTrends = trends.filter(trend =>
    trend.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="explore-container">
      {/* Search Input Box */}
      <div className="explore-search-bar glass-panel">
        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search topics, creators, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="explore-search-input"
        />
      </div>

      <div className="explore-grid">
        {/* Left main discovery zone */}
        <section className="discover-section">
          <nav className="explore-tabs">
            {['trending', 'technology', 'art', 'photography'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Cards feed depending on tab */}
          <div className="explore-cards-grid">
            {filteredExplorePosts.map(post => (
              <div key={post.id} className="explore-card glass-panel animate-fade-in-up">
                <div className="explore-card-image-wrap">
                  <img src={post.imageUrl} alt={post.title} className="explore-card-img" />
                  <span className="explore-card-tag">{post.category}</span>
                </div>
                <div className="explore-card-content">
                  <h3 className="explore-card-title">{post.title}</h3>
                  <span className="explore-card-stats">{post.readsCount}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trending Topics (shown on all tabs for easy click access) */}
          <div className="explore-trends-box glass-panel">
            <h3 className="box-title">Trending Hashtags</h3>
            <div className="hashtags-grid">
              {searchedTrends.map(trend => (
                <div key={trend.tag} className="hashtag-card">
                  <span className="hashtag-name">#{trend.tag}</span>
                  <span className="hashtag-count">{trend.postsCount} posts</span>
                </div>
              ))}
              {searchedTrends.length === 0 && (
                <p className="no-results">No hashtags match your search.</p>
              )}
            </div>
          </div>
        </section>

        {/* Right recommended creators section */}
        <aside className="creators-sidebar">
          <div className="widget-card creators-card glass-panel">
            <h3 className="widget-title">Who to Follow</h3>
            <div className="creators-list">
              {creators.map(creator => (
                <div key={creator.id} className="creator-item">
                  <img src={creator.avatar} alt={creator.fullName} className="creator-avatar" />
                  <div className="creator-meta">
                    <span className="creator-name">{creator.fullName}</span>
                    <span className="creator-handle">@{creator.username}</span>
                    <p className="creator-bio">{creator.bio}</p>
                  </div>
                  <button
                    className={`follow-btn ${creator.isFollowing ? 'following' : ''}`}
                    onClick={() => handleFollowToggle(creator.id)}
                  >
                    {creator.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Explore;
