import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

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
    <div className="flex w-full flex-col gap-6">
      <div className="glass-panel relative flex h-[52px] w-full items-center rounded-md border border-border bg-bg-surface px-4 shadow-sm">
        <svg className="pointer-events-none absolute left-4 h-[18px] w-[18px] stroke-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search topics, creators, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-none bg-transparent py-3 pl-8 text-[0.95rem] text-text-primary outline-none"
        />
      </div>

      <div className="flex gap-8">
        <section className="flex max-w-[680px] flex-1 flex-col gap-6 lg:max-w-full">
          <nav className="flex gap-2 overflow-x-auto border-b border-border pb-3">
            {['trending', 'technology', 'art', 'photography'].map(tab => (
              <button
                key={tab}
                className={`shrink-0 rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-500/10 text-primary'
                    : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
            {filteredExplorePosts.map(post => (
              <div
                key={post.id}
                className="glass-panel animate-fade-in-up flex cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-bg-surface transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-xl"
              >
                <div className="group relative h-40 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-sm bg-gradient-to-br from-indigo-500 to-indigo-700 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-white">
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-col gap-2 p-4 text-left">
                  <h3 className="text-[0.95rem] font-semibold leading-snug text-text-primary">{post.title}</h3>
                  <span className="text-xs text-text-muted">{post.readsCount}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-lg border border-border bg-bg-surface p-6 text-left">
            <h3 className="mb-5 border-b border-border pb-2 text-lg font-bold text-text-primary">Trending Hashtags</h3>
            <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
              {searchedTrends.map(trend => (
                <div
                  key={trend.tag}
                  className="flex cursor-pointer flex-col gap-0.5 rounded-md border border-border bg-bg-main px-4 py-3.5 transition-all hover:-translate-y-px hover:border-primary hover:bg-bg-surface-hover"
                >
                  <span className="text-sm font-semibold text-text-primary">#{trend.tag}</span>
                  <span className="text-xs text-text-muted">{trend.postsCount} posts</span>
                </div>
              ))}
              {searchedTrends.length === 0 && (
                <p className="col-span-2 text-sm text-text-muted max-[580px]:col-span-1">No hashtags match your search.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="hidden w-80 lg:block">
          <div className="glass-panel rounded-lg border border-border bg-bg-surface p-6 text-left">
            <h3 className="mb-5 border-b border-border pb-2 text-lg font-bold text-text-primary">Who to Follow</h3>
            <div className="flex flex-col gap-5">
              {creators.map(creator => (
                <div
                  key={creator.id}
                  className="grid grid-cols-[40px_1fr_auto] items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <img
                    src={creator.avatar}
                    alt={creator.fullName}
                    className="h-10 w-10 rounded-full border-[1.5px] border-border object-cover"
                  />
                  <div className="min-w-0 overflow-hidden">
                    <span className="block text-sm font-semibold text-text-primary">{creator.fullName}</span>
                    <span className="mb-1 block text-xs text-text-muted">@{creator.username}</span>
                    <p className="line-clamp-2 text-xs leading-snug text-text-secondary">{creator.bio}</p>
                  </div>
                  <button
                    className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all hover:scale-[1.02] ${
                      creator.isFollowing
                        ? 'border border-border bg-transparent text-text-secondary hover:border-accent hover:bg-pink-500/5 hover:text-accent'
                        : 'border-transparent bg-text-primary text-bg-main hover:opacity-90'
                    }`}
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
