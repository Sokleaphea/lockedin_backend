# 📚 Book Summary Features API Documentation

## Overview

The Book Summary feature integrates with the **Gutendex API** (free public domain books) to provide:
- 📖 Book search and discovery
- ⭐ User favorites management
- 💬 Book reviews and ratings

---

## Base URL

```
http://localhost:5000/api/books
```

---

## Features

### 1. **Book Discovery**
- Search books by title, author, or topic
- Filter by categories
- Access to 70,000+ free public domain books

### 2. **Favorites System**
- Add/remove books to personal favorites
- View all favorite books
- Prevent duplicate favorites

### 3. **Review & Rating System**
- Rate books (1-5 stars)
- Write detailed feedback
- Submit multiple reviews for the same book
- Update/delete your own reviews
- View all reviews for any book

---

## API Endpoints

### 📖 Books Endpoints

#### 1. Get All Books

**Public** - No authentication required

```http
GET /api/books
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search by title or author |
| `category` | string | No | Filter by topic/subject |

**Example Requests:**

```bash
# Get all books
GET http://localhost:5000/api/books

# Search for books by author/title
GET http://localhost:5000/api/books?search=dickens

# Filter by category
GET http://localhost:5000/api/books?category=science

# Combined search and category
GET http://localhost:5000/api/books?search=biology&category=science
```

**Response Example:**

```json
[
  {
    "id": 84,
    "title": "Frankenstein; Or, The Modern Prometheus",
    "authors": ["Shelley, Mary Wollstonecraft"],
    "summary": "No summary available",
    "categories": [
      "Gothic fiction",
      "Science fiction",
      "Horror tales"
    ],
    "downloadCount": 65432,
    "formats": {
      "text/html": "https://www.gutenberg.org/ebooks/84.html.images",
      "application/epub+zip": "https://www.gutenberg.org/ebooks/84.epub.images",
      "text/plain": "https://www.gutenberg.org/files/84/84-0.txt"
    }
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error
- `503` - Gutendex API unavailable

---

#### 2. Get Book Categories

**Public** - No authentication required

```http
GET /api/books/categories
```

**Description:**
Returns a deduplicated, alphabetically sorted list of clean book genre categories, normalized from Gutendex subjects. Results are **cached for 1 hour** for fast response.

**Normalization Rules (applied server-side):**
| Raw Gutendex Subject | Result |
|---|---|
| `"Science fiction"` | ✅ Kept as-is |
| `"Gothic fiction"` | ✅ Kept as-is |
| `"London (England) -- Fiction"` | ❌ Removed (location-specific) |
| `"Ahab, Captain (Fictitious character) -- Fiction"` | ❌ Removed (character-specific) |
| `"France -- History -- Revolution -- Fiction"` | ✅ Normalized → `"France"` |
| `"Norwegian drama -- Translations into English"` | ✅ Normalized → `"Norwegian drama"` |
| `"Wagner, Richard, 1813-1883"` | ❌ Removed (person name) |

**Example Request:**

```bash
GET http://localhost:5000/api/books/categories
```

**Response Example:**

```json
[
  "Adventure stories",
  "Autobiographical fiction",
  "Children's stories",
  "Detective and mystery stories",
  "Fantasy fiction",
  "Gothic fiction",
  "Historical fiction",
  "Horror tales",
  "Romance fiction",
  "Science fiction",
  "War stories",
  "Young adult fiction"
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error
- `503` - Gutendex API unavailable

**Frontend Usage:**
Call this once on app load to populate category filter dropdowns. Then pass the selected value to `GET /api/books?category=<value>` to filter books.

---

### ⭐ Favorites Endpoints

#### 3. Add Book to Favorites

**Protected** - Requires authentication

```http
POST /api/books/favorites
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "bookId": 84
}
```

**Response:**

```json
{
  "message": "Book added to favorites"
}
```

**Status Codes:**
- `201` - Successfully added
- `400` - Invalid bookId or already in favorites
- `401` - Unauthorized

---

#### 4. Get User's Favorites

**Protected** - Requires authentication

```http
GET /api/books/favorites
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
[
  {
    "_id": "65f789abc123def456789012",
    "userId": "65a123def456789012345678",
    "bookId": 84,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "65f789abc123def456789013",
    "userId": "65a123def456789012345678",
    "bookId": 1342,
    "createdAt": "2024-01-14T09:20:00.000Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

#### 5. Remove Book from Favorites

**Protected** - Requires authentication

```http
DELETE /api/books/favorites/:bookId
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Example:**

```bash
DELETE http://localhost:5000/api/books/favorites/84
```

**Response:**

```json
{
  "message": "Book removed from favorites"
}
```

**Status Codes:**
- `200` - Successfully removed
- `400` - Invalid bookId
- `404` - Favorite not found
- `401` - Unauthorized

---

### 💬 Review Endpoints

#### 6. Get Reviews for a Book

**Public** - No authentication required

```http
GET /api/books/:bookId/reviews
```

**Example:**

```bash
GET http://localhost:5000/api/books/84/reviews
```

**Response:**

```json
[
  {
    "_id": "65f789abc123def456789014",
    "userId": {
      "_id": "65a123def456789012345678",
      "username": "johndoe",
      "displayName": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "bookId": 84,
    "rating": 5,
    "feedback": "A masterpiece of Gothic literature!",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `400` - Invalid bookId
- `500` - Server error

---

#### 7. Create a Review

**Protected** - Requires authentication

```http
POST /api/books/:bookId/reviews
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "rating": 5,
  "feedback": "A masterpiece of Gothic literature! Highly recommended."
}
```

**Example:**

```bash
POST http://localhost:5000/api/books/84/reviews
```

**Validation Rules:**
- `rating`: Required, number between 1-5
- `feedback`: Required, string

**Response:**

```json
{
  "_id": "65f789abc123def456789014",
  "userId": "65a123def456789012345678",
  "bookId": 84,
  "rating": 5,
  "feedback": "A masterpiece of Gothic literature! Highly recommended.",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes:**
- `201` - Review created
- `400` - Invalid input
- `401` - Unauthorized

---

#### 8. Update a Review

**Protected** - Requires authentication (only review owner)

```http
PATCH /api/books/:bookId/reviews
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (can update one or both fields):**

```json
{
  "rating": 4,
  "feedback": "Updated my review - still great but not perfect."
}
```

**Example:**

```bash
PATCH http://localhost:5000/api/books/84/reviews
```

**Response:**

```json
{
  "_id": "65f789abc123def456789014",
  "userId": "65a123def456789012345678",
  "bookId": 84,
  "rating": 4,
  "feedback": "Updated my review - still great but not perfect.",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:45:00.000Z"
}
```

**Status Codes:**
- `200` - Successfully updated
- `400` - Invalid input
- `404` - Review not found
- `401` - Unauthorized

**Note:**
Legacy endpoint `PATCH /api/books/reviews/:reviewId` is still supported for backward compatibility.

---

#### 9. Delete a Review

**Protected** - Requires authentication (only review owner)

```http
DELETE /api/books/reviews/:reviewId
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Example:**

```bash
DELETE http://localhost:5000/api/books/reviews/65f789abc123def456789014
```

**Response:**

```json
{
  "message": "BookReview deleted successfully"
}
```

**Status Codes:**
- `200` - Successfully deleted
- `403` - Not authorized (can only delete your own reviews)
- `404` - Review not found
- `401` - Unauthorized

---

## Testing Guide

### Prerequisites

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Get authentication token:**
   ```bash
   POST http://localhost:5000/api/auth/login
   Body: { "email": "user@example.com", "password": "password123" }
   ```

   Copy the `token` from the response.

---

### Thunder Client Test Examples

#### Test 1: Get Book Categories

1. Open Thunder Client in VS Code
2. **New Request**
3. **Method**: `GET`
4. **URL**: `http://localhost:5000/api/books/categories`
5. Click **Send**

**Expected Result:** Sorted array of clean genre names like `["Adventure stories", "Gothic fiction", "Science fiction", ...]`

---

#### Test 2: Search Books

1. Open Thunder Client in VS Code
2. **New Request**
3. **Method**: `GET`
4. **URL**: `http://localhost:5000/api/books?search=science`
5. Click **Send**

**Expected Result:** List of science-related books

---

#### Test 2: Add to Favorites

1. **New Request**
2. **Method**: `POST`
3. **URL**: `http://localhost:5000/api/books/favorites`
4. **Auth** tab → **Bearer Token** → Paste your token
5. **Body** tab → **JSON**:
   ```json
   {
     "bookId": 84
   }
   ```
6. Click **Send**

**Expected Result:** `201 Created` with success message

---

#### Test 4: Create Review

1. **New Request**
2. **Method**: `POST`
3. **URL**: `http://localhost:5000/api/books/84/reviews`
4. **Auth** tab → **Bearer Token** → Paste token
5. **Body** tab → **JSON**:
   ```json
   {
     "rating": 5,
     "feedback": "Absolutely brilliant! A must-read classic."
   }
   ```
6. Click **Send**

**Expected Result:** `201 Created` with review object (save the `_id` for next test)

---

#### Test 5: Update Review

1. **New Request**
2. **Method**: `PATCH`
3. **URL**: `http://localhost:5000/api/books/84/reviews`
4. **Auth** tab → **Bearer Token** → Paste token
5. **Body** tab → **JSON**:
   ```json
   {
     "rating": 4,
     "feedback": "Updated: Good book, but not perfect."
   }
   ```
6. Click **Send**

**Expected Result:** `200 OK` with updated review

---

#### Test 6: Get All Reviews for a Book

1. **New Request**
2. **Method**: `GET`
3. **URL**: `http://localhost:5000/api/books/84/reviews`
4. Click **Send** (no auth needed)

**Expected Result:** Array of all reviews for book 84

---

#### Test 7: Get My Favorites

1. **New Request**
2. **Method**: `GET`
3. **URL**: `http://localhost:5000/api/books/favorites`
4. **Auth** tab → **Bearer Token** → Paste token
5. Click **Send**

**Expected Result:** Array of your favorite books

---

#### Test 8: Delete Review

1. **New Request**
2. **Method**: `DELETE`
3. **URL**: `http://localhost:5000/api/books/reviews/{reviewId}`
4. **Auth** tab → **Bearer Token** → Paste token
5. Click **Send**

**Expected Result:** `200 OK` with success message

---

#### Test 9: Remove from Favorites

1. **New Request**
2. **Method**: `DELETE`
3. **URL**: `http://localhost:5000/api/books/favorites/84`
4. **Auth** tab → **Bearer Token** → Paste token
5. Click **Send**

**Expected Result:** `200 OK` with success message

---

### cURL Test Examples

```bash
# 1. Get book categories
curl http://localhost:5000/api/books/categories

# 2. Search books
curl "http://localhost:5000/api/books?search=dickens"

# 3. Filter books by category
curl "http://localhost:5000/api/books?category=Science%20fiction"

# 4. Get book reviews
curl http://localhost:5000/api/books/84/reviews

# 5. Add to favorites (replace YOUR_TOKEN)
curl -X POST http://localhost:5000/api/books/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId": 84}'

# 6. Create review
curl -X POST http://localhost:5000/api/books/84/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "feedback": "Amazing book!"}'

# 7. Update review by bookId
curl -X PATCH http://localhost:5000/api/books/84/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4, "feedback": "Updated review"}'

# 8. Delete review
curl -X DELETE http://localhost:5000/api/books/reviews/REVIEW_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 9. Get favorites
curl http://localhost:5000/api/books/favorites \
  -H "Authorization: Bearer YOUR_TOKEN"

# 10. Remove from favorites
curl -X DELETE http://localhost:5000/api/books/favorites/84 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Popular Test Book IDs

Use these Gutendex book IDs for testing:

| ID | Title | Author |
|----|-------|--------|
| 84 | Frankenstein | Mary Shelley |
| 1342 | Pride and Prejudice | Jane Austen |
| 11 | Alice's Adventures in Wonderland | Lewis Carroll |
| 1661 | The Adventures of Sherlock Holmes | Arthur Conan Doyle |
| 2701 | Moby Dick | Herman Melville |
| 98 | A Tale of Two Cities | Charles Dickens |

---

## Error Handling

### Common Errors

**400 Bad Request:**
```json
{
  "message": "Invalid bookId"
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "message": "You can only edit your own reviews"
}
```

**404 Not Found:**
```json
{
  "message": "Review not found"
}
```

**500 Server Error:**
```json
{
  "message": "Failed to fetch books"
}
```

**503 Service Unavailable:**
```json
{
  "message": "Book service is temporarily unavailable"
}
```

---

## Models

### BookFavorite Model

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  bookId: number,
  createdAt: Date
}
```

**Indexes:**
- `{ userId: 1, bookId: 1 }` - Unique (prevents duplicates)
- `{ userId: 1 }` - For fast user queries

---

### BookReview Model

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  bookId: number,
  rating: number (1-5),
  feedback: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1, bookId: 1 }` - Non-unique (supports user+book filtering)
- `{ userId: 1 }` - For user reviews
- `{ bookId: 1 }` - For book reviews

---

## Notes

- **Gutendex API** provides 70,000+ free public domain books
- Book data is **not stored** in the database (fetched from Gutendex)
- Only **favorites** and **reviews** are stored locally
- Reviews support **populate** to show user details
- All protected routes require **valid JWT token**
- Users can only update/delete their **own reviews**
- Users can leave **multiple reviews per book**

---

## Swagger Documentation

Access interactive API documentation at:

```
http://localhost:5000/api-docs
```

---

## Support

For issues or questions, check:
- Server logs for detailed error messages
- Gutendex API status: https://gutendex.com/
- MongoDB connection status

---

**Last Updated:** March 10, 2026
