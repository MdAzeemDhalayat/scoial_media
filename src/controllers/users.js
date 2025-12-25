const {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowing,
  getFollowers,
  getFollowCounts,
} = require("../models/follow");
const { getUserById, searchUsers } = require("../models/user");
const logger = require("../utils/logger");

/**
 * Follow a user
 */
const follow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { user_id } = req.params;
    const followingId = parseInt(user_id);

    if (followerId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    // Check if user exists
    const userToFollow = await getUserById(followingId);
    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    const follow = await followUser(followerId, followingId);

    if (!follow) {
      return res.status(400).json({ error: "Already following this user" });
    }

    logger.verbose(`User ${followerId} followed user ${followingId}`);

    const counts = await getFollowCounts(followingId);

    res.status(201).json({
      message: "User followed successfully",
      follow,
      follower_count: counts.follower_count,
      following_count: counts.following_count,
      is_following: true,
    });
  } catch (error) {
    logger.critical("Follow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unfollow a user
 */
const unfollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { user_id } = req.params;
    const followingId = parseInt(user_id);

    const success = await unfollowUser(followerId, followingId);

    if (!success) {
      return res.status(404).json({ error: "Not following this user" });
    }

    logger.verbose(`User ${followerId} unfollowed user ${followingId}`);

    const counts = await getFollowCounts(followingId);

    res.json({
      message: "User unfollowed successfully",
      follower_count: counts.follower_count,
      following_count: counts.following_count,
      is_following: false,
    });
  } catch (error) {
    logger.critical("Unfollow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that the current user is following
 */
const getMyFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const following = await getFollowing(userId, limit, offset);

    res.json({
      following,
      pagination: {
        page,
        limit,
        hasMore: following.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that follow the current user
 */
const getMyFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const followers = await getFollowers(userId, limit, offset);

    res.json({
      followers,
      pagination: {
        page,
        limit,
        hasMore: followers.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get follow stats for current user
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const counts = await getFollowCounts(userId);

    res.json({
      follower_count: counts.follower_count,
      following_count: counts.following_count,
    });
  } catch (error) {
    logger.critical("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Search users by name or username
 */
const search = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const users = await searchUsers(q, currentUserId, limit, offset);

    res.json({
      users,
      pagination: {
        page,
        limit,
        hasMore: users.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Search users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getStats,
  search,
};
