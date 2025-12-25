const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 */

/**
 * Follow a user
 * @param {number} followerId - ID of the user who wants to follow
 * @param {number} followingId - ID of the user to be followed
 * @returns {Promise<Object>} Follow relationship object
 */
const followUser = async (followerId, followingId) => {
  const result = await query(
    `INSERT INTO follows (follower_id, following_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (follower_id, following_id) DO NOTHING
     RETURNING *`,
    [followerId, followingId]
  );

  return result.rows[0] || null;
};

/**
 * Unfollow a user
 * @param {number} followerId - ID of the user who wants to unfollow
 * @param {number} followingId - ID of the user to be unfollowed
 * @returns {Promise<boolean>} Success status
 */
const unfollowUser = async (followerId, followingId) => {
  const result = await query(
    "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
    [followerId, followingId]
  );

  return result.rowCount > 0;
};

/**
 * Check if a user is following another user
 * @param {number} followerId - ID of the follower
 * @param {number} followingId - ID of the user being followed
 * @returns {Promise<boolean>} True if following, false otherwise
 */
const isFollowing = async (followerId, followingId) => {
  const result = await query(
    "SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2",
    [followerId, followingId]
  );

  return result.rows.length > 0;
};

/**
 * Get users that a user is following
 * @param {number} userId - User ID
 * @param {number} limit - Number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of users being followed
 */
const getFollowing = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name, u.created_at, f.created_at as followed_at
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = $1 AND u.is_deleted = false
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Get users that follow a user
 * @param {number} userId - User ID
 * @param {number} limit - Number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of followers
 */
const getFollowers = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name, u.created_at, f.created_at as followed_at
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = $1 AND u.is_deleted = false
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Get follow counts for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Object with follower_count and following_count
 */
const getFollowCounts = async (userId) => {
  const followerCount = await query(
    "SELECT COUNT(*) as count FROM follows WHERE following_id = $1",
    [userId]
  );

  const followingCount = await query(
    "SELECT COUNT(*) as count FROM follows WHERE follower_id = $1",
    [userId]
  );

  return {
    follower_count: parseInt(followerCount.rows[0].count),
    following_count: parseInt(followingCount.rows[0].count),
  };
};

module.exports = {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowing,
  getFollowers,
  getFollowCounts,
};
