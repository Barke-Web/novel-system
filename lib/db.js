import mysql from 'mysql2';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'novel',
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // Allow multiple statements in one query
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Promisify the pool
const promisePool = pool.promise();

// Test the connection on startup
(async function testConnection() {
  try {
    const connection = await promisePool.getConnection();
    console.log('Connected to MySQL database successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to MySQL database:', error.message);
  }
})();

// Regular query function
export async function query(sql, params) {
  let connection;
  try {
    connection = await promisePool.getConnection();
    
    // Use query instead of execute for non-prepared statements
    if (sql.includes('START TRANSACTION') || 
        sql.includes('COMMIT') || 
        sql.includes('ROLLBACK')) {
      const [results] = await connection.query(sql);
      return results;
    } else {
      const [results] = await connection.execute(sql, params);
      return results;
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Transaction handling function
export async function transaction(callback) {
  let connection;
  try {
    connection = await promisePool.getConnection();
    
    // Start transaction using query (not execute)
    await connection.query('START TRANSACTION');
    
    // Execute the callback with the connection
    const result = await callback(connection);
    
    // Commit the transaction
    await connection.query('COMMIT');
    
    return result;
  } catch (error) {
    // Rollback in case of error
    if (connection) {
      try {
        await connection.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    console.error('Transaction error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Get a raw connection for special cases
export async function getConnection() {
  return await promisePool.getConnection();
}