// Server-side constants for consistent error messages and responses

// Error messages for API responses
exports.ERROR_MESSAGES = {
  // Authentication errors
  NO_TOKEN_PROVIDED: 'No token provided.',
  INVALID_TOKEN: 'Invalid token provided.',
  TOKEN_EXPIRED: 'Token has expired.',
  USER_NOT_FOUND: 'User not found.',
  UNAUTHORIZED: 'Unauthorized access.',
  
  // Database errors
  DATABASE_ERROR: 'Database operation failed.',
  DARE_FETCH_ERROR: 'Failed to fetch dares from database.',
  SWITCH_GAME_FETCH_ERROR: 'Failed to fetch switch games from database.',
  USER_FETCH_ERROR: 'Failed to fetch user from database.',
  ASSOCIATES_FETCH_ERROR: 'Failed to fetch associates from database.',
  
  // Validation errors
  USER_ID_REQUIRED: 'User ID is required.',
  INVALID_USER_ID: 'Invalid user ID format.',
  
  // General errors
  INTERNAL_SERVER_ERROR: 'Internal server error occurred.',
  REQUEST_FAILED: 'Request failed. Please try again.',
  RESOURCE_NOT_FOUND: 'Resource not found.',
  
  // Specific feature errors
  ASSOCIATES_ENDPOINT_ERROR: 'Failed to process associates request.',
  DARES_QUERY_ERROR: 'Error occurred while querying dares for associates.',
  SWITCH_GAMES_QUERY_ERROR: 'Error occurred while querying switch games for associates.',
  USER_VERIFICATION_ERROR: 'Failed to verify user existence.',
  
  // Success messages
  ASSOCIATES_LOADED: 'Associates loaded successfully.',
  USER_VERIFIED: 'User verified successfully.',
  DATA_PROCESSED: 'Data processed successfully.'
};

// HTTP status codes
exports.STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Database operation types
exports.DB_OPERATIONS = {
  FIND: 'find',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  POPULATE: 'populate'
};

// User interaction types for associates
exports.INTERACTION_TYPES = {
  DARE_CREATOR: 'dare_creator',
  DARE_PERFORMER: 'dare_performer',
  SWITCH_GAME_CREATOR: 'switch_game_creator',
  SWITCH_GAME_PARTICIPANT: 'switch_game_participant'
};

// Log message templates
exports.LOG_MESSAGES = {
  ASSOCIATES_ENDPOINT_CALLED: 'Associates endpoint called for user:',
  USER_FOUND: 'User found:',
  STARTING_DB_QUERIES: 'Starting database queries for user:',
  DARES_FOUND: 'Found {count} dares for user {userId}',
  SWITCH_GAMES_FOUND: 'Found {count} switch games for user {userId}',
  ASSOCIATES_FOUND: 'Found {count} associates for user {userId}',
  DB_QUERY_ERROR: 'Database query error for {operation}:',
  ENDPOINT_ERROR: 'Endpoint error for {endpoint}:'
}; 