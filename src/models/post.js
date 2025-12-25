const { query } = require("../utils/database");

/**
 * Post model for database operations
 *
 * IMPORTANT (Timezone Handling):
 * --------------------------------
 * - All timestamps are stored and compared in UTC
 * - scheduled_at must be sent in UTC ISO format from client
 * - This avoids timezone bugs and follows production standards
 */

/**
 * Create a new post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
  scheduled_at = null,
}) => {
  const scheduledAtUTC = scheduled_at
    ? new Date(scheduled_at).toISOString()
    : null;

  const result = await query(
    `INSERT INTO posts (
        user_id,
        content,
        media_url,
        comments_enabled,
        scheduled_at,
        created_at,
        is_deleted
     )
     VALUES ($1, $2, $3, $4, $5, NOW(), false)
     RETURNING
       id,
       user_id,
       content,
       media_url,
       comments_enabled,
       scheduled_at,
       created_at`,
    [
      user_id,
      content || null,
      media_url || null,
      comments_enabled,
      scheduledAtUTC,
    ]
  );

  return result.rows[0];
};

/**
 * Get post by ID
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1
       AND p.is_deleted = false
       AND (p.scheduled_at IS NULL OR p.scheduled_at <= NOW())`,
    [postId]
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1
       AND p.is_deleted = false
       AND (p.scheduled_at IS NULL OR p.scheduled_at <= NOW())
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Delete a post (soft delete)
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    `UPDATE posts
     SET is_deleted = true
     WHERE id = $1 AND user_id = $2`,
    [postId, userId]
  );

  return result.rowCount > 0;
};

/**
 * Get feed posts (own + followed users)
 *
 * Scheduled posts appear ONLY after scheduled_at <= NOW()
 */
const getFeedPosts = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT DISTINCT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN follows f
       ON f.following_id = p.user_id
      AND f.follower_id = $1
     WHERE p.is_deleted = false
       AND (p.user_id = $1 OR f.follower_id = $1)
       AND (p.scheduled_at IS NULL OR p.scheduled_at <= NOW())
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Publish scheduled posts
 *
 * Called by background scheduler every 60 seconds
 */
const publishScheduledPosts = async () => {
  const result = await query(
    `UPDATE posts
     SET scheduled_at = NULL
     WHERE scheduled_at IS NOT NULL
       AND scheduled_at <= NOW()
       AND is_deleted = false
     RETURNING id`
  );

  return result.rowCount;
};

module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
  publishScheduledPosts,
};
