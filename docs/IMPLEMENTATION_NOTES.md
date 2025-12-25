# Implementation Notes

This document describes the bugs found and fixed, features completed, and bonus features implemented in the social media backend codebase.

---

## Bugs Found and Fixed

### 1. JWT Token Verification Bug
**Location:** `src/utils/jwt.js`
**Issue:** The `verifyToken` function was incorrectly using `jwt.verify(token, token)` instead of `jwt.verify(token, process.env.JWT_SECRET)`. Also, it wasn't handling the "Bearer " prefix properly.
**Fix:** Updated to properly extract the token from the Authorization header and verify it against the JWT_SECRET.

### 2. Authentication Middleware Order Bug
**Location:** `src/middleware/auth.js`
**Issue:** The code was calling `verifyToken` before checking if `authHeader` exists, causing errors when no header was provided.
**Fix:** Reordered the checks to validate the header exists before attempting token verification.

### 3. Password Hashing Bug
**Location:** `src/models/user.js`
**Issue:** The `createUser` function was inserting the plain text password instead of the hashed password.
**Fix:** Changed to use `hashedPassword` variable instead of `password` in the INSERT statement.

### 4. Post Creation Bug
**Location:** `src/models/post.js`
**Issue:** Posts were being created with `is_deleted = true` instead of `false`, making them immediately invisible.
**Fix:** Changed the default value to `false`.

### 5. Post Deletion Bug
**Location:** `src/models/post.js`
**Issue:** The `deletePost` function was setting `is_deleted = false` instead of `true`, failing to mark posts as deleted.
**Fix:** Changed to set `is_deleted = true` for soft deletion.

### 6. Get My Posts Bug
**Location:** `src/controllers/posts.js`
**Issue:** The function was trying to read `user_id` from `req.params` instead of using `req.user.id`.
**Fix:** Changed to use `req.user.id` directly.

### 7. Missing is_deleted Filter
**Location:** `src/models/user.js`, `src/models/post.js`
**Issue:** Queries were not filtering out soft-deleted records.
**Fix:** Added `is_deleted = false` conditions to all relevant queries.

### 8. Post Content Validation
**Location:** `src/utils/validation.js`
**Issue:** Content was required, but requirements stated it should be optional (posts can have only media_url).
**Fix:** Made content optional and added validation to require at least one of content or media_url.

---

## Features Completed

### 1. Authentication ✅
- User registration with unique username and email
- Password hashing using bcrypt
- JWT token generation on login/register
- Token expiry (24 hours)
- Centralized authentication middleware
- Profile endpoint

### 2. User Profile & Search ✅
- User profile creation
- User login
- User search by name, username, or email
- Search excludes the logged-in user
- Pagination support

### 3. Follow / Unfollow Users ✅
- Follow functionality
- Unfollow functionality
- Prevention of self-following
- Prevention of duplicate follows (unique constraint)
- Follower and following counts
- Follow status in responses
- Get following list
- Get followers list
- Follow stats endpoint

### 4. Posts / Content ✅
- Create posts with optional text and media_url
- Posts with `comments_enabled` flag
- Only post owners can delete their posts
- Posts belong to users (foreign key constraint)
- Soft deletion for posts
- Pagination support
- Get posts by user ID
- Get current user's posts

### 5. Content Feed ✅
- Feed shows posts from followed users
- Feed includes own posts
- Feed is unique per user
- Sorted by newest first
- Each post includes `like_count` and `comment_count`
- Pagination support
- Scheduled posts are filtered (only shown when time is reached)

### 6. Likes ✅
- Users can like posts
- Each user can like a post only once (unique constraint)
- Users can unlike posts
- Like counts are always correct
- Get likes for a post
- Get posts liked by a user

### 7. Comments ✅
- Users can comment on posts
- Users can edit their own comments only
- Users can delete their own comments only
- Comments are blocked when `comments_enabled = false`
- CRUD APIs for comments
- Get comments per post with pagination
- Soft deletion for comments

### 8. Database Schema ✅
- Complete schema with all required tables:
  - users
  - posts
  - follows
  - likes
  - comments
- Proper primary keys
- Foreign keys with ON DELETE CASCADE
- Indexes for performance optimization:
  - User indexes (username, email, full_name)
  - Post indexes (user_id, created_at, scheduled_at, is_deleted)
  - Follow indexes (follower_id, following_id, created_at)
  - Like indexes (user_id, post_id, created_at)
  - Comment indexes (user_id, post_id, created_at, is_deleted)
- Data integrity constraints (unique constraints, check constraints)
- Timestamp triggers for updated_at fields

---

## Bonus Features Implemented

### 1. Scheduled Posting (HIGH PRIORITY BONUS) ✅
**Implementation:**
- Added `scheduled_at` field to posts table
- Validation to ensure scheduled time is in the future
- Background job scheduler that runs every 60 seconds
- Scheduler checks for posts where `scheduled_at <= NOW()` and publishes them
- Published posts have `scheduled_at` set to NULL
- Feed and post queries automatically filter out unpublished scheduled posts
- Scheduler starts automatically when the server starts

**Files:**
- `src/utils/scheduler.js` - Background job scheduler
- `src/models/post.js` - Added `publishScheduledPosts` function
- `src/app.js` - Starts scheduler on server startup
- `sql/schema.sql` - Added `scheduled_at` column and index

### 2. Deployment Readiness ✅
**Implementation:**
- Environment variables for all configuration:
  - PORT
  - NODE_ENV
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - JWT_SECRET
  - LOG_LEVEL
- Created `.env.example` file with all required variables
- Production-ready error handling
- Security middleware (helmet, cors)
- Health check endpoint (`GET /health`)
- Graceful error handling and logging

### 3. Additional Enhancements ✅
- Like/comment counts included in all post responses
- Follow status included in user responses
- Post enrichment with user-specific data (is_liked, is_following)
- Comprehensive API documentation
- Proper HTTP status codes
- Meaningful error messages
- Input validation using Joi
- Pagination support on all list endpoints

---

## Code Quality Improvements

1. **Architecture:** Clean separation of routes → controllers → models
2. **Error Handling:** Centralized error handling with meaningful messages
3. **Logging:** Structured logging with different verbosity levels
4. **Validation:** Input validation using Joi schemas
5. **Database:** Proper use of transactions where needed, connection pooling
6. **Security:** Password hashing, JWT authentication, SQL injection prevention (parameterized queries)
7. **Performance:** Database indexes on frequently queried columns
8. **Documentation:** Comprehensive API documentation and code comments

---

## Database Design

### Entity Relationship Diagram (Text Description)

```
users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── password_hash
├── full_name
├── is_deleted
├── created_at
└── updated_at

posts
├── id (PK)
├── user_id (FK → users.id)
├── content (nullable)
├── media_url (nullable)
├── comments_enabled
├── scheduled_at (nullable)
├── is_deleted
├── created_at
└── updated_at

follows
├── id (PK)
├── follower_id (FK → users.id)
├── following_id (FK → users.id)
├── created_at
└── UNIQUE(follower_id, following_id)
└── CHECK (follower_id != following_id)

likes
├── id (PK)
├── user_id (FK → users.id)
├── post_id (FK → posts.id)
├── created_at
└── UNIQUE(user_id, post_id)

comments
├── id (PK)
├── user_id (FK → users.id)
├── post_id (FK → posts.id)
├── content
├── is_deleted
├── created_at
└── updated_at
```

### Relationships:
- Users have many Posts (1:N)
- Users have many Follows as follower (1:N)
- Users have many Follows as following (1:N)
- Posts have many Likes (1:N)
- Users have many Likes (1:N)
- Posts have many Comments (1:N)
- Users have many Comments (1:N)

All foreign keys use ON DELETE CASCADE to maintain referential integrity.

---

## Testing Recommendations

1. Test all authentication flows (register, login, token expiry)
2. Test follow/unfollow edge cases (self-follow, duplicate follow)
3. Test scheduled posting with various future dates
4. Test feed algorithm (followed users + own posts)
5. Test comment blocking when comments_enabled = false
6. Test authorization (users can only delete their own posts/comments)
7. Test pagination on all list endpoints
8. Test search functionality with various queries
9. Test soft deletion (posts/comments should not appear after deletion)
10. Test like/unlike duplicate prevention

---

## Future Enhancements (Not Implemented)

- GraphQL API (optional advanced bonus)
- Post editing functionality
- Image upload (currently only supports media URLs)
- Email verification
- Password reset functionality
- Rate limiting
- Caching layer
- Real-time notifications
- Post reactions (beyond likes)
- Hashtag support
- Mention support

---

## Deployment Instructions

1. Set up PostgreSQL database
2. Copy `.env.example` to `.env` and fill in values
3. Run `npm install`
4. Run `npm run setup:db` to create tables
5. Run `npm start` for production or `npm run dev` for development
6. The server will start on the PORT specified in `.env`
7. The scheduler for scheduled posts runs automatically

For production deployment (Render/Railway/Heroku):
- Set environment variables in the platform's dashboard
- Ensure PostgreSQL database is provisioned
- The platform will run `npm start` automatically
- Database migrations are handled by the setup script

