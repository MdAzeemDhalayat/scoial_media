const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getStats,
  search,
} = require("../controllers/users");

const router = express.Router();

/**
 * User-related routes
 */

// All routes require authentication
router.use(authenticateToken);

// POST /api/users/:user_id/follow - Follow a user
router.post("/:user_id/follow", follow);

// DELETE /api/users/:user_id/follow - Unfollow a user
router.delete("/:user_id/follow", unfollow);

// GET /api/users/following - Get users that current user follows
router.get("/following", getMyFollowing);

// GET /api/users/followers - Get users that follow current user
router.get("/followers", getMyFollowers);

// GET /api/users/stats - Get follow stats for current user
router.get("/stats", getStats);

// GET /api/users/search - Find users by name or username (excludes current user)
router.get("/search", search);

module.exports = router;
