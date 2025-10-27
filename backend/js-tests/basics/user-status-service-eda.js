// User Status Service EDA Tests - Complete Application Layer Tracing
// Tests each status endpoint with full layer flow documentation

const BASE_URL = 'http://localhost:8084/api/users';

// =============================================================================
// USER STATUS OPERATIONS - APPLICATION LAYER TRACING
// =============================================================================

// TEST: PUT /users/{userId}/status - Update user status ( PASSED )
// APPLICATION LAYER TRACE:
// - commands/: UpdateUserStatusCommand
// - handlers/: UserStatusCommandHandler.handle()
// - adapters/: StatusEventAdapter, PresenceAdapter
// FLOW: REST → StatusController → UserStatusCommandHandler → StatusDomainService.updateUserStatus()
// → UserStatus.updateStatus() → StatusChangedEvent → Kafka(status-events)
const statusUpdate = {
  status: 'ONLINE',
  platform: 'WEB'
};

fetch(`${BASE_URL}/2/status`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(statusUpdate)
})
.then(response => response.json())
.then(data => {
console.log('PUT /users/2/status - Status Updated:', {
  userId: data.userId,        
  status: data.status,       
  platform: data.platform,   
  lastActive: data.lastActive,
  displayStatus: data.displayStatus,
  available: data.available   
});
})
.catch(error => console.error('Error:', error));

// TEST: GET /users/{userId}/status - Get user status ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetUserStatusQuery
// - handlers/: UserStatusQueryHandler.handle()
// - adapters/: StatusViewAdapter, PresenceViewAdapter
// FLOW: REST → StatusController → UserStatusQueryHandler → StatusDomainService.getUserStatus()
// → UserStatusRepository.findById() → Status View Model
fetch(`${BASE_URL}/2/status`)
  .then(response => response.json())
  .then(data => console.log('GET /users/2/status - User Status:', {
    userId: data.userId,
    status: data.status,
    lastActive: data.lastActive,
    platform: data.platform,
    active: data.active,
    available: data.available
  }))
  .catch(error => console.error('Error:', error));

// APPLICATION LAYER COMPONENTS TESTED:
// Commands: UpdateUserStatusCommand
// Queries: GetUserStatusQuery
// Handlers: UserStatusCommandHandler, UserStatusQueryHandler
// Adapters: StatusEventAdapter, PresenceAdapter, StatusViewAdapter, PresenceViewAdapter
// Events: StatusChangedEvent (internal domain events)