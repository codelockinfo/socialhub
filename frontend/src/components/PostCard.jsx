import React, { useState } from 'react';
import { postService } from '../services/api';
import './PostCard.css';

function PostCard({ post, onLikeToggle }) {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const updatedPost = await postService.toggleLike(post.id);
      if (onLikeToggle) {
        onLikeToggle(updatedPost);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="post-card glass-panel animate-fade-in-up">
      <div className="post-header">
        <img 
          src={post.author.avatar} 
          alt={post.author.fullName} 
          className="post-avatar" 
        />
        <div className="post-author-meta">
          <span className="post-author-name">{post.author.fullName}</span>
          <span className="post-author-handle">@{post.author.username} · {post.timestamp}</span>
        </div>
      </div>

      <div className="post-body">
        <p className="post-content">{post.content}</p>
        
        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt="Post Attachment" className="post-image" />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag-pill">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="post-footer">
        <button 
          className={`post-action-btn like-btn ${post.isLiked ? 'liked' : ''} ${isLiking ? 'loading' : ''}`}
          onClick={handleLike}
          aria-label="Like Post"
        >
          <svg className="action-icon" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="action-count">{post.likesCount}</span>
        </button>

        <button className="post-action-btn comment-btn" aria-label="Comment on Post">
          <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="action-count">{post.commentsCount}</span>
        </button>

        <button className="post-action-btn share-btn" aria-label="Share Post">
          <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l5.264-2.632m0 7.78l-5.264-2.632M21 5a2 2 0 11-4 0 2 2 0 014 0zM7 16a2 2 0 11-4 0 2 2 0 014 0zm14-1a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>
    </article>
  );
}

export default PostCard;
