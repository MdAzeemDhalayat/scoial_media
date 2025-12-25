const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name],
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  const result = await query(
    "SELECT * FROM users WHERE username = $1 AND is_deleted = false",
    [username]
  );

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1 AND is_deleted = false",
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Search users by name or username
 * @param {string} searchQuery - Search query string
 * @param {number} excludeUserId - User ID to exclude from results
 * @param {number} limit - Number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of matching users
 */
const searchUsers = async (searchQuery, excludeUserId, limit = 20, offset = 0) => {
  const searchPattern = `%${searchQuery}%`;
  const result = await query(
    `SELECT id, username, email, full_name, created_at
     FROM users
     WHERE (full_name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1)
       AND id != $2
       AND is_deleted = false
     ORDER BY 
       CASE 
         WHEN username ILIKE $1 THEN 1
         WHEN full_name ILIKE $1 THEN 2
         ELSE 3
       END,
       username ASC
     LIMIT $3 OFFSET $4`,
    [searchPattern, excludeUserId, limit, offset]
  );

  return result.rows;
};

/**
 * Get user profile with follow counts
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User profile with counts or null
 */
const getUserProfile = async (userId) => {
  const { getFollowCounts } = require("./follow");
  
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  const counts = await getFollowCounts(userId);

  return {
    ...user,
    follower_count: counts.follower_count,
    following_count: counts.following_count,
  };
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  searchUsers,
  getUserProfile,
};
