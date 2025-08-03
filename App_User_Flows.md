# Deviant Dare App – User Flows

## 1. Onboarding Flow (Registration & First Login)

1. User visits the app and clicks “Register.”
2. User fills out registration form (username, full name, email, password, DOB, gender, interests, limits).
3. Form is validated on the client (required fields, password strength, etc.).
4. Client sends POST `/auth/register` with user data.
5. Server validates input and creates user if valid.
6. Server responds with `{ accessToken, refreshToken, user }`.
7. Client stores tokens and user info in AuthContext/localStorage.
8. User is redirected to the dashboard.
9. Dashboard loads user stats, dares, switch games, and activity feed.
10. User is ready to explore the app (create dares, join games, etc.).

---

## 2. Dare Flow (Create, Share, Perform, Grade)

### A. Creating a Dare
1. User clicks “Create Dare.”
2. User fills out dare form (description, difficulty, tags, public/private, claimable).
3. Form is validated (length, required fields).
4. Client sends POST `/dares` (or `/dares/claimable` if claimable).
5. Server creates dare and responds with dare object (and `claimLink` if claimable).
6. Client shows confirmation and, if claimable, displays/shareable link.

### B. Sharing a Dare
1. User copies the claim link or shares it directly.
2. Recipient visits the claim link.
3. Client fetches dare details via `/dares/claim/:token`.
4. Recipient consents to perform the dare.
5. Client sends POST `/dares/claim/:token` to claim the dare.
6. Recipient is redirected to perform the dare.

### C. Performing a Dare
1. User visits a dare page (assigned or claimed).
2. User reads instructions and performs the dare.
3. User submits proof (file upload, text, etc.).
4. Client sends proof to server via `/dares/:id/proof`.
5. Server stores proof and updates dare status.

### D. Grading a Dare
1. Dare creator or assigned reviewer is notified when proof is submitted.
2. Reviewer visits the dare page and reviews the proof.
3. Reviewer submits a grade and feedback via `/dares/:id/grade`.
4. Server updates dare status and notifies the performer.

---

## 3. Switch Game Flow (Create, Join, Play, Grade)

### A. Creating a Switch Game
1. User clicks “Create Switch Game.”
2. User fills out game form (description, difficulty, move: rock/paper/scissors, tags, public/private).
3. Form is validated.
4. Client sends POST `/switches`.
5. Server creates game and responds with game object.
6. Game appears in public/joinable games list.

### B. Joining a Switch Game
1. User browses public switch games.
2. User selects a game to join.
3. User fills out join form (difficulty, move, consent).
4. Client sends POST `/switches/:id/join`.
5. Server assigns user as participant and matches a dare for them.
6. Game status updates to “in progress.”

### C. Playing the Game
1. Both users see their assigned dares and moves.
2. Game logic determines winner/loser (rock/paper/scissors).
3. Loser is prompted to submit proof for their dare.
4. Client sends proof to server via `/switches/:id/proof`.
5. Server stores proof and updates game status.

### D. Grading the Game
1. Winner/creator reviews proof and submits grade/feedback via `/switches/:id/grade`.
2. Server updates game status and notifies both users.
3. Game appears in history for both users.

---

## 4. Notifications Flow

1. User logs in and loads notifications page.
2. Client sends GET `/notifications`.
3. Server returns array of notifications (with sender info).
4. User sees notification list and can mark as read (PUT `/notifications/:id/read`).
5. Real-time notifications are pushed via WebSocket and appear instantly in the UI.

---

## 5. Profile Flow

1. User visits their profile or another user’s profile page.
2. Client sends GET `/users/:id` and `/stats/users/:id`.
3. Server returns user info and stats.
4. User can edit their own profile (PATCH `/users/:id`).
5. User can block/unblock others (POST `/users/:id/block` or `/users/:id/unblock`).
6. User can view their dares, switch games, and activity history.

---

## 6. Leaderboard Flow

1. User visits the leaderboard page.
2. Client sends GET `/stats/leaderboard`.
3. Server returns array of top users with stats.
4. User can search/filter the leaderboard.

---

## 7. Activity Feed Flow

1. User visits the activity feed page.
2. Client sends GET `/activity-feed/activities`.
3. Server returns array of recent activities.
4. User can search/filter activities.

---

## 8. Error Handling Flow

1. Any API error (network, validation, server) is caught by the client.
2. Error is displayed as a toast or inline message in the UI.
3. User can retry or correct input as needed. 