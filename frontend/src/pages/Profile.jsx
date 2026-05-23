import React, { useState, useEffect } from 'react';
import { postService, userService } from '../services/api';
import PostCard from '../components/PostCard';

function Profile() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  const fetchProfileData = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setFullName(userData.fullName);
      setBio(userData.bio);

      const allPosts = await postService.getFeed();
      const ownPosts = allPosts.filter(
        post => post.author.username === userData.username
      );
      setUserPosts(ownPosts);

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
    setUserPosts(prevPosts =>
      prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );

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
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-32 text-text-secondary">
        <div className="h-10 w-10 animate-spin-slow rounded-full border-[3px] border-border border-t-primary" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto flex w-full max-w-[680px] flex-col gap-8">
      <div className="glass-panel overflow-hidden rounded-lg border border-border bg-bg-surface">
        <div className="h-[180px] overflow-hidden border-b border-border bg-bg-surface-hover max-[580px]:h-[130px]">
          <img src={user.banner} alt="Profile Banner" className="h-full w-full object-cover" />
        </div>
        <div className="relative z-10 -mt-[50px] flex items-end justify-between px-6 max-[580px]:-mt-10 max-[580px]:px-4">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="h-[100px] w-[100px] rounded-full border-4 border-bg-surface bg-bg-surface object-cover shadow-md max-[580px]:h-20 max-[580px]:w-20 max-[580px]:border-[3px]"
          />

          <div className="pb-2">
            <button
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isEditing
                  ? 'border-accent bg-pink-500/5 text-accent'
                  : 'border-border bg-bg-main text-text-primary hover:border-border-hover hover:bg-bg-surface-hover'
              }`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 pb-6 pt-4 text-left max-[580px]:px-4 max-[580px]:pt-3">
          {!isEditing ? (
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{user.fullName}</h2>
              <span className="-mt-0.5 block text-sm text-text-muted">@{user.username}</span>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-text-secondary">{user.bio}</p>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullname" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-sm border border-border bg-bg-main px-3.5 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-primary focus:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full resize-y rounded-sm border border-border bg-bg-main px-3.5 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-primary focus:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  rows="2"
                />
              </div>
              <button type="submit" className="btn-gradient self-start rounded-full px-5 py-2 text-sm">
                Save Changes
              </button>
            </form>
          )}

          <div className="mt-2 flex gap-6">
            <div className="text-sm text-text-secondary">
              <strong className="mr-1 font-heading text-base text-text-primary">{user.postsCount}</strong>
              <span>Posts</span>
            </div>
            <div className="text-sm text-text-secondary">
              <strong className="mr-1 font-heading text-base text-text-primary">{user.followersCount}</strong>
              <span>Followers</span>
            </div>
            <div className="text-sm text-text-secondary">
              <strong className="mr-1 font-heading text-base text-text-primary">{user.followingCount}</strong>
              <span>Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <nav className="flex gap-4 border-b border-border pb-2">
          <button
            className={`relative px-3 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'text-primary after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-indigo-500 after:to-indigo-700'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            My Posts ({userPosts.length})
          </button>
          <button
            className={`relative px-3 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'likes'
                ? 'text-primary after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-indigo-500 after:to-indigo-700'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('likes')}
          >
            Likes ({likedPosts.length})
          </button>
        </nav>

        <div className="flex flex-col gap-5">
          {activeTab === 'posts' ? (
            userPosts.length === 0 ? (
              <div className="glass-panel rounded-lg px-14 py-14 text-center text-text-secondary">
                <h3 className="mb-2 font-semibold text-text-primary">No posts created yet</h3>
                <p>Post updates from the Home feed to see them listed here.</p>
              </div>
            ) : (
              userPosts.map(post => (
                <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} />
              ))
            )
          ) : likedPosts.length === 0 ? (
            <div className="glass-panel rounded-lg px-14 py-14 text-center text-text-secondary">
              <h3 className="mb-2 font-semibold text-text-primary">No liked posts</h3>
              <p>Tap the heart icon on any post across the app to save it here.</p>
            </div>
          ) : (
            likedPosts.map(post => (
              <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
