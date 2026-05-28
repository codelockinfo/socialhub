import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  content: { type: String },
  mediaUrl: { type: String }, // Cloudinary URL
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  platforms: [{ type: String, enum: ['meta', 'youtube', 'linkedin'] }],
  
  status: { 
    type: String, 
    enum: ['draft', 'queued', 'published', 'failed'], 
    default: 'draft' 
  },
  scheduledTime: { type: Date },
  
  // Platform specific responses / IDs
  platformResponses: {
    metaId: { type: String },
    youtubeId: { type: String },
    linkedinId: { type: String }
  },
  
  // Analytics tracking
  analytics: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    reach: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);

export default Post;
