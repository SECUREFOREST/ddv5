
# 🛠️ Cursor Playbook: Rebuilding OneSubmissiveAct.com

This playbook helps you migrate and modernize the original minified JavaScript code from OneSubmissiveAct.com into a structured, React-based codebase using Cursor.

---

## 1. Extract Core Real-Time Client (Faye)

**Prompt**:
> Extract the Faye client logic from this bundle into a separate `fayeClient.js` module using ES6 exports. Make sure it includes initialization, handshake, connect, disconnect, subscribe, and publish methods, and uses modern async/await if possible.

---

## 2. Extract Consent Flow Logic

**Prompt**:
> Extract all consent session–related logic (including state transitions, session/channel management, real-time syncing) into a hook called `useConsentSession.js`. Export it as a React hook that can be used in `<ConsentSession />`.

---

## 3. Scaffold React Component Folder Structure

**Prompt**:
> Create a component folder structure for React, with the following components:
```
components/
├── ConsentSession/
│   ├── ConsentIntro.jsx
│   ├── ConsentOptionToggle.jsx
│   └── ConsentMatchStatus.jsx
├── DailyGame/
│   ├── PromptDisplay.jsx
│   ├── AcceptRejectButtons.jsx
│   ├── CountdownTimer.jsx
│   └── PerformTracker.jsx
├── ActSubmission/
│   ├── DifficultySelector.jsx
│   ├── ActTextInput.jsx
├── ActivityFeed/
│   ├── FeedItem.jsx
├── JournalEntry.jsx
├── ChartRadarView.jsx
├── LandingPage.jsx
├── AdminPanel/
│   ├── ActModerationQueue.jsx
│   ├── ApproveRejectButtons.jsx
│   └── RejectedList.jsx
```

---

## 4. Refactor Activity Feed to use Stream API

**Prompt**:
> Refactor activity feed logic into a file called `useStreamFeed.js`. It should include methods like `addActivity()`, `getFeedItems()`, and `followFeed()`. Use the official Stream JavaScript client.

---

## 5. Refactor Chart Rendering to Component

**Prompt**:
> Move canvas-based radar chart rendering logic into a React component called `ChartRadarView.jsx`. Use the existing canvas API logic, but place it inside a `useEffect` hook that runs after mount, drawing onto a `<canvas>` ref.

---

## 6. Create Hooks from Game Logic

**Prompt**:
> Create a custom hook `useDailyAct.js` that handles:
- loading today's act
- subscribing to updates
- tracking whether the user accepted or completed the act
- starting a countdown if applicable

Return `{ act, accepted, completed, timeLeft, accept(), reject() }`.

---

## 7. Refactor Session and Link Handling

**Prompt**:
> Extract anonymous session and partner invite logic into a hook called `useSessionManager.js`. It should:
- generate or retrieve a unique user/session ID from localStorage
- support generating shareable links with the session ID in the URL
- expose current session info

---

## 8. Set Up Routing

**Prompt**:
> Create a routing structure using React Router:
```
/                   → <LandingPage />
/consent            → <ConsentSession />
/play               → <DailyGame />
/submit             → <ActSubmission />
/feed               → <ActivityFeed />
/journal            → <JournalEntry />
/admin              → <AdminPanel />
/profile/chart      → <ChartRadarView />
```

Each route should render the respective component. Wrap routes in a layout if needed.

---

## 9. Modernize Imports & Remove Obsolete Code

**Prompt**:
> Remove all legacy polyfills, module systems (like `__webpack_require__`, `module.exports`), and replace with modern `import/export` syntax. Convert the file to clean ES6 modules.

---

## 10. Split Bundle into Modules

**Prompt**:
> Split this large bundle into modular files based on functionality:
- `fayeClient.js`
- `dispatcher.js`
- `transports/*.js`
- `streamClient.js`
- `chartRenderer.js`
- `consentManager.js`
- `actPublisher.js`

Use named exports, clean types, and remove unused code paths.
