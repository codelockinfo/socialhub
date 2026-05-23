import React, { useState, useEffect } from 'react';
import { postService, userService } from '../services/api';
import PostCard from '../components/PostCard';
import './Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Composer states
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHomeData = async () => {
    try {
      const [postsData, userData, trendsData] = await Promise.all([
        postService.getFeed(),
        userService.getCurrentUser(),
        userService.getTrendingTopics()
      ]);
      setPosts(postsData);
      setUser(userData);
      setTrends(trendsData);
    } catch (e) {
      console.error('Error loading home data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim()) return;

    setIsSubmitting(true);
    // Process tags input (comma or space separated)
    const processedTags = tagsInput
      .split(/[\s,]+/)
      .map(tag => tag.replace('#', '').trim())
      .filter(tag => tag.length > 0);

    try {
      const newPost = await postService.createPost(
        content,
        imageUrl.trim() || null,
        processedTags
      );
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // Update local user stats (increment post count)
      if (user) {
        setUser(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));
      }

      // Reset composer form
      setContent('');
      setImageUrl('');
      setTagsInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeToggle = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  };

  return (
    <div className="home-container">
      {/* Main feed panel */}
      <section className="feed-section">
        {/* Post Composer Card */}
        <div className="composer-card glass-panel">
          <form onSubmit={handleCreatePost}>
            <div className="composer-header">
              {user && (
                <img 
                  src={user.avatar} 
                  alt={user.fullName} 
                  className="composer-avatar" 
                />
              )}
              <textarea
                placeholder="What's happening on SocialHub?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="3"
                className="composer-textarea"
                required
              />
            </div>
            
            <div className="composer-extra-inputs">
              <div className="input-group">
                <span className="input-icon">📷</span>
                <input 
                  type="url" 
                  placeholder="Attach image URL..." 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="composer-input"
                />
              </div>
              <div className="input-group">
                <span className="input-icon">🏷️</span>
                <input 
                  type="text" 
                  placeholder="Tags (e.g. react, ui, css)" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="composer-input"
                />
              </div>
            </div>

            <div className="composer-footer">
              <button 
                type="submit" 
                className="share-submit-btn"
                disabled={isSubmitting || (!content.trim() && !imageUrl.trim())}
              >
                {isSubmitting ? 'Sharing...' : 'Share Post ⚡'}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts */}
        {isLoading ? (
          <div className="feed-loading">
            <div className="spinner"></div>
            <p>Loading your feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-feed glass-panel">
            <h3>No posts yet</h3>
            <p>Be the first to share an update on the feed!</p>
          </div>
        ) : (
          <div className="feed-list">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLikeToggle={handleLikeToggle} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Right Widget Sidebar */}
      <aside className="widget-sidebar">
        {/* User stats summary card */}
        {user && (
          <div className="widget-card stats-card glass-panel">
            <div className="stats-header">
              <img src={user.avatar} alt={user.fullName} className="stats-avatar" />
              <div className="stats-meta">
                <h4>{user.fullName}</h4>
                <p>@{user.username}</p>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-val">{user.postsCount}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{user.followersCount}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{user.followingCount}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
        )}

        {/* Trending widgets */}
        <div className="widget-card trends-card glass-panel">
          <h3 className="widget-title">Trending Now</h3>
          <div className="trends-list">
            {trends.map((trend) => (
              <div key={trend.tag} className="trend-item">
                <span className="trend-tag">#{trend.tag}</span>
                <span className="trend-count">{trend.postsCount} posts</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Home;
