import React, { useState, useEffect } from 'react';
import { postService, userService } from '../services/api';
import PostCard from '../components/PostCard';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Bio state variables
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  const fetchProfileData = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setFullName(userData.fullName);
      setBio(userData.bio);

      // Get feed posts and filter
      const allPosts = await postService.getFeed();
      
      // User's own posts
      const ownPosts = allPosts.filter(
        post => post.author.username === userData.username
      );
      setUserPosts(ownPosts);

      // User's liked posts
      const liked = allPosts.filter(post => post.isLiked);
      setLikedPosts(liked);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      const updatedUser = await userService.updateProfile(fullName.trim(), bio.trim());
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleLikeToggle = (updatedPost) => {
    // Update user posts if liked state changed
    setUserPosts(prevPosts => 
      prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );

    // Update liked posts array
    setLikedPosts(prevLiked => {
      const exists = prevLiked.some(p => p.id === updatedPost.id);
      if (updatedPost.isLiked) {
        if (exists) {
          return prevLiked.map(p => p.id === updatedPost.id ? updatedPost : p);
        }
        return [updatedPost, ...prevLiked];
      } else {
        return prevLiked.filter(p => p.id !== updatedPost.id);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container animate-fade-in">
      {/* Banner and Avatar section */}
      <div className="profile-header-card glass-panel">
        <div className="banner-wrap">
          <img src={user.banner} alt="Profile Banner" className="banner-img" />
        </div>
        <div className="avatar-stats-wrap">
          <img src={user.avatar} alt={user.fullName} className="profile-avatar-large" />
          
          <div className="profile-actions">
            <button 
              className={`edit-profile-btn ${isEditing ? 'cancel' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="profile-info-wrap">
          {!isEditing ? (
            <div className="profile-text">
              <h2 className="profile-name">{user.fullName}</h2>
              <span className="profile-handle">@{user.username}</span>
              <p className="profile-bio-text">{user.bio}</p>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
              <div className="form-group">
                <label htmlFor="fullname">Full Name</label>
                <input 
                  type="text" 
                  id="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="edit-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea 
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="edit-textarea"
                  rows="2"
                />
              </div>
              <button type="submit" className="save-profile-btn">Save Changes</button>
            </form>
          )}

          {/* Followers count row */}
          <div className="profile-stats-row">
            <div className="stat-pill">
              <strong>{user.postsCount}</strong> <span>Posts</span>
            </div>
            <div className="stat-pill">
              <strong>{user.followersCount}</strong> <span>Followers</span>
            </div>
            <div className="stat-pill">
              <strong>{user.followingCount}</strong> <span>Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile feed tabs */}
      <div className="profile-feed-section">
        <nav className="profile-tabs">
          <button 
            className={`profile-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            My Posts ({userPosts.length})
          </button>
          <button 
            className={`profile-tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
            onClick={() => setActiveTab('likes')}
          >
            Likes ({likedPosts.length})
          </button>
        </nav>

        <div className="profile-feed-list">
          {activeTab === 'posts' ? (
            userPosts.length === 0 ? (
              <div className="empty-profile-feed glass-panel">
                <h3>No posts created yet</h3>
                <p>Post updates from the Home feed to see them listed here.</p>
              </div>
            ) : (
              userPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onLikeToggle={handleLikeToggle} 
                />
              ))
            )
          ) : (
            likedPosts.length === 0 ? (
              <div className="empty-profile-feed glass-panel">
                <h3>No liked posts</h3>
                <p>Tap the heart icon on any post across the app to save it here.</p>
              </div>
            ) : (
              likedPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onLikeToggle={handleLikeToggle} 
                />
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
