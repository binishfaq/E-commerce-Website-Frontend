// backend/src/utils/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔄 Connecting to MySQL...');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || 3306}`);
console.log(`User: ${process.env.DB_USER || 'root'}`);
console.log(`Database: ${process.env.DB_NAME || 'easeshop'}`);

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easeshop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔐 Access denied - wrong username or password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🗄️ Database does not exist:', process.env.DB_NAME);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection refused - MySQL is not running');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️ Connection timeout');
    }
    
    return false;
  }
};

export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

export const getOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
};

export const insert = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result.insertId;
};

// Export pool as well for transactions
export { pool };

export default pool;