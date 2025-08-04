# Missing API Functionality Analysis

## Frontend API Calls vs Backend Routes

### ✅ **Fully Supported APIs:**
- **Dares API** - All endpoints implemented
- **Auth API** - All endpoints implemented  
- **Users API** - All endpoints implemented
- **Switches API** - All endpoints implemented
- **Stats API** - All endpoints implemented
- **Notifications API** - All endpoints implemented
- **Activity Feed API** - All endpoints implemented
- **Comments API** - All endpoints implemented
- **Safety API** - All endpoints implemented
- **Reports API** - All endpoints implemented
- **Appeals API** - All endpoints implemented
- **Bulk API** - All endpoints implemented
- **Audit Log API** - All endpoints implemented

### ❌ **Missing or Incomplete APIs:**

#### 1. **Missing `/chicken-out` endpoint for dares**
- **Frontend calls**: `POST /dares/:id/chicken-out`
- **Status**: Missing
- **Used in**: DareReveal.jsx, DareParticipant.jsx

#### 2. **Missing `/reject` endpoint for dares**
- **Frontend calls**: `POST /dares/:id/reject`
- **Status**: Missing
- **Used in**: DareDetails.jsx

#### 3. **Missing `/appeal` endpoint for dares**
- **Frontend calls**: `POST /dares/:id/appeal`
- **Status**: Missing
- **Used in**: DareDetails.jsx

#### 4. **Missing `/moderate` endpoint for comments**
- **Frontend calls**: `POST /comments/:id/moderate`
- **Status**: Implemented but needs verification

#### 5. **Missing `/proof-review` endpoint for switches**
- **Frontend calls**: `POST /switches/:id/proof-review`
- **Status**: Implemented but needs verification

#### 6. **Missing `/proof-viewed` endpoint for switches**
- **Frontend calls**: `PATCH /switches/:id/proof-viewed`
- **Status**: Implemented but needs verification

#### 7. **Missing `/move` endpoint for switches**
- **Frontend calls**: `POST /switches/:id/move`
- **Status**: Implemented but needs verification

#### 8. **Missing `/grade` endpoint for switches**
- **Frontend calls**: `POST /switches/:id/grade`
- **Status**: Implemented but needs verification

#### 9. **Missing `/forfeit` endpoint for switches**
- **Frontend calls**: `POST /switches/:id/forfeit`
- **Status**: Implemented but needs verification

#### 10. **Missing `/join` endpoint for switches**
- **Frontend calls**: `POST /switches/:id/join`
- **Status**: Implemented but needs verification

#### 11. **Missing `/blocks/:userId/:action` endpoint**
- **Frontend calls**: `POST /users/blocks/:userId/:action`
- **Status**: Implemented but needs verification

#### 12. **Missing `/avatar` endpoint for users**
- **Frontend calls**: `POST /users/:id/avatar`
- **Status**: Implemented but needs verification

#### 13. **Missing `/user/slots` endpoint**
- **Frontend calls**: `GET /users/user/slots`
- **Status**: Implemented but needs verification

#### 14. **Missing `/subs` endpoint**
- **Frontend calls**: `POST /users/subs`
- **Status**: Implemented but needs verification

#### 15. **Missing `/content_deletion` endpoints**
- **Frontend calls**: `GET /safety/content_deletion`, `POST /safety/content_deletion`
- **Status**: Implemented but needs verification

#### 16. **Missing `/associates` endpoint**
- **Frontend calls**: `GET /users/associates`
- **Status**: Implemented but needs verification

#### 17. **Missing `/me` endpoint**
- **Frontend calls**: `GET /users/me`
- **Status**: Implemented but needs verification

#### 18. **Missing `/user_settings` endpoints**
- **Frontend calls**: `GET /users/user_settings`, `POST /users/user_settings`
- **Status**: Missing

#### 19. **Missing `/refresh-token` endpoint**
- **Frontend calls**: `POST /auth/refresh-token`
- **Status**: Implemented but needs verification

#### 20. **Missing `/change-password` endpoint**
- **Frontend calls**: `POST /auth/change-password`
- **Status**: Implemented but needs verification

#### 21. **Missing `/request-reset` endpoint**
- **Frontend calls**: `POST /auth/request-reset`
- **Status**: Implemented but needs verification

#### 22. **Missing `/reset-password` endpoint**
- **Frontend calls**: `POST /auth/reset-password`
- **Status**: Implemented but needs verification

## Priority Fixes Needed:

### High Priority (Critical Missing):
1. **`/dares/:id/chicken-out`** - Used in multiple pages
2. **`/dares/:id/reject`** - Used in DareDetails.jsx
3. **`/dares/:id/appeal`** - Used in DareDetails.jsx
4. **`/users/user_settings`** - Used in Profile.jsx

### Medium Priority:
1. **`/switches/:id/proof-review`** - Used in SwitchGameDetails.jsx
2. **`/switches/:id/proof-viewed`** - Used in SwitchGameDetails.jsx
3. **`/switches/:id/move`** - Used in SwitchGameDetails.jsx
4. **`/switches/:id/grade`** - Used in SwitchGameDetails.jsx
5. **`/switches/:id/forfeit`** - Used in SwitchGameParticipate.jsx
6. **`/switches/:id/join`** - Used in SwitchGameParticipate.jsx

### Low Priority (Already Implemented):
- Most other endpoints are already implemented but may need verification

## Next Steps:
1. Add missing high-priority endpoints
2. Verify existing endpoints match frontend expectations
3. Test all endpoints with frontend integration
4. Update documentation 