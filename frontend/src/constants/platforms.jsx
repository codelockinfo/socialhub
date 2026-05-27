import React from 'react';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaPinterest,
  FaGoogle,
  FaMastodon,
} from 'react-icons/fa';
import { SiThreads, SiBluesky } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';

export const PLATFORM_THEMES = {
  facebook: { name: 'Facebook Page', color: '#1877f2', icon: <FaFacebook />, prefix: 'fb/' },
  instagram: { name: 'Instagram', color: '#e1306c', icon: <FaInstagram />, prefix: 'ig/' },
  linkedin: { name: 'LinkedIn', color: '#0077b5', icon: <FaLinkedin />, prefix: 'li/' },
  twitter: { name: 'X / Twitter', color: '#1da1f2', icon: <FaXTwitter />, prefix: 'x/' },
  youtube: { name: 'YouTube', color: '#ff0000', icon: <FaYoutube />, prefix: 'yt/' },
  threads: { name: 'Threads', color: '#000000', icon: <SiThreads />, prefix: 'th/' },
  tiktok: { name: 'TikTok', color: '#010101', icon: <FaTiktok />, prefix: 'tt/' },
  pinterest: { name: 'Pinterest', color: '#bd081c', icon: <FaPinterest />, prefix: 'pin/' },
  bluesky: { name: 'Bluesky', color: '#2b8aff', icon: <SiBluesky />, prefix: 'bsky/' },
  mastodon: { name: 'Mastodon', color: '#6364ff', icon: <FaMastodon />, prefix: 'masto/' },
  google: { name: 'Google Business', color: '#4285f4', icon: <FaGoogle />, prefix: 'gbp/' },
};

export const ALL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: <FaInstagram />, color: '#e1306c' },
  { id: 'facebook', name: 'Facebook', icon: <FaFacebook />, color: '#1877f2' },
  { id: 'twitter', name: 'Twitter / X', icon: <FaXTwitter />, color: '#1da1f2' },
  { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedin />, color: '#0077b5' },
  { id: 'tiktok', name: 'TikTok', icon: <FaTiktok />, color: '#010101' },
  { id: 'youtube', name: 'YouTube', icon: <FaYoutube />, color: '#ff0000' },
  { id: 'pinterest', name: 'Pinterest', icon: <FaPinterest />, color: '#bd081c' },
  { id: 'threads', name: 'Threads', icon: <SiThreads />, color: '#000000' },
  { id: 'bluesky', name: 'Bluesky', icon: <SiBluesky />, color: '#2b8aff' },
  { id: 'mastodon', name: 'Mastodon', icon: <FaMastodon />, color: '#6364ff' },
  { id: 'google', name: 'Google Business', icon: <FaGoogle />, color: '#4285f4' },
];

/** Shown in sidebar quick-connect row (Buffer-style) */
export const QUICK_CONNECT_PLATFORMS = ['threads', 'linkedin', 'bluesky'];

export const DEFAULT_ACCOUNT_NAMES = {
  instagram: 'trendkut99',
  facebook: 'ncodeloke',
  twitter: 'trendkut_x',
  linkedin: 'Alex Rivera (Dev)',
  tiktok: 'trendkut_tok',
  youtube: 'TrendKut Studio',
  pinterest: 'trend_pins',
  threads: 'trend_threads',
  bluesky: 'trendkut.bsky.social',
  mastodon: 'trendkut@mastodon.social',
  google: 'TrendKut Agency',
};

export function getDefaultAvatar(platform) {
  if (platform === 'youtube') {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80';
  }
  if (platform === 'linkedin') {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
  }
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
}
