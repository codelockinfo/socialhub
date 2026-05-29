import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Video, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const YoutubeUpload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    privacyStatus: 'private',
  });
  
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'video') setVideoFile(file);
    if (type === 'thumbnail') setThumbnailFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setErrorMessage('Please select a video file to upload.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setProgress(0);
    setErrorMessage('');

    const uploadData = new FormData();
    uploadData.append('video', videoFile);
    if (thumbnailFile) uploadData.append('thumbnail', thumbnailFile);
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('tags', formData.tags);
    uploadData.append('privacyStatus', formData.privacyStatus);

    try {
      await api.post('/youtube/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // We limit client-side upload to 90%, the last 10% is server processing to YouTube
          setProgress(percentCompleted > 90 ? 90 : percentCompleted);
        },
        timeout: 0 // Disable timeout for large uploads
      });
      
      setProgress(100);
      setStatus('success');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/youtube/integrations');
      }, 2000);
    } catch (error) {
      console.error('Upload Error:', error);
      setStatus('error');
      setProgress(0);
      setErrorMessage(error.response?.data?.message || 'Failed to upload video to YouTube.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/youtube/integrations')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Studio
      </button>

      <div className="bg-[#1a1b26] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-red-600/10 to-transparent">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Upload className="w-8 h-8 text-red-500" />
            Upload to YouTube
          </h1>
          <p className="text-slate-400 mt-2">Publish directly to your connected YouTube channel.</p>
        </div>

        <div className="p-8">
          {status === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Upload Successful!</h3>
              <p className="text-emerald-500/80">Your video has been successfully published to YouTube. Redirecting...</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold">Upload Failed</h4>
                <p className="text-sm mt-1 opacity-80">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video File */}
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Video File *</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'video')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={status === 'uploading' || status === 'success'}
                  />
                  <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${videoFile ? 'border-red-500 bg-red-500/5' : 'border-white/10 bg-white/5 group-hover:border-white/20 group-hover:bg-white/10'}`}>
                    <Video className={`w-10 h-10 mb-3 ${videoFile ? 'text-red-500' : 'text-slate-500'}`} />
                    <p className="text-sm font-medium text-white mb-1">
                      {videoFile ? videoFile.name : 'Select video file'}
                    </p>
                    <p className="text-xs text-slate-500">MP4, WebM, MOV</p>
                  </div>
                </div>
              </div>

              {/* Thumbnail File */}
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Custom Thumbnail (Optional)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={status === 'uploading' || status === 'success'}
                  />
                  <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${thumbnailFile ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 bg-white/5 group-hover:border-white/20 group-hover:bg-white/10'}`}>
                    <ImageIcon className={`w-10 h-10 mb-3 ${thumbnailFile ? 'text-indigo-500' : 'text-slate-500'}`} />
                    <p className="text-sm font-medium text-white mb-1">
                      {thumbnailFile ? thumbnailFile.name : 'Select thumbnail'}
                    </p>
                    <p className="text-xs text-slate-500">JPG, PNG (Max 2MB)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a catchy title"
                  className="w-full bg-[#0f1015] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  required
                  disabled={status === 'uploading' || status === 'success'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell viewers about your video..."
                  rows="4"
                  className="w-full bg-[#0f1015] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                  disabled={status === 'uploading' || status === 'success'}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Tags (Comma separated)</label>
                  <input 
                    type="text" 
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="gaming, vlog, tutorial"
                    className="w-full bg-[#0f1015] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    disabled={status === 'uploading' || status === 'success'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Visibility</label>
                  <select 
                    name="privacyStatus"
                    value={formData.privacyStatus}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f1015] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none"
                    disabled={status === 'uploading' || status === 'success'}
                  >
                    <option value="private">Private (Only you)</option>
                    <option value="unlisted">Unlisted (Anyone with link)</option>
                    <option value="public">Public (Everyone)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit & Progress */}
            <div className="pt-6 border-t border-white/5">
              {status === 'uploading' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-medium flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      {progress === 90 ? 'Processing at YouTube...' : 'Uploading...'}
                    </span>
                    <span className="text-red-400 font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#0f1015] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : (
                <button 
                  type="submit"
                  disabled={!formData.title || !videoFile || status === 'success'}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all
                  bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  <Upload className="w-5 h-5" />
                  Publish to YouTube
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default YoutubeUpload;
