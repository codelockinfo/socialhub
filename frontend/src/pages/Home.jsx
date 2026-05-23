import React, { useState, useEffect } from 'react';
import { postService, userService } from '../services/api';
import PostCard from '../components/PostCard';

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

      if (user) {
        setUser(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));
      }

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
    <div className="flex w-full gap-8">
      <section className="flex max-w-[680px] flex-1 flex-col gap-6 lg:max-w-full">
        <div className="surface-card p-6">
          <form onSubmit={handleCreatePost}>
            <div className="mb-4 flex gap-4">
              {user && (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="h-11 w-11 rounded-full object-cover"
                />
              )}
              <textarea
                placeholder="What's happening on SocialHub?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="3"
                className="flex-1 resize-none border-none bg-transparent pt-2 font-sans text-base text-text-primary outline-none placeholder:text-text-muted"
                required
              />
            </div>

            <div className="mb-5 flex flex-col gap-3 border-t border-dashed border-border pt-3">
              <div className="flex items-center gap-3 rounded-sm border border-border bg-bg-main px-3 py-1.5">
                <span className="text-base">📷</span>
                <input
                  type="url"
                  placeholder="Attach image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                />
              </div>
              <div className="flex items-center gap-3 rounded-sm border border-border bg-bg-main px-3 py-1.5">
                <span className="text-base">🏷️</span>
                <input
                  type="text"
                  placeholder="Tags (e.g. react, ui, css)"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="flex-1 border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-gradient rounded-full px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                disabled={isSubmitting || (!content.trim() && !imageUrl.trim())}
              >
                {isSubmitting ? 'Sharing...' : 'Share Post ⚡'}
              </button>
            </div>
          </form>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-16 text-text-secondary">
            <div className="h-10 w-10 animate-spin-slow rounded-full border-[3px] border-border border-t-primary" />
            <p>Loading your feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-panel rounded-lg px-12 py-12 text-center text-text-secondary">
            <h3 className="mb-2 font-semibold text-text-primary">No posts yet</h3>
            <p>Be the first to share an update on the feed!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} />
            ))}
          </div>
        )}
      </section>

      <aside className="hidden w-80 flex-col gap-6 lg:flex">
        {user && (
          <div className="glass-panel flex flex-col gap-5 rounded-lg border border-border bg-bg-surface p-6">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.fullName} className="h-[46px] w-[46px] rounded-full border-2 border-primary object-cover" />
              <div>
                <h4 className="text-[0.95rem] text-text-primary">{user.fullName}</h4>
                <p className="text-[0.8rem] text-text-muted">@{user.username}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-md border border-border bg-bg-main p-3 text-center">
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-lg font-bold text-text-primary">{user.postsCount}</span>
                <span className="text-[0.7rem] uppercase tracking-wider text-text-muted">Posts</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-lg font-bold text-text-primary">{user.followersCount}</span>
                <span className="text-[0.7rem] uppercase tracking-wider text-text-muted">Followers</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-lg font-bold text-text-primary">{user.followingCount}</span>
                <span className="text-[0.7rem] uppercase tracking-wider text-text-muted">Following</span>
              </div>
            </div>
          </div>
        )}

        <div className="surface-card p-6">
          <h3 className="mb-5 border-b border-border pb-2 text-lg font-bold text-text-primary">Trending Now</h3>
          <div className="flex flex-col gap-4">
            {trends.map((trend) => (
              <div
                key={trend.tag}
                className="flex cursor-pointer flex-col gap-0.5 rounded-sm px-2 py-1 transition-colors hover:bg-bg-surface-hover"
              >
                <span className="text-sm font-semibold text-text-primary">#{trend.tag}</span>
                <span className="text-xs text-text-muted">{trend.postsCount} posts</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Home;
