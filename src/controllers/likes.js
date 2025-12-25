const {
  likePost,
  unlikePost,
  hasUserLikedPost,
  getPostLikeCount,
  getUserLikedPosts,
  getPostLikes,
} = require("../models/like");
const { getPostById } = require("../models/post");
const logger = require("../utils/logger");

/**
 * Like a post
 */
const like = async (req, res) => {
  try {
    const userId = req.user.id;
    const { post_id } = req.params;
    const postId = parseInt(post_id);

    // Check if post exists
    const post = await getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Users can like their own posts too, so no check for ownership

    const like = await likePost(userId, postId);

    if (!like) {
      return res.status(400).json({ error: "Post already liked" });
    }

    logger.verbose(`User ${userId} liked post ${postId}`);

    const likeCount = await getPostLikeCount(postId);

    res.status(201).json({
      message: "Post liked successfully",
      like,
      like_count: likeCount,
    });
  } catch (error) {
    logger.critical("Like post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unlike a post
 */
const unlike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { post_id } = req.params;
    const postId = parseInt(post_id);

    const success = await unlikePost(userId, postId);

    if (!success) {
      return res.status(404).json({ error: "Post not liked" });
    }

    logger.verbose(`User ${userId} unliked post ${postId}`);

    const likeCount = await getPostLikeCount(postId);

    res.json({
      message: "Post unliked successfully",
      like_count: likeCount,
    });
  } catch (error) {
    logger.critical("Unlike post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get likes for a post
 */
const getPostLikesList = async (req, res) => {
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

    const likes = await getPostLikes(postId, limit, offset);
    const likeCount = await getPostLikeCount(postId);

    res.json({
      likes,
      like_count: likeCount,
      pagination: {
        page,
        limit,
        hasMore: likes.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get post likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts liked by a user
 */
const getUserLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getUserLikedPosts(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  like,
  unlike,
  getPostLikesList,
  getUserLikes,
};
