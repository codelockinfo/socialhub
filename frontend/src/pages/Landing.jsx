import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Send, MessageCircle, BarChart3, ChevronRight, Check, X, Layers, Smartphone, Globe, ArrowRight, PlayCircle, Sparkles, TrendingUp, Users, Briefcase, Video, Handshake, Mouse, Search, Clapperboard, MapPin, Calendar, Camera } from 'lucide-react';
import bgimage from '../assets/bgimage.png';

const MOCK_PLATFORM_CARD = {
  facebook: { name: 'Facebook', color: '#1877f2', icon: '🔵', user: 'ncodeloke', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80' },
  instagram: { name: 'Instagram', color: '#e1306c', icon: '📸', user: 'trendkut99', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  linkedin: { name: 'LinkedIn', color: '#0077b5', icon: '💼', user: 'arivera-dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 15 } }
};

export default function Landing() {
  const navigate = useNavigate();

  const [demoText, setDemoText] = useState('Publishing my first cross-platform post using SocialHub! The dark theme is looking absolutely incredible. 🚀✨');
  const [selectedDemoPlatforms, setSelectedDemoPlatforms] = useState(['facebook', 'instagram']);
  const [demoImage, setDemoImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [formData, setFormData] = useState({ fullName: '', email: '', username: '', password: '' });

  const handleOpenAuth = (tabType) => {
    setAuthTab(tabType);
    setIsAuthOpen(true);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('socialhub_token', `mock_token_${Date.now()}`);
    setIsAuthOpen(false);
    navigate(authTab === 'signup' ? '/onboarding' : '/publisher');
  };

  const toggleDemoPlatform = (plat) => {
    setSelectedDemoPlatforms(prev => 
      prev.includes(plat) ? prev.filter(p => p !== plat) : [...prev, plat]
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030712] text-slate-200 selection:bg-indigo-500/30">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="sticky top-4 z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">CastConnect</span>
          </div>
          <div className="hidden md:flex gap-8">
            {['Home', 'Discover', 'Casting Calls', 'Creators', 'Reels', 'Pricing', 'About Us'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '')}`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-300 hover:text-white transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button onClick={() => handleOpenAuth('login')} className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5">
              Log In
            </button>
            <button onClick={() => handleOpenAuth('signup')} className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
              Sign Up
            </button>
          </div>
        </motion.nav>

        {/* New Hero Section */}
        <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-12 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text & CTAs */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex flex-col items-start text-left z-10"
            >
              <motion.div variants={fadeInUp} className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-1.5 text-sm font-medium text-slate-300">
                Connect • Collaborate • Create
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                Where Talent <br/>
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Meets Opportunity</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="max-w-xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
                The ultimate platform for actors, models, photographers, creators and brands to connect, collaborate and create magic together.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full sm:w-auto">
                <button 
                  onClick={() => handleOpenAuth('signup')}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  Join Now <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => navigate('/explore')}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl border border-white/20 bg-transparent px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/5"
                >
                  <PlayCircle className="h-5 w-5" /> Watch Demo
                </button>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  ].map((src, i) => (
                    <img key={i} src={src} alt="Creator" className="h-10 w-10 rounded-full border-2 border-[#030712] object-cover" />
                  ))}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#030712] bg-indigo-600 text-xs font-bold text-white z-10">
                    10K+
                  </div>
                </div>
                <div className="text-sm text-slate-400 leading-tight">
                  Join 10,000+ creators <br/> building their future
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Visuals */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center hidden md:flex"
            >
              {/* Main Composite Image */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute right-[-20%] lg:right-[-10%] top-[-5%] z-20 flex items-center justify-center w-[800px] lg:w-[1000px] pointer-events-none"
              >
                <img src={bgimage} alt="Composite Visuals" className="w-full h-auto object-contain scale-[1.15] drop-shadow-[0_0_50px_rgba(99,102,241,0.2)]" />
              </motion.div>

              {/* Floating Widgets */}
              <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center max-w-md mx-auto">
                <motion.div 
                  initial={{ rotate: -2 }}
                  animate={{ y: [0, 15, 0], rotate: [-2, 3, -2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[0%] right-[-40%] lg:right-[-60%] z-30 flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#1a1b2d]/95 p-5 backdrop-blur-xl shadow-2xl w-56 pointer-events-auto"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                      <Clapperboard className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Casting Call</p>
                      <p className="truncate text-sm font-bold text-white">Lead Actress</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5"/> Mumbai, India</div>
                    <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5"/> Deadline: 25 May, 2024</div>
                  </div>
                  <button className="mt-1 w-max rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 transition-transform hover:scale-105">Apply Now</button>
                </motion.div>

                <motion.div 
                  initial={{ rotate: 2 }}
                  animate={{ y: [0, -15, 0], rotate: [2, -3, 2] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-[5%] right-[-30%] lg:right-[-50%] z-30 flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#1a1b2d]/95 p-5 backdrop-blur-xl shadow-2xl w-56 pointer-events-auto"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Casting Call</p>
                      <p className="truncate text-sm font-bold text-white">Fashion Model</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5"/> Delhi, India</div>
                    <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5"/> Deadline: 30 May, 2024</div>
                  </div>
                  <button className="mt-1 w-max rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105">Apply Now</button>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Bottom Stats Strip */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 relative w-full rounded-3xl border border-white/10 bg-[#0f172a]/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-white/5 text-left">
              <div className="flex items-center gap-4 px-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold text-white">50K+</h4>
                  <p className="text-xs text-slate-400">Active Users</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 px-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold text-white">2K+</h4>
                  <p className="text-xs text-slate-400">Casting Calls</p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold text-white">100K+</h4>
                  <p className="text-xs text-slate-400">Reels Created</p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                  <Handshake className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold text-white">5K+</h4>
                  <p className="text-xs text-slate-400">Collaborations</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-12 flex flex-col items-center justify-center gap-2 text-slate-500 animate-bounce">
            <Mouse className="h-6 w-6" />
            <span className="text-xs font-medium">Scroll Down</span>
          </div>

        </section>

        {/* Interactive Demo */}
        <section id="demo" className="mx-auto max-w-6xl px-6 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Experience the magic</h2>
            <p className="text-lg text-slate-400">Try composing a post below. Watch it adapt in real-time.</p>
          </motion.div>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
            {/* Editor */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-indigo-400" />
                  Live Composer
                </h3>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Target Networks</label>
                  <div className="flex gap-3">
                    {Object.keys(MOCK_PLATFORM_CARD).map(plat => {
                      const data = MOCK_PLATFORM_CARD[plat];
                      const isSelected = selectedDemoPlatforms.includes(plat);
                      return (
                        <motion.button
                          key={plat}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleDemoPlatform(plat)}
                          className={`relative h-14 w-14 rounded-2xl border-2 p-0.5 transition-colors ${isSelected ? 'border-indigo-500' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                        >
                          <img src={data.avatar} alt={data.name} className="h-full w-full rounded-xl object-cover" />
                          <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-xs shadow-xl">
                            {data.icon}
                          </div>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg"
                              >
                                <Check className="h-3 w-3" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Caption</label>
                  <textarea
                    rows="4"
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/50 p-4 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="What's on your mind?..."
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Media</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
                      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80'].map((url, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDemoImage(url)}
                        className={`shrink-0 h-16 w-16 rounded-xl border-2 bg-cover bg-center ${demoImage === url ? 'border-indigo-500' : 'border-transparent'}`}
                        style={{ backgroundImage: `url(${url})` }}
                      />
                    ))}
                    <button onClick={() => setDemoImage('')} className="shrink-0 flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-slate-400 hover:bg-white/10 transition-colors">
                      None
                    </button>
                  </div>
                </div>

                <button onClick={() => handleOpenAuth('signup')} className="w-full rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                  Schedule Post
                </button>
              </div>
            </motion.div>

            {/* Previews */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <h3 className="text-xl font-bold text-white flex items-center justify-between">
                Live Previews
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                  {selectedDemoPlatforms.length} active
                </span>
              </h3>
              
              <div className="flex flex-col gap-6">
                <AnimatePresence mode="popLayout">
                  {selectedDemoPlatforms.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="rounded-3xl border border-white/10 border-dashed bg-white/5 p-10 text-center flex flex-col items-center justify-center"
                    >
                      <Layers className="h-10 w-10 text-slate-500 mb-3" />
                      <p className="text-slate-400">Select networks to preview</p>
                    </motion.div>
                  )}
                  {selectedDemoPlatforms.map((plat, idx) => {
                    const card = MOCK_PLATFORM_CARD[plat];
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100, delay: idx * 0.1 }}
                        key={plat} 
                        className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-md shadow-xl"
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <img src={card.avatar} alt={card.name} className="h-10 w-10 rounded-full border border-white/10 object-cover" />
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">{card.name}</p>
                            <p className="text-xs text-slate-400">Just now • {card.icon}</p>
                          </div>
                        </div>
                        <p className="mb-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{demoText}</p>
                        {demoImage && (
                          <div className="mb-4 overflow-hidden rounded-2xl border border-white/10">
                            <img src={demoImage} alt="Post" className="h-48 w-full object-cover transition-transform duration-700 hover:scale-105" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Supercharge your workflow</h2>
            <p className="text-lg text-slate-400">Everything you need to grow your audience faster.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: <Rocket className="h-6 w-6 text-indigo-400"/>, title: 'Smart Scheduling', desc: 'Auto-publish at optimal times for maximum engagement.' },
              { icon: <Send className="h-6 w-6 text-fuchsia-400"/>, title: 'Instant Cross-Posting', desc: 'One click to distribute content across all platforms.' },
              { icon: <MessageCircle className="h-6 w-6 text-cyan-400"/>, title: 'Unified Inbox', desc: 'Manage all comments and DMs from a single dashboard.' },
              { icon: <BarChart3 className="h-6 w-6 text-emerald-400"/>, title: 'Deep Analytics', desc: 'Track performance with beautiful, actionable reports.' }
            ].map((feat, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-indigo-500/50 hover:bg-white/10 backdrop-blur-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Pricing CTA */}
        <section id="pricing" className="mx-auto max-w-4xl px-6 py-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-12 text-center text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <h2 className="mb-4 text-4xl md:text-5xl font-black relative z-10">Start growing today</h2>
            <p className="mb-8 text-lg text-slate-300 relative z-10 max-w-xl mx-auto">
              Join thousands of creators automating their social presence for free.
            </p>
            <div className="mb-10 text-5xl font-black relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
              $0 <span className="text-xl font-medium text-slate-400">/ forever</span>
            </div>
            <button onClick={() => handleOpenAuth('signup')} className="relative z-10 rounded-full bg-white px-10 py-4 text-lg font-bold text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] active:scale-95">
              Create Free Account
            </button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            © 2026 SocialHub. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              <button onClick={() => setIsAuthOpen(false)} className="absolute top-6 right-6 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>

              <div className="relative z-10">
                <div className="mb-8 flex gap-6 border-b border-white/10">
                  {['login', 'signup'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAuthTab(tab)}
                      className={`relative pb-3 text-sm font-bold capitalize transition-colors ${authTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {tab === 'login' ? 'Log In' : 'Sign Up'}
                      {authTab === tab && (
                        <motion.div layoutId="authTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                      )}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {authTab === 'signup' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-1.5 overflow-hidden">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text" required placeholder="Alex Rivera" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email" required placeholder="alex@socialhub.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>

                  <AnimatePresence mode="popLayout">
                    {authTab === 'signup' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-1.5 overflow-hidden">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                        <input
                          type="text" required placeholder="alexdev" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                    <input
                      type="password" required placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>

                  <button type="submit" className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    {authTab === 'login' ? 'Log In to Dashboard' : 'Create Free Account'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
