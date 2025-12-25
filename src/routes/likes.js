const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  like,
  unlike,
  getPostLikesList,
  getUserLikes,
} = require("../controllers/likes");

const router = express.Router();

/**
 * Likes routes
 */

// All routes require authentication
router.use(authenticateToken);

// POST /api/likes/:post_id - Like a post
router.post("/:post_id", like);

// DELETE /api/likes/:post_id - Unlike a post
router.delete("/:post_id", unlike);

// GET /api/likes/post/:post_id - Get likes for a post
router.get("/post/:post_id", getPostLikesList);

// GET /api/likes/user - Get posts liked by current user
router.get("/user", getUserLikes);

module.exports = router;
