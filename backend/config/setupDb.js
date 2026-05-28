import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || ''
};

export async function setupDb() {
  console.log('Connecting to MySQL host...');
  const connection = await mysql.createConnection(dbConfig);

  try {
    const dbName = process.env.DB_NAME || 'socialhub_db';
    console.log(`Creating database "${dbName}" if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    console.log('Creating "users" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        fullName VARCHAR(100) NOT NULL,
        avatar TEXT,
        bio TEXT,
        banner TEXT,
        followersCount INT DEFAULT 0,
        followingCount INT DEFAULT 0,
        postsCount INT DEFAULT 0
      )
    `);

    console.log('Creating "posts" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        tags TEXT, -- Stored as JSON array string
        likesCount INT DEFAULT 0,
        commentsCount INT DEFAULT 0,
        timestamp VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating "likes" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        postId VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_post_like (userId, postId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating "trends" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trends (
        tag VARCHAR(50) PRIMARY KEY,
        postsCount VARCHAR(10) NOT NULL
      )
    `);

    console.log('Creating "channels" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS channels (
        id VARCHAR(50) PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        accountName VARCHAR(100) NOT NULL,
        avatar TEXT,
        followersCount INT DEFAULT 0,
        isConnected BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating "scheduler_posts" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS scheduler_posts (
        id VARCHAR(50) PRIMARY KEY,
        content TEXT NOT NULL,
        mediaUrl TEXT,
        platforms TEXT NOT NULL, -- JSON array of platforms e.g. ["facebook", "instagram"]
        status VARCHAR(20) DEFAULT 'queued', -- 'queued', 'sent', 'draft'
        scheduledTime TIMESTAMP NULL,
        likesCount INT DEFAULT 0,
        commentsCount INT DEFAULT 0,
        sharesCount INT DEFAULT 0,
        reachCount INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ============================================
    // SEEDING DATA
    // ============================================
    console.log('Seeding initial data...');

    // 1. Seed Users
    const seedUsers = [
      {
        id: 'current_user_1',
        username: 'alexdev',
        fullName: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        bio: 'Building premium web experiences. React Developer & Designer.',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        followersCount: 1420,
        followingCount: 582,
        postsCount: 12
      },
      {
        id: 'user_sarahtech',
        username: 'sarahtech',
        fullName: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        bio: 'Frontend Architect. Designing clean components.',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        followersCount: 2840,
        followingCount: 420,
        postsCount: 45
      },
      {
        id: 'user_marcus',
        username: 'marcus_k',
        fullName: 'Marcus Knight',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        bio: 'Fullstack Dev. Node, React, MySQL developer.',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        followersCount: 890,
        followingCount: 120,
        postsCount: 22
      },
      {
        id: 'user_elena',
        username: 'design_mind',
        fullName: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        bio: 'Colors & Gradients enthusiast.',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        followersCount: 5120,
        followingCount: 302,
        postsCount: 61
      }
    ];

    for (const u of seedUsers) {
      await connection.query(`
        INSERT INTO users (id, username, fullName, avatar, bio, banner, followersCount, followingCount, postsCount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          fullName=VALUES(fullName), bio=VALUES(bio), avatar=VALUES(avatar)
      `, [u.id, u.username, u.fullName, u.avatar, u.bio, u.banner, u.followersCount, u.followingCount, u.postsCount]);
    }

    // 2. Seed Posts
    const seedPosts = [
      {
        id: 'post-1',
        userId: 'user_sarahtech',
        content: 'Just finished building the new design system for SocialHub. The dark theme is looking absolutely incredible. What do you think about glassmorphism panels?',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        tags: JSON.stringify(['UI', 'DesignSystem', 'React']),
        likesCount: 142,
        commentsCount: 28,
        timestamp: '2 hours ago'
      },
      {
        id: 'post-2',
        userId: 'user_marcus',
        content: 'Good morning developers! Reminding everyone to write clean code, keep component libraries focused, and optimize those asset builds. Vite + React 19 is extremely fast.',
        image: null,
        tags: JSON.stringify(['webdev', 'productivity', 'vite']),
        likesCount: 95,
        commentsCount: 14,
        timestamp: '5 hours ago'
      },
      {
        id: 'post-3',
        userId: 'user_elena',
        content: 'Captured this beautiful gradient sky on my hike yesterday. Nature is the best color palette generator. 🌄',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        tags: JSON.stringify(['nature', 'inspiration', 'photography']),
        likesCount: 312,
        commentsCount: 45,
        timestamp: '1 day ago'
      }
    ];

    for (const p of seedPosts) {
      await connection.query(`
        INSERT INTO posts (id, userId, content, image, tags, likesCount, commentsCount, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          content=VALUES(content), image=VALUES(image), tags=VALUES(tags)
      `, [p.id, p.userId, p.content, p.image, p.tags, p.likesCount, p.commentsCount, p.timestamp]);
    }

    // 3. Seed initial like relation for alexdev liking post-2
    await connection.query(`
      INSERT IGNORE INTO likes (userId, postId)
      VALUES (?, ?)
    `, ['current_user_1', 'post-2']);

    // 4. Seed Trends
    const seedTrends = [
      { tag: 'React19', postsCount: '12.4k' },
      { tag: 'ViteJS', postsCount: '8.1k' },
      { tag: 'CSSDesign', postsCount: '24.9k' },
      { tag: 'WebAesthetics', postsCount: '5.2k' },
      { tag: 'MicroAnimations', postsCount: '15.6k' }
    ];

    for (const t of seedTrends) {
      await connection.query(`
        INSERT INTO trends (tag, postsCount)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE postsCount=VALUES(postsCount)
      `, [t.tag, t.postsCount]);
    }

    // 5. Seed Channels
    console.log('Seeding channels...');
    const seedChannels = [
      {
        id: 'chan-1',
        platform: 'facebook',
        accountName: 'ncodeloke',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
        followersCount: 1250,
        isConnected: true
      },
      {
        id: 'chan-2',
        platform: 'instagram',
        accountName: 'trendkut99',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        followersCount: 3410,
        isConnected: true
      },
      {
        id: 'chan-3',
        platform: 'linkedin',
        accountName: 'Alex Rivera (Dev)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        followersCount: 890,
        isConnected: true
      }
    ];

    for (const c of seedChannels) {
      await connection.query(`
        INSERT INTO channels (id, platform, accountName, avatar, followersCount, isConnected)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          accountName=VALUES(accountName), avatar=VALUES(avatar), followersCount=VALUES(followersCount), isConnected=VALUES(isConnected)
      `, [c.id, c.platform, c.accountName, c.avatar, c.followersCount, c.isConnected]);
    }

    // 6. Seed Scheduled Posts
    console.log('Seeding scheduled posts...');
    const seedScheduledPosts = [
      {
        id: 'sched-1',
        content: 'Excited to announce the launch of SocialHub! Manage all your social channels from one unified, premium dashboard. 🚀 #SaaS #BuildInPublic',
        mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        platforms: JSON.stringify(['facebook', 'linkedin']),
        status: 'sent',
        scheduledTime: new Date(Date.now() - 3600000 * 2), // 2 hours ago
        likesCount: 45,
        commentsCount: 12,
        sharesCount: 5,
        reachCount: 1420
      },
      {
        id: 'sched-2',
        content: 'Check out our new dark mode theme! It utilizes modern glassmorphism panels and harmonized color palettes to reduce eye strain while looking gorgeous. Let us know your thoughts! 🌗✨',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        platforms: JSON.stringify(['facebook', 'instagram', 'linkedin']),
        status: 'queued',
        scheduledTime: new Date(Date.now() + 3600000 * 24), // 24 hours from now
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        reachCount: 0
      }
    ];

    for (const sp of seedScheduledPosts) {
      await connection.query(`
        INSERT INTO scheduler_posts (id, content, mediaUrl, platforms, status, scheduledTime, likesCount, commentsCount, sharesCount, reachCount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          content=VALUES(content), mediaUrl=VALUES(mediaUrl), platforms=VALUES(platforms), status=VALUES(status), scheduledTime=VALUES(scheduledTime)
      `, [sp.id, sp.content, sp.mediaUrl, sp.platforms, sp.status, sp.scheduledTime, sp.likesCount, sp.commentsCount, sp.sharesCount, sp.reachCount]);
    }

    console.log('Database successfully initialized and seeded! 🎉');
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    await connection.end();
  }
}

// Run if executed directly
if (process.argv[1] && (process.argv[1].endsWith('setupDb.js') || process.argv[1].endsWith('setupDb'))) {
  setupDb();
}
