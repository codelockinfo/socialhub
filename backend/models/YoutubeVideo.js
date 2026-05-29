import mongoose from 'mongoose';

const YoutubeVideoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  tags: [{
    type: String
  }],
  privacyStatus: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'private'
  },
  thumbnailUrl: {
    type: String
  },
  videoUrl: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const YoutubeVideo = mongoose.model('YoutubeVideo', YoutubeVideoSchema);

export default YoutubeVideo;
