const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const {
  create,
  update,
  remove,
  getPostCommentsList,
} = require("../controllers/comments");
const { validateRequest, createCommentSchema, updateCommentSchema } = require("../utils/validation");

const router = express.Router();

/**
 * Comments routes
 */

// POST /api/comments/:post_id - Create a comment on a post (protected)
router.post("/:post_id", authenticateToken, validateRequest(createCommentSchema), create);

// PUT /api/comments/:comment_id - Update a comment (protected)
router.put("/:comment_id", authenticateToken, validateRequest(updateCommentSchema), update);

// DELETE /api/comments/:comment_id - Delete a comment (protected)
router.delete("/:comment_id", authenticateToken, remove);

// GET /api/comments/post/:post_id - Get comments for a post (public/optional auth)
router.get("/post/:post_id", optionalAuth, getPostCommentsList);

module.exports = router;
