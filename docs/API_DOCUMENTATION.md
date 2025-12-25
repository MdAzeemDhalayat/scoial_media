# Social Media Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
- **Endpoint:** `POST /api/auth/register`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Login
- **Endpoint:** `POST /api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "password123"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Get Profile
- **Endpoint:** `GET /api/auth/profile`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

---

## User Endpoints

### Search Users
- **Endpoint:** `GET /api/users/search?q=search_term`
- **Auth Required:** Yes
- **Query Parameters:**
  - `q` (required): Search query (searches username, email, full_name)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 20)
- **Response (200):**
  ```json
  {
    "users": [
      {
        "id": 2,
        "username": "janedoe",
        "email": "jane@example.com",
        "full_name": "Jane Doe",
        "created_at": "2024-01-02T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  }
  ```

### Follow User
- **Endpoint:** `POST /api/users/:user_id/follow`
- **Auth Required:** Yes
- **Response (201):**
  ```json
  {
    "message": "User followed successfully",
    "follow": {
      "id": 1,
      "follower_id": 1,
      "following_id": 2,
      "created_at": "2024-01-03T00:00:00.000Z"
    },
    "follower_count": 5,
    "following_count": 10,
    "is_following": true
  }
  ```

### Unfollow User
- **Endpoint:** `DELETE /api/users/:user_id/follow`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "message": "User unfollowed successfully",
    "follower_count": 4,
    "following_count": 9,
    "is_following": false
  }
  ```

### Get Following
- **Endpoint:** `GET /api/users/following?page=1&limit=20`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "following": [
      {
        "id": 2,
        "username": "janedoe",
        "full_name": "Jane Doe",
        "created_at": "2024-01-02T00:00:00.000Z",
        "followed_at": "2024-01-03T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  }
  ```

### Get Followers
- **Endpoint:** `GET /api/users/followers?page=1&limit=20`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "followers": [
      {
        "id": 3,
        "username": "bobsmith",
        "full_name": "Bob Smith",
        "created_at": "2024-01-04T00:00:00.000Z",
        "followed_at": "2024-01-05T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  }
  ```

### Get Follow Stats
- **Endpoint:** `GET /api/users/stats`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "follower_count": 10,
    "following_count": 5
  }
  ```

---

## Post Endpoints

### Create Post
- **Endpoint:** `POST /api/posts`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "content": "This is my post content",
    "media_url": "https://example.com/image.jpg",
    "comments_enabled": true,
    "scheduled_at": "2024-12-25T12:00:00Z"
  }
  ```
  - `content` (optional): Text content
  - `media_url` (optional): URL to media
  - `comments_enabled` (optional, default: true): Whether comments are enabled
  - `scheduled_at` (optional): ISO 8601 datetime for scheduled posting (must be in future)
  - Note: At least one of `content` or `media_url` must be provided
- **Response (201):**
  ```json
  {
    "message": "Post created successfully",
    "post": {
      "id": 1,
      "user_id": 1,
      "content": "This is my post content",
      "media_url": "https://example.com/image.jpg",
      "comments_enabled": true,
      "scheduled_at": null,
      "created_at": "2024-01-06T00:00:00.000Z",
      "username": "johndoe",
      "full_name": "John Doe",
      "like_count": 0,
      "comment_count": 0
    }
  }
  ```

### Get Feed
- **Endpoint:** `GET /api/posts/feed?page=1&limit=20`
- **Auth Required:** Yes
- **Description:** Returns posts from users you follow plus your own posts
- **Response (200):**
  ```json
  {
    "posts": [
      {
        "id": 1,
        "user_id": 2,
        "content": "Post content",
        "media_url": null,
        "comments_enabled": true,
        "scheduled_at": null,
        "created_at": "2024-01-06T00:00:00.000Z",
        "username": "janedoe",
        "full_name": "Jane Doe",
        "like_count": 5,
        "comment_count": 3,
        "is_liked": false,
        "is_following": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  }
  ```

### Get My Posts
- **Endpoint:** `GET /api/posts/my?page=1&limit=20`
- **Auth Required:** Yes
- **Response (200):** Same format as feed endpoint

### Get Post by ID
- **Endpoint:** `GET /api/posts/:post_id`
- **Auth Required:** Optional (more data if authenticated)
- **Response (200):**
  ```json
  {
    "post": {
      "id": 1,
      "user_id": 1,
      "content": "Post content",
      "media_url": null,
      "comments_enabled": true,
      "created_at": "2024-01-06T00:00:00.000Z",
      "username": "johndoe",
      "full_name": "John Doe",
      "like_count": 10,
      "comment_count": 5,
      "is_liked": true,
      "is_following": false
    }
  }
  ```

### Get User Posts
- **Endpoint:** `GET /api/posts/user/:user_id?page=1&limit=20`
- **Auth Required:** Optional
- **Response (200):** Same format as feed endpoint

### Delete Post
- **Endpoint:** `DELETE /api/posts/:post_id`
- **Auth Required:** Yes (must be post owner)
- **Response (200):**
  ```json
  {
    "message": "Post deleted successfully"
  }
  ```

---

## Like Endpoints

### Like Post
- **Endpoint:** `POST /api/likes/:post_id`
- **Auth Required:** Yes
- **Response (201):**
  ```json
  {
    "message": "Post liked successfully",
    "like": {
      "id": 1,
      "user_id": 1,
      "post_id": 5,
      "created_at": "2024-01-07T00:00:00.000Z"
    },
    "like_count": 6
  }
  ```

### Unlike Post
- **Endpoint:** `DELETE /api/likes/:post_id`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "message": "Post unliked successfully",
    "like_count": 5
  }
  ```

### Get Post Likes
- **Endpoint:** `GET /api/likes/post/:post_id?page=1&limit=20`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "likes": [
      {
        "id": 1,
        "username": "johndoe",
        "full_name": "John Doe",
        "liked_at": "2024-01-07T00:00:00.000Z"
      }
    ],
    "like_count": 10,
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  }
  ```

### Get User Liked Posts
- **Endpoint:** `GET /api/likes/user?page=1&limit=20`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "posts": [
      {
        "id": 5,
        "user_id": 2,
        "content": "Liked post",
        "created_at": "2024-01-06T00:00:00.000Z",
        "username": "janedoe",
        "full_name": "Jane Doe",
        "liked_at": "2024-01-07T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  }
  ```

---

## Comment Endpoints

### Create Comment
- **Endpoint:** `POST /api/comments/:post_id`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "content": "This is a comment"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "Comment created successfully",
    "comment": {
      "id": 1,
      "user_id": 1,
      "post_id": 5,
      "content": "This is a comment",
      "created_at": "2024-01-08T00:00:00.000Z"
    },
    "comment_count": 6
  }
  ```

### Update Comment
- **Endpoint:** `PUT /api/comments/:comment_id`
- **Auth Required:** Yes (must be comment owner)
- **Request Body:**
  ```json
  {
    "content": "Updated comment content"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Comment updated successfully",
    "comment": {
      "id": 1,
      "user_id": 1,
      "post_id": 5,
      "content": "Updated comment content",
      "updated_at": "2024-01-08T01:00:00.000Z"
    }
  }
  ```

### Delete Comment
- **Endpoint:** `DELETE /api/comments/:comment_id`
- **Auth Required:** Yes (must be comment owner)
- **Response (200):**
  ```json
  {
    "message": "Comment deleted successfully",
    "comment_count": 5
  }
  ```

### Get Post Comments
- **Endpoint:** `GET /api/comments/post/:post_id?page=1&limit=20`
- **Auth Required:** Optional
- **Response (200):**
  ```json
  {
    "comments": [
      {
        "id": 1,
        "user_id": 1,
        "post_id": 5,
        "content": "Comment content",
        "created_at": "2024-01-08T00:00:00.000Z",
        "username": "johndoe",
        "full_name": "John Doe"
      }
    ],
    "comment_count": 10,
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  }
  ```

---

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request:** Validation errors or invalid input
  ```json
  {
    "error": "Validation failed",
    "details": ["username is required"]
  }
  ```

- **401 Unauthorized:** Missing or invalid authentication
  ```json
  {
    "error": "Access token required"
  }
  ```

- **403 Forbidden:** Insufficient permissions
  ```json
  {
    "error": "You can only edit your own comments"
  }
  ```

- **404 Not Found:** Resource not found
  ```json
  {
    "error": "Post not found"
  }
  ```

- **500 Internal Server Error:** Server error
  ```json
  {
    "error": "Internal server error"
  }
  ```

---

## Notes

1. **JWT Tokens:** Tokens expire after 24 hours. Users must re-authenticate after expiration.
2. **Pagination:** All list endpoints support pagination with `page` and `limit` query parameters.
3. **Scheduled Posts:** Posts with `scheduled_at` are automatically published when the scheduled time is reached (checked every minute).
4. **Soft Deletes:** Posts and comments use soft deletes (marked as deleted but not removed from database).
5. **Search:** User search excludes the current user from results.

