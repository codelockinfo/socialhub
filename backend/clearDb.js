import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || ''
};

async function clear() {
  const dbName = process.env.DB_NAME || 'socialhub_db';
  console.log(`Connecting to MySQL host at ${dbConfig.host}:${dbConfig.port}...`);
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log(`Dropping database "${dbName}" if it exists...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" successfully cleared/dropped! 🗑️`);
  } catch (error) {
    console.error('Error clearing the database:', error);
  } finally {
    await connection.end();
  }
}

clear();
