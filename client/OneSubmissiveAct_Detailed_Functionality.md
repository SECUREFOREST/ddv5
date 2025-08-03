
# OneSubmissiveAct.com – Detailed Functional Breakdown

This document reverse-engineers and describes the full functionality and internal logic of OneSubmissiveAct.com based on analysis of the JavaScript bundle and supporting site materials.

---

## 🧭 Overview

OneSubmissiveAct.com is a real-time, minimalist erotic task app where users take the roles of either **Dom(me)** or **Sub(missive)**. Every day, the system releases a new task or allows Doms to propose acts. Subs choose whether to accept or reject these acts. The system focuses on strict boundaries, limited communication, and intentional power dynamics enforced through the app’s UI and real-time logic.

---

## 🧠 Consent Flow

### 👥 Roles

- **Submissive (Sub):** Offers themselves for an act.
- **Dominant (Dom):** Issues a command or act request.

### 🔄 Interaction Mechanics

1. **Session ID Generation:**
   - Every active user session is tied to a unique, ephemeral identifier (likely a UUID or hash).
   - Doms and Subs are listed in two real-time lists, synchronized via WebSocket or pub/sub.

2. **Structured Communication Only:**
   - Users fill out only these fields:
     - `Nickname` – displayed in the list.
     - `Task Description` – what is being requested or offered.
     - `Hard Limits` – non-negotiable boundaries (as a string or list).
   - No chat or messaging is permitted — this is intentional to create a structured, consent-based system.

3. **Consent Offer Listing:**
   - On the Dom side: entries appear as “Offers of Submission”.
   - On the Sub side: entries appear as “Orders”.

4. **Accept/Reject Flow:**
   - If a Sub accepts a Dom’s task:
     - A **session is locked** for both parties.
     - The item disappears from all other users' lists.
   - If rejected or canceled, it is returned to the public pool.

5. **Real-Time Synchronization:**
   - Underlying system uses:
     - Faye (or similar Bayeux protocol pub/sub transport).
     - Channels named by session ID or user role.
     - Session state (`offered`, `accepted`, `rejected`, `completed`) is broadcast to clients.

---

## 🎮 Daily Game Mechanics

### 🔁 Daily Act Flow

- The app either:
  - **Auto-generates** a new task daily,
  - Or uses the **approved pool** of submitted acts to randomly assign one.

### 🧾 Task Display and Handling

- When a daily act is revealed:
  - Subs receive a prompt: _“Today’s act: [task]”_
  - Buttons appear:
    - ✅ **Accept** – locks the act and begins performance tracking.
    - ❌ **Reject** – returns the act to the public pool.
- Once accepted:
  - A timer (if present) starts counting down.
  - The act is marked as “in progress”.

### ⏳ Timer & Deadline

- Acts may include a fixed performance window (e.g., 1 hour).
- Timer logic uses `setTimeout` or internal scheduler.
- If the timer ends:
  - The act is auto-failed or returned.
  - User may be notified: _“Time’s up – act expired.”_

### ✅ Completion

- The user can mark an act as completed.
- Optional journal or photo proof may be submitted.
- Completion is logged to the feed or personal profile.

---

## 🛠️ Admin & Moderation Panel

### ✍️ User-Submitted Acts

- Users can submit their own act ideas to the system.
- Submitted data:
  - `Act Text`
  - `Difficulty Level` (optional)
  - `Tags` or category markers

### 🧮 Review Queue

- Admins have access to a moderation queue:
  - View pending acts.
  - Approve or reject items.
- Moderators see:
  - Submission date
  - Author (if available)
  - Optional tags

### 🟢 Approve Flow

- Approved acts are added to:
  - The daily random pool
  - Specific categories or difficulty lists

### 🔴 Reject Flow

- Rejected items are removed from the system.
- No notification is required to the submitting user.

---

## 📓 Journal & Feedback System

### 🧾 Post-Act Journaling

- After completing an act, the Sub is prompted:
  - _“How did this make you feel?”_
  - Freeform journal input (Markdown/plaintext)
  - Optionally upload photo proof

### 🗂️ Storage

- Journal entries are stored:
  - Linked to user ID/session
  - Tagged by act performed and date
- Visible only to the user (by default)

### 🌐 Feed Sharing

- Option to post journal entry (or excerpt) to:
  - A public feed
  - A shared session thread (if both parties consent)

---

## 📊 Radar Chart / Canvas-Based Profile Visual

### 📌 Purpose

- To visualize the user's performance, preferences, or consent parameters in a **radar/spider chart**.

### 🧬 Dimensions

Each axis could represent:

- Pain tolerance
- Psychological vulnerability
- Exposure/exhibition
- Physical exertion
- Submission frequency
- Consent limits (filled vs. capped)

### 🧱 Implementation

- Built with HTML5 `<canvas>`
- Chart logic includes:
  - `ctx.moveTo(x, y)` / `ctx.lineTo(x, y)`
  - Circular grid lines
  - Polygon fill area (user values)

### 🔄 Updates

- Dynamically updates when:
  - User modifies consent form
  - New acts are completed
  - Admin changes preference categories

---

## 💬 Inferred UI Text and Flow

| UI Element | Label/Text |
|------------|------------|
| **Mode Toggle** | “I am a Dom” / “I am a Sub” |
| **Form Fields** | “Nickname”, “Describe the task”, “Hard Limits” |
| **Action Buttons** | “Submit Offer”, “Place Order”, “Accept”, “Reject”, “I'm Done”, “Write Reflection” |
| **Session Text** | “This task has already been claimed.” / “You are now matched with a Dom/Sub.” |
| **Feedback Prompts** | “What was your experience?” / “Time remaining: [countdown]” |
| **Timer/Status** | “Active”, “Pending”, “Completed”, “Expired” |

---

## 📡 Real-Time Architecture (Technical Summary)

- Likely built with:
  - **Faye or Bayeux protocol**
  - JSON message envelopes:
    - `{ channel: "/session/xyz", data: { type: "accepted", user: "abc" } }`
  - Client reconnects and resubscribes to session channels
  - Abstracts transport across:
    - WebSocket
    - EventSource (SSE)
    - Long Polling

---

## ✅ Summary of Application Flow

1. User chooses a mode (Dom/Sub)
2. User submits a form (offer or order)
3. The act appears in real-time to other users
4. One user accepts, locking the session
5. Timer starts (optional)
6. Act is performed and marked complete
7. User journals about the experience
8. Data feeds charts, profiles, or feeds

---

This document serves as a functional spec and rebuild guide for anyone replicating or expanding on the original OneSubmissiveAct experience.
