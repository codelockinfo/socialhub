import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_PLATFORM_CARD = {
  facebook: { name: 'ncodeloke (Facebook)', color: '#1877f2', icon: '🔵', user: 'ncodeloke', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80' },
  instagram: { name: 'trendkut99 (Instagram)', color: '#e1306c', icon: '📸', user: 'trendkut99', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  linkedin: { name: 'Alex Rivera (LinkedIn)', color: '#0077b5', icon: '💼', user: 'arivera-dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
};

function Landing() {
  const navigate = useNavigate();

  const [demoText, setDemoText] = useState('Publishing my first cross-platform post using SocialHub! The dark theme is looking absolutely incredible. 🚀✨');
  const [selectedDemoPlatforms, setSelectedDemoPlatforms] = useState(['facebook', 'instagram']);
  const [demoImage, setDemoImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: ''
  });

  const handleOpenAuth = (tabType) => {
    setAuthTab(tabType);
    setIsAuthOpen(true);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('socialhub_token', `mock_token_${Date.now()}`);
    setIsAuthOpen(false);

    if (authTab === 'signup') {
      navigate('/onboarding');
    } else {
      navigate('/publisher');
    }
  };

  const toggleDemoPlatform = (plat) => {
    if (selectedDemoPlatforms.includes(plat)) {
      setSelectedDemoPlatforms(selectedDemoPlatforms.filter(p => p !== plat));
    } else {
      setSelectedDemoPlatforms([...selectedDemoPlatforms, plat]);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b0c10] bg-[radial-gradient(circle_at_10%_20%,rgba(92,124,250,0.05)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(225,48,108,0.04)_0%,transparent_40%)] pb-10 font-sans text-[#e9ecef]">
      {/* 1. Header Navigation */}
      <nav className="sticky top-[15px] z-[100] mx-auto my-[15px] flex max-w-[1200px] items-center justify-between rounded-[30px] border border-white/[0.06] bg-[rgba(15,17,20,0.7)] px-7 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-br from-[#ffd43b] to-[#fab005] bg-clip-text text-2xl text-transparent drop-shadow-[0_0_8px_rgba(250,176,5,0.5)]">
            ⚡
          </span>
          <span className="text-[1.35rem] font-[850] tracking-tight text-white">SocialHub</span>
        </div>
        <div className="flex gap-7">
          <a href="#features" className="text-sm font-semibold text-[#adb5bd] no-underline transition-colors hover:text-white">
            Features
          </a>
          <a href="#demo" className="text-sm font-semibold text-[#adb5bd] no-underline transition-colors hover:text-white">
            Interactive Demo
          </a>
          <a href="#pricing" className="text-sm font-semibold text-[#adb5bd] no-underline transition-colors hover:text-white">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent text-sm font-semibold text-[#adb5bd] transition-colors hover:text-white"
            onClick={() => handleOpenAuth('login')}
          >
            Login
          </button>
          <button
            type="button"
            className="btn-gradient-buffer cursor-pointer rounded-[20px] border-none px-[18px] py-2 text-[0.88rem] font-bold shadow-[0_4px_10px_rgba(76,110,245,0.25)] hover:shadow-[0_6px_15px_rgba(76,110,245,0.35)]"
            onClick={() => handleOpenAuth('signup')}
          >
            Create Account
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="animate-fade-in mx-auto mb-10 mt-20 max-w-[900px] px-5 text-center">
        <div>
          <span className="mb-6 inline-block rounded-[20px] border border-[rgba(76,110,245,0.2)] bg-[rgba(76,110,245,0.1)] px-3.5 py-1.5 text-[0.82rem] font-bold tracking-wide text-[#748ffc]">
            🚀 Cross-Publishing Made Effortless
          </span>
          <h1 className="text-gradient mb-[18px] text-[3.4rem] font-black leading-[1.15] tracking-[-1.5px]">
            Schedule & Publish to All Socials at Once
          </h1>
          <p className="mx-auto mb-9 max-w-[680px] text-[1.15rem] leading-[1.55] text-[#adb5bd]">
            Write once, select your channels, and instantly cross-publish posts, reels, and stories to Facebook, Instagram, LinkedIn, X, Threads, and YouTube from one premium dashboard.
          </p>
          <div className="mb-12 flex items-center justify-center gap-4">
            <button
              type="button"
              className="btn-gradient-buffer cursor-pointer rounded-[25px] border-none px-7 py-3.5 text-[1.05rem] font-[750] shadow-[0_4px_15px_rgba(76,110,245,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(76,110,245,0.45)]"
              onClick={() => handleOpenAuth('signup')}
            >
              Get Started Free
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-[25px] border border-white/[0.08] bg-white/[0.04] px-7 py-[13px] text-[1.05rem] font-bold text-[#dee2e6] transition-all hover:-translate-y-px hover:bg-white/[0.08] hover:text-white"
              onClick={() => navigate('/explore')}
            >
              Explore Trends
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[0.78rem] font-bold uppercase tracking-wide text-[#868e96]">
              Supported platforms:
            </span>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="flex items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-1.5 text-[0.8rem] font-semibold text-[#dee2e6] transition-all hover:-translate-y-0.5 hover:bg-white/[0.05]" title="Facebook">
                Facebook 🔵
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-1.5 text-[0.8rem] font-semibold text-[#dee2e6] transition-all hover:-translate-y-0.5 hover:bg-white/[0.05]" title="Instagram">
                Instagram 📸
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-1.5 text-[0.8rem] font-semibold text-[#dee2e6] transition-all hover:-translate-y-0.5 hover:bg-white/[0.05]" title="LinkedIn">
                LinkedIn 💼
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-1.5 text-[0.8rem] font-semibold text-[#dee2e6] transition-all hover:-translate-y-0.5 hover:bg-white/[0.05]" title="X / Twitter">
                X / Twitter 🐦
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-1.5 text-[0.8rem] font-semibold text-[#dee2e6] transition-all hover:-translate-y-0.5 hover:bg-white/[0.05]" title="YouTube">
                YouTube 📺
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-1.5 text-[0.8rem] font-semibold text-[#dee2e6] transition-all hover:-translate-y-0.5 hover:bg-white/[0.05]" title="Threads">
                Threads 🧵
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Interactive Demo Section */}
      <section id="demo" className="mx-auto my-20 max-w-[1200px] px-5">
        <div className="mb-10 text-center">
          <h2 className="mb-2.5 text-[2.2rem] font-black tracking-tight text-white">Interactive Simulator</h2>
          <p className="mx-auto max-w-[580px] text-[1.05rem] text-[#adb5bd]">
            Try composing a post below to see how it automatically formats for different social networks.
          </p>
        </div>

        <div className="grid items-start gap-[30px] max-[900px]:grid-cols-1 min-[901px]:grid-cols-[1.1fr_1fr]">
          <div className="glass-card p-6">
            <h4 className="mb-5 border-b border-white/[0.06] pb-2.5 text-[1.1rem] font-[750] text-white">
              Live Composer Demo
            </h4>
            <div className="mb-5 flex flex-col gap-2">
              <label className="text-[0.88rem] font-bold text-[#dee2e6]">Select target channels:</label>
              <div className="flex gap-3">
                {Object.keys(MOCK_PLATFORM_CARD).map(plat => {
                  const data = MOCK_PLATFORM_CARD[plat];
                  const isSelected = selectedDemoPlatforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      className={`relative h-[50px] w-[50px] cursor-pointer rounded-full border-2 bg-white/[0.02] p-0 transition-all hover:scale-110 hover:border-[var(--border-glow)] ${isSelected ? 'border-[var(--border-glow)]' : 'border-white/[0.08]'}`}
                      onClick={() => toggleDemoPlatform(plat)}
                      style={{ '--border-glow': data.color }}
                    >
                      <img src={data.avatar} alt={data.name} className="h-full w-full rounded-full object-cover" />
                      <span className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white/10 bg-[#0b0c10] text-[10px]">
                        {data.icon}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2b8a3e] text-[9px] font-bold text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5 flex flex-col gap-2">
              <label className="text-[0.88rem] font-bold text-[#dee2e6]">Type your post caption:</label>
              <textarea
                className="resize-none rounded-xl border border-white/[0.08] bg-black/30 p-3.5 text-[0.92rem] leading-[1.45] text-white transition-colors focus:border-[#4c6ef5] focus:outline-none"
                rows="4"
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                placeholder="What's on your mind?..."
              />
            </div>

            <div className="mb-5 flex flex-col gap-2">
              <label className="text-[0.88rem] font-bold text-[#dee2e6]">Attach media template:</label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
                ].map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`h-[50px] w-[50px] cursor-pointer rounded-lg border-2 bg-cover bg-center transition-transform hover:scale-105 ${demoImage === url ? 'border-[#4c6ef5] shadow-[0_0_8px_rgba(76,110,245,0.4)]' : 'border-transparent'}`}
                    onClick={() => setDemoImage(url)}
                    style={{ backgroundImage: `url(${url})` }}
                  />
                ))}
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 text-[0.8rem] font-semibold text-[#adb5bd] transition-all hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setDemoImage('')}
                >
                  No Media
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn-gradient-buffer mt-2.5 w-full cursor-pointer rounded-xl border-none py-3 text-[0.95rem] font-bold shadow-[0_4px_10px_rgba(76,110,245,0.25)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(76,110,245,0.35)]"
              onClick={() => handleOpenAuth('signup')}
            >
              Test Schedule This Post 🗓️
            </button>
          </div>

          <div className="flex h-[480px] flex-col">
            <h4 className="mb-5 border-b border-white/[0.06] pb-2.5 text-[1.1rem] font-[750] text-white">
              Live Feed Previews ({selectedDemoPlatforms.length} active)
            </h4>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1.5">
              {selectedDemoPlatforms.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-[#868e96]">
                  <span className="mb-2 text-[2.2rem] opacity-50">❌</span>
                  <p>Select at least one social channel on the left to see live feed previews.</p>
                </div>
              ) : (
                selectedDemoPlatforms.map(plat => {
                  const card = MOCK_PLATFORM_CARD[plat];
                  return (
                    <div key={plat} className="glass-card p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <img src={card.avatar} alt={card.name} className="h-9 w-9 rounded-full border border-white/10 object-cover" />
                        <div className="flex flex-col">
                          <span className="text-[0.88rem] font-bold text-white">{card.name}</span>
                          <span className="text-[0.72rem] text-[#868e96]">
                            Just now • {card.icon}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="mb-3 whitespace-pre-wrap text-[0.88rem] leading-[1.45] text-[#e9ecef]">{demoText}</p>
                        {demoImage && (
                          <div className="mb-3 max-h-[200px] overflow-hidden rounded-[10px] border border-white/[0.08]">
                            <img src={demoImage} alt="Post Attachment" className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="border-t border-white/[0.05] pt-2.5">
                        <div className="flex gap-5 text-[0.8rem] font-bold text-[#868e96]">
                          <span>❤️ Like</span>
                          <span>💬 Comment</span>
                          <span>🔄 Share</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="mx-auto my-[100px] max-w-[1200px] px-5">
        <div className="mb-10 text-center">
          <h2 className="mb-2.5 text-[2.2rem] font-black tracking-tight text-white">Product Capabilities</h2>
          <p className="mx-auto max-w-[580px] text-[1.05rem] text-[#adb5bd]">
            Everything you need to automate, publish, and track your content in one unified space.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          <div className="glass-card px-6 py-[30px] transition-all duration-250 hover:-translate-y-[5px] hover:border-[rgba(76,110,245,0.25)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
            <span className="mb-4 block text-[2.2rem]">📅</span>
            <h3 className="mb-2.5 text-[1.15rem] font-extrabold text-white">Smart Queue Scheduling</h3>
            <p className="m-0 text-[0.88rem] leading-[1.45] text-[#adb5bd]">
              Define custom posting time slots for each network. Automate queues to publish at optimal hours of maximum audience engagement.
            </p>
          </div>

          <div className="glass-card px-6 py-[30px] transition-all duration-250 hover:-translate-y-[5px] hover:border-[rgba(76,110,245,0.25)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
            <span className="mb-4 block text-[2.2rem]">⚡</span>
            <h3 className="mb-2.5 text-[1.15rem] font-extrabold text-white">Instant Cross-Publishing</h3>
            <p className="m-0 text-[0.88rem] leading-[1.45] text-[#adb5bd]">
              One editor, infinite channels. Simultaneously distribute post captions, attachments, hashtags, and stories to all target networks.
            </p>
          </div>

          <div className="glass-card px-6 py-[30px] transition-all duration-250 hover:-translate-y-[5px] hover:border-[rgba(76,110,245,0.25)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
            <span className="mb-4 block text-[2.2rem]">💬</span>
            <h3 className="mb-2.5 text-[1.15rem] font-extrabold text-white">Unified Comment Inbox</h3>
            <p className="m-0 text-[0.88rem] leading-[1.45] text-[#adb5bd]">
              Monitor customer feedback and responses. Reply to Facebook comments, Instagram mentions, and LinkedIn queries from a single timeline.
            </p>
          </div>

          <div className="glass-card px-6 py-[30px] transition-all duration-250 hover:-translate-y-[5px] hover:border-[rgba(76,110,245,0.25)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
            <span className="mb-4 block text-[2.2rem]">📊</span>
            <h3 className="mb-2.5 text-[1.15rem] font-extrabold text-white">Audience Growth Analytics</h3>
            <p className="m-0 text-[0.88rem] leading-[1.45] text-[#adb5bd]">
              Track post impressions, reach percentages, and click-through counts. Generate automated performance reports to guide your strategy.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pricing CTA Section */}
      <section id="pricing" className="glass-card mx-auto my-[100px] max-w-[800px] px-6 py-12 text-center max-[600px]:p-6">
        <div>
          <h2 className="mb-2.5 text-[2rem] font-black text-white">Get Started Today</h2>
          <p className="mx-auto mb-[30px] max-w-[520px] text-base leading-[1.45] text-[#adb5bd]">
            Automate your social presence. Access advanced scheduler tools, unlimited posts, and basic analytics free of charge.
          </p>
          <div className="mb-[30px] text-[3rem] font-black text-[#748ffc]">
            $0 <span className="text-[1.1rem] font-semibold text-[#868e96]">/ month (Free Forever Plan)</span>
          </div>
          <button
            type="button"
            className="btn-gradient-buffer cursor-pointer rounded-[25px] border-none px-9 py-[13px] text-[1.1rem] font-[750] shadow-[0_4px_15px_rgba(76,110,245,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(76,110,245,0.4)]"
            onClick={() => handleOpenAuth('signup')}
          >
            Sign Up Now
          </button>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mx-auto mb-5 mt-20 max-w-[1200px] px-5">
        <div className="mb-6 h-px bg-white/[0.05]" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gradient-to-br from-[#ffd43b] to-[#fab005] bg-clip-text text-2xl text-transparent drop-shadow-[0_0_8px_rgba(250,176,5,0.5)]">
              ⚡
            </span>
            <span className="text-[1.35rem] font-[850] tracking-tight text-white">SocialHub</span>
            <p className="m-0 border-l border-white/10 pl-2 text-[0.8rem] text-[#868e96]">
              Automated Social Media Management Dashboard.
            </p>
          </div>
          <div className="text-[0.8rem] text-[#868e96]">
            © 2026 SocialHub. All rights reserved. Created in partnership with ncodeloke.
          </div>
        </div>
      </footer>

      {/* 7. Auth Modal Overlay */}
      {isAuthOpen && (
        <div className="animate-fade-in fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-[5px]">
          <div className="glass-card animate-scale-up relative w-[420px] max-w-[90%] border border-white/10 p-[30px]">
            <button
              type="button"
              className="absolute top-4 right-4 cursor-pointer border-none bg-transparent text-base text-[#868e96] hover:text-white"
              onClick={() => setIsAuthOpen(false)}
            >
              ✕
            </button>

            <div className="mb-6 flex border-b border-white/[0.06]">
              <button
                type="button"
                className={`flex-1 cursor-pointer border-none bg-transparent py-2.5 text-base font-bold transition-all ${authTab === 'login' ? 'border-b-2 border-[#4c6ef5] text-[#4c6ef5]' : 'border-b-2 border-transparent text-[#868e96]'}`}
                onClick={() => setAuthTab('login')}
              >
                Log In
              </button>
              <button
                type="button"
                className={`flex-1 cursor-pointer border-none bg-transparent py-2.5 text-base font-bold transition-all ${authTab === 'signup' ? 'border-b-2 border-[#4c6ef5] text-[#4c6ef5]' : 'border-b-2 border-transparent text-[#868e96]'}`}
                onClick={() => setAuthTab('signup')}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {authTab === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-bold text-[#adb5bd]">Full Name</label>
                  <input
                    type="text"
                    placeholder="Alex Rivera"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-[0.9rem] text-white transition-colors focus:border-[#4c6ef5] focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-bold text-[#adb5bd]">Email Address</label>
                <input
                  type="email"
                  placeholder="alexdev@socialhub.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-[0.9rem] text-white transition-colors focus:border-[#4c6ef5] focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-bold text-[#adb5bd]">Username</label>
                <input
                  type="text"
                  placeholder="alexdev"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-[0.9rem] text-white transition-colors focus:border-[#4c6ef5] focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-bold text-[#adb5bd]">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-[0.9rem] text-white transition-colors focus:border-[#4c6ef5] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-gradient-buffer mt-2.5 cursor-pointer rounded-lg border-none py-3 text-[0.95rem] font-[750] shadow-[0_4px_10px_rgba(76,110,245,0.25)] hover:-translate-y-px hover:shadow-[0_6px_15px_rgba(76,110,245,0.35)]"
              >
                {authTab === 'login' ? 'Log In' : 'Sign Up & Get Started'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
