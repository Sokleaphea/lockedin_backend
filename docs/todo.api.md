# Tasks API Documentation

Base URL (local): `http://localhost:3000`

All endpoints are prefixed with `/api`.

## Data Model (Task)

```json
{
  "taskId": "uuid-string",
  "userId": "string",
  "title": "string",
  "description": "string",
  "status": "pending" | "completed",
  "dueDate": "2026-02-03T00:00:00.000Z",
  "createdAt": "2026-02-03T12:00:00.000Z",
  "updatedAt": "2026-02-03T12:00:00.000Z"
}
```

> `taskId` is auto-generated on creation.

---

## 1) Create Task

**POST** `/api/tasks`

### Request Body

```json
{
  "userId": "user-123",
  "title": "Finish report",
  "description": "Write the final report",
  "status": "pending",
  "dueDate": "2026-02-10"
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "title": "Finish report",
    "description": "Write the final report",
    "status": "pending",
    "dueDate": "2026-02-10"
  }'
```

### Success Response (201)

```json
{
  "_id": "65c0f...",
  "taskId": "c2e9f2f8-2e3a-4f6b-9a54-1d1a0a90f0b5",
  "userId": "user-123",
  "title": "Finish report",
  "description": "Write the final report",
  "status": "pending",
  "dueDate": "2026-02-10T00:00:00.000Z",
  "createdAt": "2026-02-03T12:00:00.000Z",
  "updatedAt": "2026-02-03T12:00:00.000Z",
  "__v": 0
}
```

---

## 2) Get All Tasks

**GET** `/api/tasks`

### cURL

```bash
curl http://localhost:3000/api/tasks
```

### Success Response (200)

```json
[
  {
    "_id": "65c0f...",
    "taskId": "c2e9f2f8-2e3a-4f6b-9a54-1d1a0a90f0b5",
    "userId": "user-123",
    "title": "Finish report",
    "description": "Write the final report",
    "status": "pending",
    "dueDate": "2026-02-10T00:00:00.000Z",
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z",
    "__v": 0
  }
]
```

---

## 3) Get Tasks by User

**GET** `/api/tasks?userId=<ID>`

### cURL

```bash
curl "http://localhost:3000/api/tasks?userId=user-123"
```

### Success Response (200)

```json
[
  {
    "_id": "65c0f...",
    "taskId": "c2e9f2f8-2e3a-4f6b-9a54-1d1a0a90f0b5",
    "userId": "user-123",
    "title": "Finish report",
    "description": "Write the final report",
    "status": "pending",
    "dueDate": "2026-02-10T00:00:00.000Z",
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z",
    "__v": 0
  }
]
```

---

## 4) Update Task (by taskId)

**PUT** `/api/tasks/<ID>`

### Request Body

```json
{
  "title": "Finish report (updated)",
  "status": "completed"
}
```

### cURL

```bash
curl -X PUT http://localhost:3000/api/tasks/c2e9f2f8-2e3a-4f6b-9a54-1d1a0a90f0b5 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Finish report (updated)",
    "status": "completed"
  }'
```

### Success Response (200)

```json
{
  "_id": "65c0f...",
  "taskId": "c2e9f2f8-2e3a-4f6b-9a54-1d1a0a90f0b5",
  "userId": "user-123",
  "title": "Finish report (updated)",
  "description": "Write the final report",
  "status": "completed",
  "dueDate": "2026-02-10T00:00:00.000Z",
  "createdAt": "2026-02-03T12:00:00.000Z",
  "updatedAt": "2026-02-03T12:30:00.000Z",
  "__v": 0
}
```

---

## 5) Delete Task (by taskId)

**DELETE** `/api/tasks/<ID>`

### cURL

```bash
curl -X DELETE http://localhost:3000/api/tasks/c2e9f2f8-2e3a-4f6b-9a54-1d1a0a90f0b5 \
  -H "Content-Type: application/json"
```

### Success Response (200)

```json
{
  "message": "Todo deleted"
}
```

---

## Error Responses

- 400: Validation errors (empty `title`, invalid `status`, invalid `dueDate`)
- 404: Task not found
- 500: Server error
