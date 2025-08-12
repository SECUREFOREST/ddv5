# API Functionality Summary

## Dares API Endpoints

### GET Endpoints

#### `GET /api/dares`
- **Purpose**: List dares with filtering and pagination
- **Auth**: Required
- **Query Parameters**:
  - `id` - Get specific dare by ID
  - `status` - Filter by status (supports comma-separated values)
  - `difficulty` - Filter by difficulty
  - `public` - Filter by public/private status
  - `dareType` - Filter by dare type
  - `role` - Filter by allowed roles
  - `creator` - Filter by creator ID
  - `participant` - Filter by performer ID
  - `assignedSwitch` - Filter by assigned switch user ID
  - `search` - Search in description and title
  - `page` - Pagination page number
  - `limit` - Items per page
- **Response**: Paginated dares with metadata

#### `GET /api/dares/:id`
- **Purpose**: Get specific dare details
- **Auth**: Not required (public)
- **Response**: Dare with populated creator, performer, and assignedSwitch

#### `GET /api/dares/share/:id`
- **Purpose**: Get dare for sharing (public access)
- **Auth**: Not required
- **Response**: Public dare details

#### `GET /api/dares/claim/:token`
- **Purpose**: Get claimable dare by token
- **Auth**: Not required
- **Response**: Dare with creator stats and difficulty description

#### `GET /api/dares/random`
- **Purpose**: Get random available dare
- **Auth**: Required
- **Query Parameters**:
  - `difficulty` - Filter by difficulty
- **Features**: 
  - Excludes user's own dares
  - Excludes already consented/completed dares
  - Checks for blocked users
  - Enforces cooldown/open dare limits

#### `GET /api/dares/performer`
- **Purpose**: Get dares where user is performer
- **Auth**: Required
- **Query Parameters**:
  - `status` - Filter by status
- **Response**: Array of dares

#### `GET /api/dares/mine`
- **Purpose**: Get user's dares (as creator or performer)
- **Auth**: Required
- **Query Parameters**:
  - `status` - Filter by status (supports comma-separated values)
- **Response**: Array of dares

### POST Endpoints

#### `POST /api/dares`
- **Purpose**: Create new dare
- **Auth**: Required
- **Body Parameters**:
  - `description` (required) - Dare description
  - `difficulty` (required) - Difficulty level
  - `tags` (optional) - Array of tags
  - `dareType` (optional) - Type of dare
  - `public` (optional) - Public/private status
  - `allowedRoles` (optional) - Array of allowed roles
  - `contentDeletion` (optional) - Content deletion preference
- **Response**: Created dare

#### `POST /api/dares/claimable`
- **Purpose**: Create claimable dare
- **Auth**: Required
- **Body Parameters**:
  - `description` (required) - Dare description
  - `difficulty` (required) - Difficulty level
  - `tags` (optional) - Array of tags
  - `assignedSwitch` (optional) - Assigned switch user
  - `dareType` (optional) - Type of dare
  - `public` (optional) - Public/private status
  - `allowedRoles` (optional) - Array of allowed roles
  - `contentDeletion` (optional) - Content deletion preference
- **Response**: Created dare with claim link

#### `POST /api/dares/dom-demand`
- **Purpose**: Create dom demand with double-consent protection
- **Auth**: Required
- **Body Parameters**:
  - `description` (required) - Dare description
  - `difficulty` (required) - Difficulty level
  - `tags` (optional) - Array of tags
  - `public` (optional) - Public/private status
  - `requiresConsent` (optional) - Requires consent flag
  - `allowedRoles` (optional) - Array of allowed roles
  - `contentDeletion` (optional) - Content deletion preference
- **Response**: Created dom demand with claim link

#### `POST /api/dares/:id/accept`
- **Purpose**: Accept a dare (become performer)
- **Auth**: Required
- **Body Parameters**:
  - `difficulty` (optional) - Override difficulty
  - `consent` (required) - Consent confirmation
  - `contentDeletion` (optional) - Content deletion preference
- **Features**:
  - Validates consent
  - Checks for blocked users
  - Enforces cooldown/open dare limits
  - Updates dare status to 'in_progress'

#### `POST /api/dares/:id/proof`
- **Purpose**: Submit proof for completed dare
- **Auth**: Required
- **Body Parameters**:
  - `text` (optional) - Text proof
  - `expireAfterView` (optional) - Expiration setting
- **File Upload**: Single file (image/video/PDF, max 10MB)
- **Features**:
  - Sets proof expiration based on contentDeletion preference
  - Updates dare status to 'completed'

#### `POST /api/dares/:id/grade`
- **Purpose**: Grade a dare
- **Auth**: Required
- **Body Parameters**:
  - `grade` (required) - Grade (1-10)
  - `feedback` (optional) - Feedback text
  - `target` (optional) - Target user ID
- **Features**:
  - Prevents duplicate grades
  - Checks for blocked users
  - Sends notifications

#### `POST /api/dares/:id/forfeit` (Removed)
- **Purpose**: Chicken out of a dare (legacy endpoint - removed, use /chicken-out instead)
- **Status**: Endpoint removed from API
- **Use**: `/api/dares/:id/chicken-out` instead

#### `POST /api/dares/claim/:token`
- **Purpose**: Claim a dare by token
- **Auth**: Not required
- **Body Parameters**:
  - `demand` (required) - Claim demand
- **Response**: Updated dare

#### `POST /api/dares/:id/approve` (Admin)
- **Purpose**: Approve a dare
- **Auth**: Required (Admin)
- **Features**:
  - Updates status to 'approved'
  - Sends notifications

#### `POST /api/dares/:id/reject` (Admin)
- **Purpose**: Reject a dare
- **Auth**: Required (Admin)
- **Features**:
  - Updates status to 'rejected'
  - Sends notifications

#### `POST /api/dares/cleanup-expired` (Admin)
- **Purpose**: Clean up expired proofs
- **Auth**: Required (Admin)
- **Features**:
  - Removes expired proofs
  - Keeps dares intact

### PATCH Endpoints

#### `PATCH /api/dares/:id`
- **Purpose**: Update dare (creator only)
- **Auth**: Required
- **Body Parameters**:
  - `description` (optional) - Updated description
  - `difficulty` (optional) - Updated difficulty
  - `status` (optional) - Updated status
  - `tags` (optional) - Updated tags
  - `assignedSwitch` (optional) - Updated assigned switch
  - `dareType` (optional) - Updated dare type
  - `public` (optional) - Updated public status
  - `allowedRoles` (optional) - Updated allowed roles
  - `contentDeletion` (optional) - Updated content deletion preference

#### `PATCH /api/dares/:id/start`
- **Purpose**: Start a dare (accept and begin)
- **Auth**: Required
- **Body Parameters**:
  - `difficulty` (optional) - Difficulty override
- **Features**:
  - Assigns user as performer
  - Updates status to 'in_progress'

#### `PATCH /api/dares/:id/consent`
- **Purpose**: Record consent for dom demands
- **Auth**: Required
- **Body Parameters**:
  - `consented` (optional) - Boolean indicating if consent was given
  - `consentedAt` (optional) - Consent timestamp
- **Features**:
  - Only for dom demands requiring consent
  - Reveals full description after consent

### DELETE Endpoints

#### `DELETE /api/dares/:id`
- **Purpose**: Delete dare (creator or admin only)
- **Auth**: Required
- **Features**:
  - Sends notifications to involved users
  - Logs audit trail

## Data Models

### Dare Schema
```javascript
{
  description: String,
  creator: ObjectId (ref: 'User'),
  status: String (enum: ['completed', 'in_progress', 'graded', 'waiting_for_participant', 'chickened_out', 'approved', 'rejected', 'cancelled', 'user_deleted']),
  difficulty: String (enum: ['titillating', 'arousing', 'explicit', 'edgy', 'hardcore']),
  grades: [{
    user: ObjectId (ref: 'User'),
    target: ObjectId (ref: 'User'),
    grade: Number,
    feedback: String
  }],
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
  proof: {
    text: String,
    fileUrl: String,
    fileName: String
  },
  proofExpiresAt: Date,
  rejection: {
    reason: String,
    rejectedAt: Date,
    cooldownUntil: Date
  },
  public: Boolean,
  dareType: String (enum: ['submission', 'domination', 'switch']),
  allowedRoles: [String],
  performer: ObjectId (ref: 'User'),
  assignedSwitch: ObjectId (ref: 'User'),
  claimable: Boolean,
  claimToken: String,
  claimedBy: ObjectId (ref: 'User'),
  claimedAt: Date,
  claimDemand: String,
  requiresConsent: Boolean,
  consented: Boolean,
  consentedAt: Date,
  contentDeletion: String (enum: ['delete_after_view', 'delete_after_30_days', 'never_delete'])
}
```

## Supported Features

### Content Privacy (OSA-style)
- **delete_after_view**: Content expires after 1 hour
- **delete_after_30_days**: Content expires after 30 days
- **never_delete**: Content expires after 60 days (2 months)

### Difficulty Levels
- **titillating**: Fun, flirty, and easy
- **arousing**: A bit more daring, but still approachable
- **explicit**: Sexually explicit or more intense
- **edgy**: Pushes boundaries, not for the faint of heart
- **hardcore**: Extreme, risky, or very advanced

### Dare Types
- **submission**: Submission-based dares
- **domination**: Domination-based dares
- **switch**: Switch-based dares

### Status Values
- **waiting_for_participant**: Available for claiming
- **in_progress**: Currently being performed
- **completed**: Successfully completed
- **chickened_out**: Chickened out by performer (database status)
- **approved**: Approved by admin
- **rejected**: Rejected by admin
- **pending**: Pending approval
- **expired**: Expired
- **cancelled**: Cancelled
- **graded**: Graded
- **user_deleted**: User deleted

### Security Features
- User blocking system
- Cooldown enforcement (max 5 open dares)
- Content expiration based on privacy settings
- Double-consent protection for dom demands
- File upload validation and size limits
- Admin-only operations with proper permissions

### Real-time Features
- Activity logging
- Notification system
- Audit trail for admin actions
- Pagination support
- Search functionality
- Advanced filtering options

## Error Handling
- Comprehensive validation for all inputs
- User-friendly error messages
- Proper HTTP status codes
- Graceful handling of edge cases
- File cleanup on upload failures

## Performance Optimizations
- Efficient database queries with proper indexing
- Pagination to handle large datasets
- File size limits to prevent abuse
- Caching considerations for frequently accessed data 