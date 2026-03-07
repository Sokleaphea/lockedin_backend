# Study Room API Documentation

## Overview
The Study Room feature allows users to create virtual study rooms, join existing rooms, and collaborate with other users. Rooms are automatically deleted 5 minutes after becoming empty.

**Base URL:** `/api/study-rooms`

**Authentication:** All endpoints require authentication via Bearer token in the Authorization header.

---

## Features
- Create study rooms with custom names
- Join active study rooms (max 10 participants)
- Leave study rooms
- Auto-deletion of empty rooms after 5 minutes

---

## API Endpoints

### 1. Get Active Rooms
Retrieve a list of all currently active study rooms.

**Endpoint:** `GET /api/study-rooms`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Thunder Client Example:**
```
Method: GET
URL: http://localhost:5000/api/study-rooms
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
[
  {
    "name": "Math Study Group",
    "roomId": "study-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "participantCount": 5
  },
  {
    "name": "CS Midterm Prep",
    "roomId": "study-f9e8d7c6-b5a4-3210-fedc-ba9876543210",
    "participantCount": 3
  }
]
```

**Response (500 Internal Server Error):**
```json
{
  "message": "Failed to fetch study rooms"
}
```

---

### 2. Create Room
Create a new study room. The creator is automatically added as the first participant.

**Endpoint:** `POST /api/study-rooms`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Physics Study Session"
}
```

**Thunder Client Example:**
```
Method: POST
URL: http://localhost:5000/api/study-rooms
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
Body (JSON):
  {
    "name": "Physics Study Session"
  }
```

**Response (201 Created):**
```json
{
  "name": "Physics Study Session",
  "roomId": "study-12345678-1234-1234-1234-123456789012",
  "participantCount": 1
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Room name is required"
}
```

**Response (500 Internal Server Error):**
```json
{
  "message": "Failed to create study room"
}
```

---

### 3. Join Room
Join an existing active study room. Users can only join rooms that are not full (max 10 participants).

**Endpoint:** `POST /api/study-rooms/:roomId/join`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `roomId` (string, required): The unique room identifier

**Thunder Client Example:**
```
Method: POST
URL: http://localhost:5000/api/study-rooms/study-12345678-1234-1234-1234-123456789012/join
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "roomId": "study-12345678-1234-1234-1234-123456789012",
  "participantCount": 4
}
```

**Response (404 Not Found):**
```json
{
  "message": "Room not found"
}
```

**Response (400 Bad Request - Room Full):**
```json
{
  "message": "Room is full (max 10 participants)"
}
```

**Response (500 Internal Server Error):**
```json
{
  "message": "Failed to join study room"
}
```

**Notes:**
- If a user is already in the room, they won't be added again
- Only active rooms can be joined
- Maximum 10 participants per room

---

### 4. Leave Room
Leave a study room. If the last participant leaves, the room is automatically marked as inactive.

**Endpoint:** `POST /api/study-rooms/:roomId/leave`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `roomId` (string, required): The unique room identifier

**Thunder Client Example:**
```
Method: POST
URL: http://localhost:5000/api/study-rooms/study-12345678-1234-1234-1234-123456789012/leave
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "message": "Successfully left the room"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Room not found"
}
```

**Response (500 Internal Server Error):**
```json
{
  "message": "Failed to leave study room"
}
```

**Notes:**
- When the last participant leaves, the room is marked as inactive and `closedAt` timestamp is set
- Inactive rooms are automatically deleted 5 minutes later

---

## Testing Workflow with Thunder Client

### Step 1: Authenticate
First, obtain a JWT token by logging in through the auth endpoint.

```
Method: POST
URL: http://localhost:5000/api/auth/login
Body (JSON):
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
```

Copy the token from the response and use it in all subsequent requests.

### Step 2: Create a Room
```
Method: POST
URL: http://localhost:5000/api/study-rooms
Headers:
  Authorization: Bearer <your_token>
  Content-Type: application/json
Body:
  {
    "name": "Deep Work Session"
  }
```

Save the `roomId` from the response.

### Step 3: Get Active Rooms
```
Method: GET
URL: http://localhost:5000/api/study-rooms
Headers:
  Authorization: Bearer <your_token>
```

### Step 4: Join a Room (with different user)
Login with a different user account to get a different token, then:

```
Method: POST
URL: http://localhost:5000/api/study-rooms/<roomId>/join
Headers:
  Authorization: Bearer <second_user_token>
```

### Step 5: Leave the Room
```
Method: POST
URL: http://localhost:5000/api/study-rooms/<roomId>/leave
Headers:
  Authorization: Bearer <your_token>
```

---

## Database Schema

### StudyRoom Model
```typescript
{
  _id: ObjectId,
  name: string,                    // Room name
  roomId: string,                  // Unique room identifier (UUID)
  creator: ObjectId,               // User who created the room
  participants: ObjectId[],        // Array of user IDs in the room
  isActive: boolean,               // Whether room is active
  closedAt: Date,                  // When the room was closed (optional)
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

---

## Automatic Cleanup

Empty rooms are automatically deleted from the database:
```
Schedule: Every 5 minutes
Condition: isActive = false AND closedAt < (now - 5 minutes)
Action: Delete room from database
```

**How it works:**
1. When the last participant leaves a room, it's immediately marked as `isActive: false` with `closedAt` timestamp
2. Every 5 minutes, a cleanup job runs and deletes rooms that have been inactive for more than 5 minutes
3. Users cannot join rooms that are marked as inactive

---

## Error Handling

### Common Error Codes
- **400 Bad Request**: Missing required fields or room is full
- **404 Not Found**: Room doesn't exist or is no longer active
- **500 Internal Server Error**: Database or server errors

### Authentication Errors
If the token is missing or invalid, you'll receive:
```json
{
  "message": "Unauthorized"
}
```

---

## Best Practices

1. **Always check room availability** before trying to join
2. **Handle the 404 error** gracefully - rooms may be auto-deleted
3. **Implement proper leave logic** when users exit the app
4. **Cache active rooms** and refresh periodically
5. **Handle the "room full" scenario** in your UI
6. **Use meaningful room names** to help users identify rooms

---

## Implementation Notes

- Room IDs are generated using UUID v4 with "study-" prefix
- Maximum 10 participants per room (enforced on join)
- Duplicate joins are prevented (same user can't join twice)
- Creator becomes the first participant automatically
- No explicit room deletion endpoint (handled by cleanup jobs)
- All routes require authentication middleware
