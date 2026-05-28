import React, { useState } from 'react';
import { postService } from '../services/api';

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
    <article className="surface-card animate-fade-in-up flex flex-col gap-4 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-violet-500/20 hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)]">
      <div className="flex items-center gap-3">
        <img
          src={post.author.avatar}
          alt={post.author.fullName}
          className="h-11 w-11 rounded-full border-[1.5px] border-border object-cover"
        />
        <div className="flex flex-col">
          <span className="text-[0.95rem] font-semibold text-text-primary">{post.author.fullName}</span>
          <span className="text-[0.8rem] text-text-muted">
            @{post.author.username} · {post.timestamp}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-text-primary">{post.content}</p>

        {post.image && (
          <div className="max-h-[380px] overflow-hidden rounded-md border border-border">
            <img
              src={post.image}
              alt="Post Attachment"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="cursor-pointer rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[0.8rem] font-medium text-primary transition-colors hover:bg-indigo-500/20 hover:text-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 border-t border-border pt-4">
        <button
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.85rem] font-medium transition-all hover:bg-bg-surface-hover ${
            post.isLiked ? 'text-accent [&_svg]:drop-shadow-[0_0_6px_rgba(236,72,153,0.5)]' : 'text-text-secondary hover:text-accent'
          } ${isLiking ? 'pointer-events-none opacity-60' : ''}`}
          onClick={handleLike}
          aria-label="Like Post"
        >
          <svg
            className="h-[18px] w-[18px] active:scale-125"
            fill={post.isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{post.likesCount}</span>
        </button>

        <button
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.85rem] font-medium text-text-secondary transition-all hover:bg-bg-surface-hover hover:text-primary"
          aria-label="Comment on Post"
        >
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.commentsCount}</span>
        </button>

        <button
          className="ml-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.85rem] font-medium text-text-secondary transition-all hover:bg-bg-surface-hover hover:text-text-primary"
          aria-label="Share Post"
        >
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l5.264-2.632m0 7.78l-5.264-2.632M21 5a2 2 0 11-4 0 2 2 0 014 0zM7 16a2 2 0 11-4 0 2 2 0 014 0zm14-1a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>
    </article>
  );
}

export default PostCard;
