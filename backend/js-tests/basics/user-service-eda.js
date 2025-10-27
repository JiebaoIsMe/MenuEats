// User Service EDA Tests - Complete Application Layer Tracing
// Tests each REST API endpoint with full layer flow documentation

const BASE_URL = 'http://localhost:8084/api/users';

// =============================================================================
// USER CRUD OPERATIONS - APPLICATION LAYER TRACING
// =============================================================================

// TEST: GET /users - List all users ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetAllUsersQuery
// - handlers/: UserQueryHandler.handle()
// - adapters/: UserListViewAdapter
// FLOW: REST → UserController → UserQueryHandler → UserRepository.findAll()
fetch(`${BASE_URL}`)
.then(response => response.json())
.then(data => {
  console.log('GET /users - All Users:', data);
  console.log('Summary:', {
    count: data.length,
    firstUser: data[0]?.username,
    roles: [...new Set(data.map(u => u.role))]
  });
})
.catch(error => console.error('Error:', error));

// TEST: GET /users/active - List active users only ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetActiveUsersQuery
// - handlers/: ActiveUserQueryHandler.handle()
// - adapters/: ActiveUserViewAdapter
// FLOW: REST → UserController → ActiveUserQueryHandler → UserRepository.findByActiveTrue()
fetch(`${BASE_URL}/active`)
  .then(response => response.json())
  .then(data => console.log('GET /users/active - Active Users:', {
    activeCount: data.length,
    activeUsers: data.map(u => u.username)
  }))
  .catch(error => console.error('Error:', error));

// TEST: GET /users/{id} - Get user by ID ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetUserByIdQuery
// - handlers/: UserByIdQueryHandler.handle()
// - adapters/: UserDetailViewAdapter
// FLOW: REST → UserController → UserByIdQueryHandler → UserRepository.findById()
fetch(`${BASE_URL}/1`)
  .then(response => response.json())
  .then(data => console.log('GET /users/1 - User by ID:', {
    id: data.id,
    username: data.username,
    role: data.role,
    profile: 'Profile data in separate user_profiles table'
  }))
  .catch(error => console.error('Error:', error));

// TEST: GET /users/username/{username} - Get user by username ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetUserByUsernameQuery
// - handlers/: UserByUsernameQueryHandler.handle()
// - adapters/: UserLookupAdapter
// FLOW: REST → UserController → UserByUsernameQueryHandler → UserRepository.findByUsername()
fetch(`${BASE_URL}/username/customer1`)
  .then(response => response.json())
  .then(data => console.log('GET /users/username/customer1 - User by Username:', {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role
  }))
  .catch(error => console.error('Error:', error));

// TEST: GET /users/role/{role} - Get users by role ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetUsersByRoleQuery
// - handlers/: UsersByRoleQueryHandler.handle()
// - adapters/: RoleBasedUserViewAdapter
// FLOW: REST → UserController → UsersByRoleQueryHandler → UserRepository.findByRole()
fetch(`${BASE_URL}/role/CUSTOMER`)
  .then(response => response.json())
  .then(data => console.log('GET /users/role/CUSTOMER - Users by Role:', {
    role: 'CUSTOMER',
    count: data.length,
    customers: data.map(u => u.username)
  }))
  .catch(error => console.error('Error:', error));

  // TEST: POST /users - Create new user ( PASSED )
  // APPLICATION LAYER TRACE:
  // - commands/: CreateUserCommand
  // - handlers/: UserCommandHandler.handle()
  // - adapters/: UserCreationAdapter, UserEventAdapter
  // FLOW: REST → UserController → UserCommandHandler → User.create() → UserRegisteredEvent → Kafka
  const timestamp = Date.now();
  const newUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: "password123",
    role: "CUSTOMER",
    firstName: "John",
    lastName: "Test"
};

fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
})
.then(response => response.json())
.then(data => {
  console.log('POST /users - User Created:', {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role,
    active: data.active
  });
  // UserRegisteredEvent should be published to Kafka
  window.createdUserId = data.id;
})
.catch(error => console.error('Error:', error));

// TEST: PUT /users/{id} - Update existing user ( PASSED )
// APPLICATION LAYER TRACE:
// - commands/: UpdateUserCommand
// - handlers/: UserUpdateCommandHandler.handle()
// - adapters/: UserUpdateAdapter, UserEventAdapter
// FLOW: REST → UserController → UserUpdateCommandHandler → User.updateContactInfo() → UserUpdatedEvent → Kafka
setTimeout(() => {
  const updateTimestamp = Date.now();
  const updateUser = {
      username: `updateduser_${updateTimestamp}`,
      email: `updated_${updateTimestamp}@example.com`,
      role: "BUSINESS_OWNER"
  };

  fetch(`${BASE_URL}/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateUser)
  })
  .then(response => response.json()) 
  .then(data => {
    console.log('PUT /users/1 - User Updated:', {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      profileNote: 'Profile data managed separately in user_profiles table'
    });
    // UserUpdatedEvent should be published to Kafka
  })
  .catch(error => console.error('Error:', error));
}, 2000);

// TEST: DELETE /users/{id} - Delete user ( ADMIN ONLY )
// APPLICATION LAYER TRACE:
// - commands/: DeleteUserCommand
// - handlers/: UserDeleteCommandHandler.handle()
// - adapters/: UserDeletionAdapter, UserEventAdapter
// FLOW: REST → UserController → UserDeleteCommandHandler → User.deactivate() → UserDeactivatedEvent → Kafka
// setTimeout(() => {
//   const userIdToDelete = window.createdUserId || 10; // Use created user or fallback
  
//   fetch(`${BASE_URL}/${userIdToDelete}`, { 
//       method: 'DELETE'
//   })
//   .then(response => {
//     console.log('DELETE /users/' + userIdToDelete + ' - User Deleted:', {
//       status: response.status,
//       success: response.ok
//     });
//     // UserDeactivatedEvent should be published to Kafka
//   })
//   .catch(error => console.error('Error:', error));
// }, 4000);

// =============================================================================
// RESTAURANT INTEGRATION ENDPOINTS - CROSS-CONTEXT COMMUNICATION
// =============================================================================

// TEST: GET /users/restaurants - Get all restaurants (Cross-service call) (PASSED)
// APPLICATION LAYER TRACE:
// - queries/: GetAllRestaurantsQuery  
// - handlers/: RestaurantQueryHandler.handle()
// - adapters/: RestaurantServiceAdapter (Anti-corruption layer)
// FLOW: REST → UserController → RestaurantQueryHandler → RestaurantServiceAdapter → External Service
setTimeout(() => {
  fetch(`${BASE_URL}/restaurants`) 
    .then(response => response.json())
    .then(data => console.log('GET /users/restaurants - All Restaurants:', {
      count: data?.length || 0,
      restaurants: data?.slice(0, 2)?.map(r => ({
        id: r.id,
        name: r.name,
        location: r.location,
        ownerId: r.ownerId
      })) || []
    }))
    .catch(error => console.error('Error:', error));
}, 6000);

// TEST: GET /users/restaurants/name/{name} - Get restaurants by name (Client-side filtering) ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetRestaurantsByNameQuery
// - handlers/: RestaurantNameQueryHandler.handle()
// - adapters/: RestaurantServiceAdapter with client-side filtering
// FLOW: REST → UserController → RestaurantServiceAdapter → Filter by name
setTimeout(() => {
  fetch(`${BASE_URL}/restaurants/name/pizza`)
    .then(response => response.json())
    .then(data => console.log('GET /users/restaurants/name/pizza - Restaurants by Name:', {
      searchTerm: 'pizza',
      count: data?.length || 0,
      restaurants: data?.map(r => ({
        id: r.id,
        name: r.name,
        location: r.location,
        ownerId: r.ownerId
      })) || []
    }))
    .catch(error => console.error('Error:', error));
}, 7000);

// =============================================================================
// TEST COMPLETION SUMMARY
// =============================================================================


// APPLICATION LAYER COMPONENTS TESTED:
// Commands: CreateUserCommand, UpdateUserCommand, DeleteUserCommand (skipped)
// Queries: GetAllUsersQuery, GetActiveUsersQuery, GetUserByIdQuery, GetUserByUsernameQuery, GetUsersByRoleQuery
// Handlers: UserCommandHandler, UserUpdateCommandHandler, UserQueryHandler, ActiveUserQueryHandler, UserByIdQueryHandler, UserByUsernameQueryHandler, UsersByRoleQueryHandler
// Adapters: UserCreationAdapter, UserEventAdapter, UserUpdateAdapter, UserListViewAdapter, ActiveUserViewAdapter, UserDetailViewAdapter, UserLookupAdapter, RoleBasedUserViewAdapter
// Domain Events: UserRegisteredEvent, UserUpdatedEvent (internal only, not published to Kafka)
// Cross-Service: RestaurantServiceAdapter, OwnerRestaurantAdapter (future implementation)