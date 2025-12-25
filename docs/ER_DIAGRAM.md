# Entity Relationship Diagram

## Database Schema Description

### Entities and Attributes

#### 1. users
- **Primary Key:** id (SERIAL)
- **Unique Constraints:**
  - username (VARCHAR(30))
  - email (VARCHAR(255))
- **Attributes:**
  - password_hash (VARCHAR(255), NOT NULL)
  - full_name (VARCHAR(100), NOT NULL)
  - is_deleted (BOOLEAN, DEFAULT FALSE)
  - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP, AUTO-UPDATED)

#### 2. posts
- **Primary Key:** id (SERIAL)
- **Foreign Key:** user_id → users(id) ON DELETE CASCADE
- **Attributes:**
  - content (TEXT, nullable)
  - media_url (TEXT, nullable)
  - comments_enabled (BOOLEAN, DEFAULT TRUE)
  - scheduled_at (TIMESTAMP, nullable)
  - is_deleted (BOOLEAN, DEFAULT FALSE)
  - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP, AUTO-UPDATED)

#### 3. follows
- **Primary Key:** id (SERIAL)
- **Foreign Keys:**
  - follower_id → users(id) ON DELETE CASCADE
  - following_id → users(id) ON DELETE CASCADE
- **Unique Constraint:** (follower_id, following_id)
- **Check Constraint:** follower_id != following_id (prevents self-follow)
- **Attributes:**
  - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

#### 4. likes
- **Primary Key:** id (SERIAL)
- **Foreign Keys:**
  - user_id → users(id) ON DELETE CASCADE
  - post_id → posts(id) ON DELETE CASCADE
- **Unique Constraint:** (user_id, post_id) (one like per user per post)
- **Attributes:**
  - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

#### 5. comments
- **Primary Key:** id (SERIAL)
- **Foreign Keys:**
  - user_id → users(id) ON DELETE CASCADE
  - post_id → posts(id) ON DELETE CASCADE
- **Attributes:**
  - content (TEXT, NOT NULL)
  - is_deleted (BOOLEAN, DEFAULT FALSE)
  - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP, AUTO-UPDATED)

---

## Relationships

### One-to-Many Relationships

1. **users → posts**
   - One user can have many posts
   - Relationship: `users.id = posts.user_id`
   - Cascade delete: When a user is deleted, all their posts are deleted

2. **users → likes (as liker)**
   - One user can like many posts
   - Relationship: `users.id = likes.user_id`
   - Cascade delete: When a user is deleted, all their likes are deleted

3. **posts → likes**
   - One post can be liked by many users
   - Relationship: `posts.id = likes.post_id`
   - Cascade delete: When a post is deleted, all its likes are deleted

4. **users → comments (as commenter)**
   - One user can make many comments
   - Relationship: `users.id = comments.user_id`
   - Cascade delete: When a user is deleted, all their comments are deleted

5. **posts → comments**
   - One post can have many comments
   - Relationship: `posts.id = comments.post_id`
   - Cascade delete: When a post is deleted, all its comments are deleted

### Many-to-Many Relationships

1. **users → users (follows)**
   - Many users can follow many users
   - Self-referential relationship through `follows` table
   - Relationship: 
     - `users.id = follows.follower_id` (who follows)
     - `users.id = follows.following_id` (who is followed)
   - Constraints:
     - Unique pair (follower_id, following_id) prevents duplicate follows
     - Check constraint prevents users from following themselves
   - Cascade delete: When a user is deleted, all follow relationships involving that user are deleted

---

## Indexes

### Performance Optimization Indexes

1. **users table:**
   - idx_users_username (on username)
   - idx_users_email (on email)
   - idx_users_full_name (on full_name) - for search

2. **posts table:**
   - idx_posts_user_id (on user_id)
   - idx_posts_created_at (on created_at DESC) - for chronological ordering
   - idx_posts_scheduled_at (on scheduled_at, partial WHERE scheduled_at IS NOT NULL) - for scheduled posts query
   - idx_posts_is_deleted (on is_deleted) - for filtering active posts

3. **follows table:**
   - idx_follows_follower_id (on follower_id) - for getting who a user follows
   - idx_follows_following_id (on following_id) - for getting a user's followers
   - idx_follows_created_at (on created_at DESC) - for chronological ordering

4. **likes table:**
   - idx_likes_user_id (on user_id) - for getting user's liked posts
   - idx_likes_post_id (on post_id) - for getting post's likes
   - idx_likes_created_at (on created_at DESC) - for chronological ordering

5. **comments table:**
   - idx_comments_user_id (on user_id) - for getting user's comments
   - idx_comments_post_id (on post_id) - for getting post's comments
   - idx_comments_created_at (on created_at DESC) - for chronological ordering
   - idx_comments_is_deleted (on is_deleted) - for filtering active comments

---

## Data Integrity Rules

1. **Users:**
   - Username and email must be unique
   - Password must be hashed before storage
   - Soft deletion (is_deleted flag)

2. **Posts:**
   - Must have at least one of: content or media_url
   - Scheduled posts must have scheduled_at > NOW() when created
   - Soft deletion (is_deleted flag)

3. **Follows:**
   - Cannot follow yourself (enforced by CHECK constraint)
   - Cannot follow the same user twice (enforced by UNIQUE constraint)

4. **Likes:**
   - One like per user per post (enforced by UNIQUE constraint)
   - Cannot like deleted posts (enforced at application level)

5. **Comments:**
   - Cannot comment on posts with comments_enabled = false (enforced at application level)
   - Cannot comment on deleted posts (enforced at application level)
   - Soft deletion (is_deleted flag)

---

## Visual Representation (ASCII)

```
┌─────────────┐
│    users    │
├─────────────┤
│ id (PK)     │
│ username (U)│
│ email (U)   │
│ password    │
│ full_name   │
│ is_deleted  │
│ created_at  │
│ updated_at  │
└─────┬───────┘
      │
      │ 1:N
      │
      ├─────────────────────────────────────────────┐
      │                                             │
      │                                             │
┌─────▼───────┐                          ┌─────────▼─────┐
│   posts     │                          │   comments    │
├─────────────┤                          ├───────────────┤
│ id (PK)     │                          │ id (PK)       │
│ user_id (FK)├──────────────────────────┤ user_id (FK)  │
│ content     │                          │ post_id (FK)  │
│ media_url   │                          │ content       │
│ comments_   │                          │ is_deleted    │
│   enabled   │                          │ created_at    │
│ scheduled_  │                          │ updated_at    │
│   at        │                          └───────────────┘
│ is_deleted  │
│ created_at  │
│ updated_at  │
└─────┬───────┘
      │
      │ 1:N
      │
┌─────▼───────┐
│    likes    │
├─────────────┤
│ id (PK)     │
│ user_id (FK)├─────────┐
│ post_id (FK)│         │
│ created_at  │         │
│ UNIQUE(user,│         │
│        post)│         │
└─────────────┘         │
                        │
┌───────────────────────▼─────────┐
│          follows                │
├──────────────────────────────────┤
│ id (PK)                         │
│ follower_id (FK) → users(id)    │
│ following_id (FK) → users(id)   │
│ created_at                      │
│ UNIQUE(follower, following)     │
│ CHECK(follower != following)    │
└──────────────────────────────────┘
```

---

## Notes

- All foreign keys use ON DELETE CASCADE to maintain referential integrity
- Soft deletion is used for users, posts, and comments to preserve data history
- Timestamps are automatically maintained via triggers
- All indexes are designed to optimize common query patterns (user lookups, chronological ordering, filtering)
- The schema supports the scheduled posting feature through the `scheduled_at` field and partial index

