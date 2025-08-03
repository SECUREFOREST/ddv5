
# OneSubmissiveAct App – Functionality & Flow

## Consent Flow and Session Matching

- The app has **two modes (Sub vs. Dom)**. In “Sub” mode a user offers themselves to receive an order; in “Dom” mode a user creates an order/task for a submissive to perform. Each session (order) is identified by a unique ID (e.g. in the URL) and synced across clients in real time.
- **User options** include three text fields: *nickname*, *description of the act*, and a list of *hard limits* (things the user will not do). The UI blocks all other communication to enforce consent: all interaction happens through structured fields and buttons.
- **Session initiation:** A session is created when a user accepts an entry. Real-time logic ensures both parties see the current state instantly. Only one Sub can accept a Dom’s offer; others are blocked until it’s returned.
- **Rejecting an act** returns it to the available pool so another user can accept it.

## Game Logic (Daily Act, Delivery, Countdown)

- **Daily submissive act:** A new task is revealed daily. This is likely automated and may be tied to the server date.
- **Real-time delivery:** Acts appear live for users based on the time and role (Dom/Sub). Acts are removed from the list once accepted.
- **Accept/Reject:** Submissives accept tasks to agree to perform them. Rejecting frees the task for others.
- **Countdown timer:** A timer may limit how long a task must be completed. If not completed in time, the task is removed.
- **Feedback:** After completion, the system may display confirmation, encouragement, or log a record.

## Admin / Moderation

- **Submission Queue:** Users can submit their own act suggestions. These are added to a moderation queue.
- **Approve/Reject:** Admins approve good suggestions or reject inappropriate ones.
- **Publishing:** Approved acts may be scheduled or shown immediately in the app.

## Journal and Feedback

- **Post-act journaling:** Users can write reflections after completing a task.
- **Storage:** Entries are saved per user. May be private or part of an activity feed.
- **Activity feed:** A social or profile feed may show recent completions and journal excerpts.

## Radar Chart / Canvas Visualization

- **Consent Profile Chart:** A spider/radar chart shows user preferences or act performance categories.
- **Visual Axes:** May include “Pain,” “Exhibitionism,” “Intensity,” etc.
- **Chart updates:** Updates dynamically based on user acts or consent form values.
- **Canvas API:** Likely rendered using HTML5 canvas and JavaScript drawing code.

## Inferred UI Elements and Text

- **Modes:** "Sub" and "Dom" toggle.
- **Fields:** Nickname, Task Description, Hard Limits.
- **Buttons:** “Accept Task”, “Reject Task”, “Submit Offer”, “Place Order”.
- **Timers:** “Time Remaining: 00:59”.
- **Messages:** “Task returned to pool”, “Task completed – thanks!”

## Sources

Behavior inferred from available user reports, blogs, and app logic.
