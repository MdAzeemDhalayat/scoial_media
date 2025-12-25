const {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
} = require("../models/post.js");
const { getPostLikeCount, hasUserLikedPost } = require("../models/like");
const { getPostCommentCount } = require("../models/comment");
const { isFollowing } = require("../models/follow");
const logger = require("../utils/logger");

/**
 * Create a new post
 * 
 * SCHEDULED POSTING: Supports optional scheduled_at field (ISO timestamp).
 * If provided and in the future, the post will be created but will NOT appear
 * in the feed until the scheduled time is reached (handled by background scheduler).
 */
const create = async (req, res) => {
  try {
    const { content, media_url, comments_enabled, scheduled_at } = req.validatedData;
    const userId = req.user.id;

    // Validate scheduled_at is in the future
    if (scheduled_at) {
      const scheduledDate = new Date(scheduled_at);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: "Scheduled time must be in the future" });
      }
    }

    const post = await createPost({
      user_id: userId,
      content,
      media_url,
      comments_enabled,
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
    });

    logger.verbose(`User ${userId} created post ${post.id}`);

    // Add counts
    const likeCount = await getPostLikeCount(post.id);
    const commentCount = await getPostCommentCount(post.id);

    res.status(201).json({
      message: "Post created successfully",
      post: {
        ...post,
        like_count: likeCount,
        comment_count: commentCount,
      },
    });
  } catch (error) {
    logger.critical("Create post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Helper function to enrich post with counts and user-specific data
 */
const enrichPost = async (post, userId = null) => {
  const likeCount = await getPostLikeCount(post.id);
  const commentCount = await getPostCommentCount(post.id);
  
  const enriched = {
    ...post,
    like_count: likeCount,
    comment_count: commentCount,
  };

  if (userId) {
    const liked = await hasUserLikedPost(userId, post.id);
    enriched.is_liked = liked;
    
    if (post.user_id !== userId) {
      const following = await isFollowing(userId, post.user_id);
      enriched.is_following = following;
    }
  }

  return enriched;
};

/**
 * Get a single post by ID
 */
const getById = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user ? req.user.id : null;

    const post = await getPostById(parseInt(post_id));

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const enrichedPost = await enrichPost(post, userId);

    res.json({ post: enrichedPost });
  } catch (error) {
    logger.critical("Get post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts by a specific user
 */
const getUserPosts = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userId = req.user ? req.user.id : null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getPostsByUserId(parseInt(user_id), limit, offset);

    // Enrich posts with counts
    const enrichedPosts = await Promise.all(
      posts.map(post => enrichPost(post, userId))
    );

    res.json({
      posts: enrichedPosts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user's posts
 */
const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getPostsByUserId(userId, limit, offset);

    // Enrich posts with counts
    const enrichedPosts = await Promise.all(
      posts.map(post => enrichPost(post, userId))
    );

    res.json({
      posts: enrichedPosts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get my posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get content feed (posts from followed users + own posts)
 */
const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getFeedPosts(userId, limit, offset);

    // Enrich posts with counts and user-specific data
    const enrichedPosts = await Promise.all(
      posts.map(post => enrichPost(post, userId))
    );

    res.json({
      posts: enrichedPosts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get feed error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a post
 */
const remove = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const success = await deletePost(parseInt(post_id), userId);

    if (!success) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted post ${post_id}`);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    logger.critical("Delete post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  getById,
  getUserPosts,
  getMyPosts,
  remove,
  getFeed,
};
