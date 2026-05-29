import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import api from '../services/api';

const YoutubeIntegrations = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const authSuccess = searchParams.get('success') === 'true';
  const authError = searchParams.get('error');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/youtube/videos');
      setVideos(res.data);
    } catch (error) {
      console.error('Failed to fetch youtube videos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      // Fetch the Google Auth URL from our protected backend endpoint
      const res = await api.get('/youtube/auth');
      // Redirect the browser to the Google Consent Screen
      if (res.data && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Failed to initiate YouTube auth', error);
      alert('Failed to connect to YouTube. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaYoutube className="w-8 h-8 text-red-500" />
            YouTube Studio
          </h1>
          <p className="text-slate-400 mt-2">Manage your YouTube connection and upload videos directly.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleConnect}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2a2b36] border border-white/10 text-white hover:bg-[#343542] transition-colors shadow-sm"
          >
            <FaYoutube className="w-5 h-5 text-red-500" />
            Connect Account
          </button>
          <button 
            onClick={() => navigate('/youtube/upload')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)] font-medium"
          >
            <Plus className="w-5 h-5" />
            New Upload
          </button>
        </div>
      </div>

      {/* Notifications */}
      {authSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          Successfully connected your YouTube account! You can now start uploading videos.
        </motion.div>
      )}
      {authError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          Failed to connect YouTube account. Please try again.
        </motion.div>
      )}

      {/* Videos List */}
      <h2 className="text-xl font-bold text-white mb-6">Upload History</h2>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1b26] rounded-2xl border border-white/5 shadow-xl">
          <FaYoutube className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">No videos uploaded yet</h3>
          <p className="text-slate-400 mt-2 mb-6">Connect your account and upload your first video to YouTube.</p>
          <button 
            onClick={() => navigate('/youtube/upload')}
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Start Upload
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <motion.div 
              key={video._id}
              whileHover={{ y: -5 }}
              className="bg-[#1a1b26] rounded-2xl overflow-hidden border border-white/5 shadow-xl group"
            >
              <div className="relative aspect-video">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                  {video.privacyStatus}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-lg line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                  {video.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(video.uploadDate).toLocaleDateString()}
                  </div>
                  <a 
                    href={video.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YoutubeIntegrations;
