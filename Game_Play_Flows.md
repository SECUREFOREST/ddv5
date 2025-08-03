# Deviant Dare App – Game Play Flows

## Overview

This document details the complete gameplay mechanics, rules, and user interactions for the Deviant Dare app. The app features two main gameplay modes: **Dare Challenges** and **Switch Games**, each with their own unique mechanics and progression systems.

---

## 1. Dare Challenge Gameplay

### A. Difficulty Levels & Progression

#### Difficulty Tiers
1. **Titillating** 🌟
   - Description: Fun, flirty, and easy. For beginners or light play.
   - Risk Level: Low
   - Content: Mild, playful challenges
   - Target Audience: New users, casual players

2. **Arousing** 🔥
   - Description: A bit more daring, but still approachable.
   - Risk Level: Low-Medium
   - Content: More intimate but safe challenges
   - Target Audience: Intermediate users

3. **Explicit** 💧
   - Description: Sexually explicit or more intense.
   - Risk Level: Medium
   - Content: Adult-oriented challenges
   - Target Audience: Experienced users

4. **Edgy** ⚠️
   - Description: Pushes boundaries, not for the faint of heart.
   - Risk Level: Medium-High
   - Content: Boundary-pushing challenges
   - Target Audience: Advanced users

5. **Hardcore** 🚀
   - Description: Extreme, risky, or very advanced.
   - Risk Level: High
   - Content: Extreme challenges
   - Target Audience: Expert users only

### B. Dare Creation Flow

#### Step-by-Step Process:
1. **User clicks "Create Dare"**
2. **Form Completion:**
   - Description (5-500 characters, required)
   - Difficulty selection (required)
   - Tags (optional)
   - Public/Private setting
   - Claimable option (creates shareable link)
3. **Validation:**
   - Client-side: Length, required fields
   - Server-side: Content validation, user limits
4. **Creation:**
   - Dare saved to database
   - Status: "waiting_for_participant"
   - If claimable: Unique claim token generated
5. **Post-Creation:**
   - Success notification
   - Redirect to share page (if claimable)
   - Activity logged

### C. Dare Performance Flow

#### Random Dare Selection:
1. **User selects difficulty level**
2. **System filters available dares:**
   - Excludes user's own dares
   - Excludes previously completed/consented dares
   - Excludes blocked users' dares
   - Respects user limits and cooldowns
3. **Random selection from filtered pool**
4. **Dare assignment to user**

#### Consent & Performance:
1. **User reviews dare details**
2. **Consent confirmation required**
3. **Performance phase begins**
4. **Proof submission required**

### D. Proof Submission System

#### Accepted File Types:
- **Images:** JPEG, PNG, GIF, WebP
- **Videos:** MP4, WebM, QuickTime
- **Text:** Up to 1000 characters
- **Max File Size:** 10MB

#### Submission Process:
1. **User uploads proof file and/or text**
2. **Client-side validation:**
   - File type checking
   - File size validation
   - Text length validation
3. **Server-side processing:**
   - File stored securely
   - Proof linked to dare
   - Status updated to "completed"
4. **Post-submission:**
   - Creator notified
   - Proof expires in 48 hours
   - Grading phase begins

### E. Grading System

#### Grade Scale: 1-10
- **1-3:** Poor performance
- **4-6:** Average performance
- **7-8:** Good performance
- **9-10:** Excellent performance

#### Grading Process:
1. **Creator or assigned reviewer reviews proof**
2. **Grade submission (1-10)**
3. **Optional feedback (up to 500 characters)**
4. **Duplicate grade prevention**
5. **Blocked user checks**
6. **Grade saved to dare record**

---

## 2. Switch Game Gameplay

### A. Game Overview

Switch Games combine dare challenges with Rock-Paper-Scissors mechanics, creating competitive gameplay where losers must perform dares.

### B. Game Creation Flow

#### Step-by-Step Process:
1. **User clicks "Create Switch Game"**
2. **Form Completion:**
   - Description (5-500 characters, required)
   - Difficulty selection (required)
   - Initial move selection (rock/paper/scissors, required)
   - Public/Private setting
   - Tags (optional)
3. **Validation & Creation:**
   - Game saved with "waiting_for_participant" status
   - Creator's dare and move recorded
   - Game appears in public games list

### C. Game Joining Flow

#### Participant Selection:
1. **User browses available switch games**
2. **Game selection criteria:**
   - Public games only
   - Not already joined
   - Not blocked by either user
   - Within user limits and cooldowns
3. **Join form completion:**
   - Difficulty selection
   - Move selection (rock/paper/scissors)
   - Consent confirmation
4. **Game assignment:**
   - Random dare assigned to participant
   - Game status: "in_progress"

### D. Rock-Paper-Scissors Mechanics

#### Move Submission:
1. **Both players submit moves simultaneously**
2. **Move validation:**
   - Rock, Paper, or Scissors only
   - One submission per player
   - No move changes after submission
3. **Winner determination:**
   - Rock beats Scissors
   - Scissors beats Paper
   - Paper beats Rock
   - Same moves = Draw (replay required)

#### Game Resolution:
1. **Winner determined automatically**
2. **Loser identified**
3. **Game status: "awaiting_proof"**
4. **Proof deadline: 48 hours**
5. **Loser must submit proof**

### E. Switch Game Proof System

#### Proof Requirements:
- **File upload:** Images or videos
- **Text description:** Optional
- **Deadline:** 48 hours from game resolution
- **Loser only:** Winner cannot submit proof

#### Proof Submission:
1. **Loser uploads proof file**
2. **Optional text description**
3. **File validation (same as dare proof)**
4. **Proof linked to game**
5. **Game status: "proof_submitted"**

### F. Switch Game Grading

#### Grading Process:
1. **Winner reviews proof**
2. **Grade submission (1-10)**
3. **Optional feedback**
4. **Game completion**
5. **Activity logging**

---

## 3. Advanced Gameplay Features

### A. Claimable Dares

#### Creation Process:
1. **User creates claimable dare**
2. **Unique claim token generated**
3. **Shareable link created**
4. **Link shared via external channels**

#### Claim Process:
1. **Recipient visits claim link**
2. **Dare details displayed**
3. **Creator stats shown**
4. **Consent confirmation**
5. **Dare assigned to claimant**

### B. Privacy & Safety Features

#### Content Expiration:
- **When viewed:** Delete after first view
- **30 days:** Auto-delete after 30 days
- **Never:** Permanent storage (not recommended)

#### User Blocking:
- **Blocked users cannot interact**
- **No dares between blocked users**
- **No switch games between blocked users**
- **No grading between blocked users**

#### Content Moderation:
- **File type validation**
- **Size limits enforcement**
- **Report system for inappropriate content**
- **Admin review capabilities**

### C. Cooldown & Limit Systems

#### User Limits:
- **Open dares limit:** Prevents overload
- **Cooldown periods:** Between dare acceptances
- **Daily limits:** Prevents spam

#### Enforcement:
- **Automatic checking before actions**
- **User-friendly error messages**
- **Graceful degradation**

---

## 4. Gameplay Rules & Constraints

### A. User Interaction Rules

#### Blocking System:
- Users can block/unblock others
- Blocked users cannot interact in any way
- Blocking is mutual and permanent until unblocked

#### Privacy Controls:
- Users can set content deletion preferences
- Proof files have expiration dates
- Users control their own content visibility

### B. Content Guidelines

#### Allowed Content:
- Adult-oriented but consensual
- No illegal activities
- No non-consensual content
- Respect user limits and boundaries

#### File Requirements:
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM, QuickTime
- Maximum size: 10MB
- Content validation on upload

### C. Fair Play Rules

#### Anti-Cheating Measures:
- One submission per user per dare/game
- No self-performance of own dares
- No duplicate grading
- Random selection prevents gaming

#### Quality Control:
- Minimum description length requirements
- Difficulty level validation
- Proof quality assessment through grading
- Community feedback system

---

## 5. User Experience Flow

### A. New User Onboarding

1. **Registration with preferences**
2. **Difficulty level selection**
3. **First dare experience**
4. **Tutorial elements**
5. **Community introduction**

### B. Progressive Difficulty

1. **Start with Titillating level**
2. **Gradual progression through levels**
3. **User comfort assessment**
4. **Boundary exploration**
5. **Advanced features unlock**

### C. Social Features

1. **Leaderboard participation**
2. **Activity feed engagement**
3. **Profile customization**
4. **Community interaction**
5. **Reputation building**

---

## 6. Technical Implementation

### A. Real-time Features

#### WebSocket Integration:
- Live notifications
- Real-time game updates
- Instant feedback
- Connection management

#### Polling Fallback:
- Graceful degradation
- Offline support
- Sync on reconnection

### B. Data Management

#### User Data:
- Profile information
- Game history
- Preferences and limits
- Privacy settings

#### Game Data:
- Dare and game records
- Proof files and metadata
- Grading and feedback
- Activity logs

### C. Security & Privacy

#### Authentication:
- JWT token system
- Refresh token rotation
- Secure session management

#### Content Security:
- File upload validation
- Secure storage
- Access control
- Privacy protection

---

## 7. Game Balance & Economy

### A. Risk vs. Reward

#### Difficulty Scaling:
- Higher difficulty = higher risk
- Better grades = better reputation
- Community recognition
- Achievement system

#### User Progression:
- Experience points (implied)
- Skill development
- Comfort zone expansion
- Community standing

### B. Community Dynamics

#### Reputation System:
- Grade averages
- Completion rates
- Community feedback
- Trust indicators

#### Social Features:
- Leaderboards
- Activity feeds
- User profiles
- Community interaction

---

This gameplay flow document provides a comprehensive overview of all game mechanics, rules, and user interactions in the Deviant Dare app. The system is designed to be engaging, safe, and progressively challenging while maintaining user privacy and community standards. 