# Sharp Mind AI Rep - App Flow (Mini Doc)

This is a concise overview of how the backend and frontend work together, plus the key runtime flows.

## High-level architecture

- **Frontend**: React + Vite + TypeScript.
- **Backend**: FastAPI + SQLAlchemy + Postgres (Supabase), Redis (Upstash), and WebSocket via Socket.IO.
- **Auth**: JWT (Bearer token).
- **Realtime**: Socket.IO on `/ws/alerts`.
- **Telephony**: Telnyx Call Control + WebSocket media streaming.
- **AI stack**: OpenAI (LLM + embeddings), Deepgram (STT), ElevenLabs (TTS).

## **Core** user flows

## User roles and ownership

- **Owner**: Creates and manages a single business, manages staff users, configures escalation rules, and accesses analytics for their business.
- **Staff**: Can view calls/customers for their assigned business, can request takeover, and receives escalation alerts.
- **Platform owner (global admin)**: Not implemented in the current codebase. There is no global admin role or endpoint to list all businesses.

**Can the app owner see the number of businesses subscribed?**  
Not currently. The backend only models **businesses per owner**, and there is no global admin role or API to aggregate all businesses. If you want that, we’d need:
- A new `admin`/`platform_owner` role
- A secure endpoint like `GET /api/v1/admin/businesses` (or a count endpoint)
- UI to display platform-wide metrics

### 1) Auth (login/register)
1. User signs in or registers in the frontend.
2. Frontend sends `POST /api/v1/auth/login` or `POST /api/v1/auth/register`.
3. Backend returns a JWT access token.
4. Frontend stores the token and calls `GET /api/v1/auth/me` to hydrate user context.
5. All future API requests include `Authorization: Bearer <token>`.

### 2) Business onboarding
1. Owner creates a business via `POST /api/v1/businesses`.
2. Backend links the owner to the business if they were not linked yet.
3. Business phone number is used to map incoming Telnyx calls to the business.

### 3) Knowledge base
1. Owner adds knowledge via `PUT /api/v1/businesses/{business_id}/knowledge`.
2. Backend chunks content, computes embeddings, and stores `knowledge_bases`.
3. UI loads categories via `GET /api/v1/businesses/{business_id}/knowledge`.

### 4) Calls and live monitoring
1. Telnyx sends inbound webhook to `POST /api/v1/calls/inbound`.
2. Backend verifies signature and creates a `Call` record.
3. Telnyx streams audio to `/api/v1/media/telnyx?call_id=...`.
4. STT (Deepgram) generates transcripts; LLM (OpenAI) generates responses.
5. TTS (ElevenLabs) returns audio for the caller.
6. Escalation rules can trigger real-time alerts and notifications.

### 5) Real-time escalations
1. Backend emits events via Socket.IO to `business:{id}` room.
2. Frontend listens for `escalation` events.
3. Operators can request takeover via Socket.IO `request_takeover`.

## Backend runtime flows (key services)

### Call handling (core flow)
- Entry point: `app/services/call_handler.py`
- Steps:
  - Create call record
  - Load customer profile
  - Start STT + TTS
  - Process turn-by-turn conversation
  - Save messages + summary + action points

### Escalation detection
- `app/services/escalation.py`:
  - Rule matching (keywords)
  - Sentiment/tone checks
  - LLM classification for sensitive calls

### Knowledge/RAG
- `app/services/rag.py`:
  - Query knowledge base with vector similarity
  - Provide context to LLM responses

### Notifications
- `app/services/notifications.py`:
  - WebSocket escalation
  - Optional SMS/email/push (Twilio/SendGrid/FCM)

## Frontend data flows

- **Axios client** adds JWT to all requests.
- **React Query** handles data fetching + caching.
- **Zustand store** stores token/user/theme.
- **Socket.IO client** connects with JWT and joins business room.

## Required configuration (local dev)

Backend `.env` (minimum):
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:8080`

Frontend `.env` (minimum):
- `VITE_API_BASE_URL=http://localhost:8000/api/v1`
- `VITE_SOCKET_URL=http://localhost:8000`
- `VITE_SOCKET_PATH=/ws/alerts/socket.io`

## Common endpoints

Auth:
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`

Business:
- `POST /api/v1/businesses`
- `GET /api/v1/businesses/{business_id}`

Knowledge:
- `PUT /api/v1/businesses/{business_id}/knowledge`
- `GET /api/v1/businesses/{business_id}/knowledge`

Calls:
- `GET /api/v1/calls`
- `GET /api/v1/calls/{call_id}`
- `POST /api/v1/calls/inbound`

Analytics:
- `GET /api/v1/analytics/summary`
- `GET /api/v1/analytics/series`

Users:
- `GET /api/v1/users`
- `POST /api/v1/users`
- `PUT /api/v1/users/{user_id}`
- `DELETE /api/v1/users/{user_id}`

## How to use the app (quick walkthrough)

1. Start backend and frontend.
2. Register an owner account.
3. Create a business (sets business_id).
4. Add knowledge base entries.
5. Configure Telnyx webhook + call your number.
6. Watch live calls and escalations in the UI.
