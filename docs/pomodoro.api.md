Pomodoro API Documentation
Base URL (local): http://localhost:3000
All endpoints are prefixed with /api/pomodoro
Data Model (PomodoroFocusSession)
{
  "_id": "mongodb-objectid",
  "userId": "mongodb-objectid",
  "durationSeconds": 1500,
  "completedAt": "2026-02-03T12:00:00.000Z"
}
durationSeconds: focus duration in seconds
Only focus sessions are persisted
Break / non-focus sessions are ignored
1) Create Pomodoro Session
POST /api/pomodoro/session
Request Body
{
  "type": "focus",
  "durationSeconds": 1500
}
type must be "focus" to be saved
durationSeconds must be a positive number
cURL
curl -X POST http://localhost:3000/api/pomodoro/session \
  -H "Content-Type: application/json" \
  -d '{
    "type": "focus",
    "durationSeconds": 1500
  }'
Success Response (200)
{
  "success": true,
  "message": "Session saved successfully"
}
Ignored Session Response (200)
{
  "success": true,
  "message": "Session ignored (not focus)"
}
Error Responses
400: Invalid duration
500: Server error
2) Get Pomodoro Stats
GET /api/pomodoro/stats
Returns total focus time and session count for:
daily
weekly
monthly
all-time
cURL
curl http://localhost:3000/api/pomodoro/stats
Success Response (200)
{
  "daily": {
    "totalSeconds": 3600,
    "sessions": 3
  },
  "weekly": {
    "totalSeconds": 7200,
    "sessions": 6
  },
  "monthly": {
    "totalSeconds": 14400,
    "sessions": 12
  },
  "allTime": {
    "totalSeconds": 20000,
    "sessions": 20
  }
}
3) Get Pomodoro Ranking
GET /api/pomodoro/ranking
Returns ranking of user + friends by total focus time (seconds).
cURL
curl http://localhost:3000/api/pomodoro/ranking
Success Response (200)
[
  {
    "_id": "64f000000000000000000002",
    "totalSeconds": 7200
  },
  {
    "_id": "64f000000000000000000001",
    "totalSeconds": 5400
  }
]
