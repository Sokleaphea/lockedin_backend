# AI Task Breakdown Feature


## What it can do

- Create a new breakdown from a goal.
- Refine an existing breakdown across multiple turns.
- Ask one clarification question if the goal is too vague.
- Return only strict JSON responses for predictable parsing.
- Persist chat sessions and messages for each user.

## Core behavior

- If the input is unrelated to task breakdown, it returns an unsupported response.
- If the goal is vague, it returns a clarification request.
- If the goal is clear, it returns a list of concrete steps.

## Chat status and response status

There are two related status concepts:

1) **AI response status** (returned in the response payload)
- `planned` means the AI returned a full step-by-step breakdown.
- `clarification_required` means the AI needs one focused answer before it can plan.
- `unsupported_request` means the input is outside task breakdown scope.

2) **Chat session status** (stored with the chat session)
- The chat session is updated when a valid AI response is produced.
- A planned response marks the session as complete for the current goal.
- A clarification response keeps the session open for the next user reply.

## API Endpoints

Base path: `/api/ai`

- `POST /task-breakdown/chat`
  - Starts a new chat or continues an existing chat when `chatId` is provided.
- `GET /chats`
  - Lists the current user's chat sessions.
- `GET /chats/:chatId`
  - Fetches one chat session and its messages.

All endpoints require a valid JWT in the `Authorization` header.

## Example API Tests

### 1) New goal (planned)

Request:

```
POST http://localhost:3000/api/ai/task-breakdown/chat
Authorization: Bearer <your_JWT_token>
Content-Type: application/json

{
  "message": "Build a personal finance tracker app"
}
```

Expected response shape:

```
{
  "chatId": "<id>",
  "response": {
    "status": "planned",
    "steps": [
      { "step": 1, "title": "...", "description": "..." }
    ]
  }
}
```

### 2) Refinement (existing chat)

Request:

```
POST http://localhost:3000/api/ai/task-breakdown/chat
Authorization: Bearer <your_JWT_token>
Content-Type: application/json

{
  "chatId": "<id>",
  "message": "Add a step for setting up CI/CD"
}
```

Expected response shape:

```
{
  "chatId": "<id>",
  "response": {
    "status": "planned",
    "steps": [
      { "step": 1, "title": "...", "description": "..." }
    ]
  }
}
```

### 3) Vague goal (clarification_required)

Request:

```
POST http://localhost:3000/api/ai/task-breakdown/chat
Authorization: Bearer <your_JWT_token>
Content-Type: application/json

{
  "message": "I want to improve my life"
}
```

Expected response shape:

```
{
  "chatId": "<id>",
  "response": {
    "status": "clarification_required",
    "steps": [],
    "clarification_question": "..."
  }
}
```

### 4) Unrelated input (unsupported_request)

Request:

```
POST http://localhost:3000/api/ai/task-breakdown/chat
Authorization: Bearer <your_JWT_token>
Content-Type: application/json

{
  "message": "Tell me a joke"
}
```

Expected response shape:

```
{
  "chatId": "<id>",
  "response": {
    "status": "unsupported_request"
  }
}
```
