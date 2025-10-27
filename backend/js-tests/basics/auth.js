// Authentication API Tests - Session-based Authentication
// Tests login, register, logout, and session management

const BASE_URL = 'http://localhost:8084/api/auth';

console.log('=== AUTHENTICATION API TESTS ===');

// TEST: POST /auth/register - Register new user
const registerUser = {
    username: `testauth_${Date.now()}`,
    email: `testauth_${Date.now()}@example.com`,
    password: "password123",
    role: "CUSTOMER",
    firstName: "Test",
    lastName: "User"
};

console.log('Testing registration...');
fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerUser),
    credentials: 'include' // Important for session management
})
.then(response => response.json())
.then(data => {
    console.log('REGISTER Result:', {
        success: data.success,
        message: data.message,
        user: data.user ? {
            id: data.user.id,
            username: data.user.username,
            role: data.user.role
        } : null
    });
    
    if (data.success) {
        window.registeredUser = data.user;
        testAuthenticatedEndpoints();
    }
})
.catch(error => console.error('Register Error:', error));

function testAuthenticatedEndpoints() {
    console.log('\n=== Testing authenticated endpoints ===');
    
    // TEST: GET /auth/me - Get current user from session
    setTimeout(() => {
        console.log('Testing /auth/me...');
        fetch(`${BASE_URL}/me`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('GET /auth/me Result:', {
                success: data.success,
                message: data.message,
                user: data.user ? {
                    id: data.user.id,
                    username: data.user.username,
                    role: data.user.role
                } : null
            });
        })
        .catch(error => console.error('Auth Me Error:', error));
    }, 1000);

    // TEST: GET /auth/status - Check authentication status
    setTimeout(() => {
        console.log('Testing /auth/status...');
        fetch(`${BASE_URL}/status`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('GET /auth/status Result:', {
                success: data.success,
                message: data.message
            });
        })
        .catch(error => console.error('Auth Status Error:', error));
    }, 2000);

    // TEST: POST /auth/logout - Logout user
    setTimeout(() => {
        console.log('Testing logout...');
        fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('LOGOUT Result:', {
                success: data.success,
                message: data.message
            });
            
            if (data.success) {
                testLoginWithRegisteredUser();
            }
        })
        .catch(error => console.error('Logout Error:', error));
    }, 3000);
}

function testLoginWithRegisteredUser() {
    console.log('\n=== Testing login with registered user ===');
    
    setTimeout(() => {
        const loginData = {
            username: registerUser.username,
            password: registerUser.password
        };
        
        console.log('Testing login...');
        fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('LOGIN Result:', {
                success: data.success,
                message: data.message,
                user: data.user ? {
                    id: data.user.id,
                    username: data.user.username,
                    role: data.user.role
                } : null
            });
            
            if (data.success) {
                testExistingUserLogin();
            }
        })
        .catch(error => console.error('Login Error:', error));
    }, 4000);
}

function testExistingUserLogin() {
    console.log('\n=== Testing login with existing users ===');
    
    setTimeout(() => {
        // Test with existing customer1 user (from data.sql)
        const existingUserLogin = {
            username: "customer1",
            password: "password123"
        };
        
        console.log('Testing login with customer1...');
        fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(existingUserLogin),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('EXISTING USER LOGIN Result:', {
                success: data.success,
                message: data.message,
                user: data.user ? {
                    id: data.user.id,
                    username: data.user.username,
                    role: data.user.role
                } : null
            });
        })
        .catch(error => console.error('Existing User Login Error:', error));
    }, 5000);

    setTimeout(() => {
        // Test with existing pizzaowner user
        const businessOwnerLogin = {
            username: "pizzaowner",
            password: "password123"
        };
        
        console.log('Testing login with pizzaowner...');
        fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(businessOwnerLogin),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('BUSINESS OWNER LOGIN Result:', {
                success: data.success,
                message: data.message,
                user: data.user ? {
                    id: data.user.id,
                    username: data.user.username,
                    role: data.user.role
                } : null
            });
        })
        .catch(error => console.error('Business Owner Login Error:', error));
    }, 6000);
}

console.log('\n=== To test manually ===');
console.log('1. Open browser console and run this script');
console.log('2. Check browser Application > Storage > Cookies for session cookies');
console.log('3. Test authentication state persistence across page reloads');
console.log('4. Use existing users: customer1, pizzaowner, rider1 (password: password123)');