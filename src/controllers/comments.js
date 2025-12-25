const {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getPostComments,
  getPostCommentCount,
} = require("../models/comment");
const { getPostById } = require("../models/post");
const { validateRequest, updateCommentSchema, createCommentSchema } = require("../utils/validation");
const logger = require("../utils/logger");

/**
 * Create a comment on a post
 */
const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { post_id } = req.params;
    const postId = parseInt(post_id);
    const { content } = req.validatedData;

    // Check if post exists
    const post = await getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if comments are enabled
    if (!post.comments_enabled) {
      return res.status(403).json({ error: "Comments are disabled for this post" });
    }

    const comment = await createComment(userId, postId, content);

    logger.verbose(`User ${userId} created comment ${comment.id} on post ${postId}`);

    const commentCount = await getPostCommentCount(postId);

    res.status(201).json({
      message: "Comment created successfully",
      comment,
      comment_count: commentCount,
    });
  } catch (error) {
    logger.critical("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a comment
 */
const update = async (req, res) => {
  try {
    const userId = req.user.id;
    const { comment_id } = req.params;
    const commentId = parseInt(comment_id);
    const { content } = req.validatedData;

    // Check if comment exists and belongs to user
    const comment = await getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }

    const success = await updateComment(commentId, userId, content);

    if (!success) {
      return res.status(404).json({ error: "Comment not found or unauthorized" });
    }

    logger.verbose(`User ${userId} updated comment ${commentId}`);

    const updatedComment = await getCommentById(commentId);

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    logger.critical("Update comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a comment
 */
const remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const { comment_id } = req.params;
    const commentId = parseInt(comment_id);

    // Check if comment exists and belongs to user
    const comment = await getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    const success = await deleteComment(commentId, userId);

    if (!success) {
      return res.status(404).json({ error: "Comment not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted comment ${commentId}`);

    const commentCount = await getPostCommentCount(comment.post_id);

    res.json({
      message: "Comment deleted successfully",
      comment_count: commentCount,
    });
  } catch (error) {
    logger.critical("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get comments for a post
 */
const getPostCommentsList = async (req, res) => {
  try {
    const { post_id } = req.params;
    const postId = parseInt(post_id);

    // Check if post exists
    const post = await getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const comments = await getPostComments(postId, limit, offset);
    const commentCount = await getPostCommentCount(postId);

    res.json({
      comments,
      comment_count: commentCount,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get post comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  update,
  remove,
  getPostCommentsList,
};
