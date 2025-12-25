const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 */

/**
 * Create a comment on a post
 * @param {number} userId - User ID
 * @param {number} postId - Post ID
 * @param {string} content - Comment content
 * @returns {Promise<Object>} Created comment
 */
const createComment = async (userId, postId, content) => {
  const result = await query(
    `INSERT INTO comments (user_id, post_id, content, created_at, is_deleted)
     VALUES ($1, $2, $3, NOW(), false)
     RETURNING *`,
    [userId, postId, content]
  );

  return result.rows[0];
};

/**
 * Get comment by ID
 * @param {number} commentId - Comment ID
 * @returns {Promise<Object|null>} Comment object or null
 */
const getCommentById = async (commentId) => {
  const result = await query(
    `SELECT c.*, u.username, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = $1 AND c.is_deleted = false`,
    [commentId]
  );

  return result.rows[0] || null;
};

/**
 * Update a comment
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (for ownership verification)
 * @param {string} content - New comment content
 * @returns {Promise<boolean>} Success status
 */
const updateComment = async (commentId, userId, content) => {
  const result = await query(
    `UPDATE comments 
     SET content = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND is_deleted = false`,
    [content, commentId, userId]
  );

  return result.rowCount > 0;
};

/**
 * Delete a comment (soft delete)
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deleteComment = async (commentId, userId) => {
  const result = await query(
    `UPDATE comments 
     SET is_deleted = true, updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND is_deleted = false`,
    [commentId, userId]
  );

  return result.rowCount > 0;
};

/**
 * Get comments for a post
 * @param {number} postId - Post ID
 * @param {number} limit - Number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of comments
 */
const getPostComments = async (postId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT c.*, u.username, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1 AND c.is_deleted = false
     ORDER BY c.created_at ASC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return result.rows;
};

/**
 * Get comment count for a post
 * @param {number} postId - Post ID
 * @returns {Promise<number>} Comment count
 */
const getPostCommentCount = async (postId) => {
  const result = await query(
    "SELECT COUNT(*) as count FROM comments WHERE post_id = $1 AND is_deleted = false",
    [postId]
  );

  return parseInt(result.rows[0].count);
};

module.exports = {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getPostComments,
  getPostCommentCount,
};
