// Complete Restaurant CRU + Order Management Tests
// Tests all new functionality from both frontend ports (3000 & 3001)
// Run each test block in browser console (F12) to verify functionality

console.log('🎯 Complete Restaurant CRU + Order Management Tests');
console.log('✅ Services Status:');
console.log('- Restaurant Service: http://localhost:8081');
console.log('- Ordering Service: http://localhost:8082');
console.log('- Logistics Service: http://localhost:8083');
console.log('- User Service: http://localhost:8084');
console.log('- Frontend: http://localhost:3000 & http://localhost:3001');

const BASE_URL = 'http://localhost:8084/api/users';

// Test users from database:
// User ID 4: Mario (BUSINESS_OWNER) - owns Pizza Palace (restaurant ID 1)
// User ID 5: Bob (BUSINESS_OWNER) - owns Burger Haven (restaurant ID 2)
// User ID 2: John (CUSTOMER)
// User ID 1: Mike (RIDER)

console.log('\n=================================================');
console.log('🏪 RESTAURANT CRU OPERATIONS TESTS');
console.log('=================================================');

// Test 1: Create Restaurant (Business Owner Only)
console.log('\n📦 Test 1: Create Restaurant (Business Owner)');
const ownerId = 4; // Mario
const newRestaurant = {
    name: "Mario's New Pizza Place",
    location: "789 New Pizza Street",
    contactInfo: "+1-555-NEW1",
    description: "Brand new pizza restaurant"
};

fetch(`${BASE_URL}/${ownerId}/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRestaurant)
})
.then(response => response.json())
.then(data => {
    console.log('✅ Restaurant created:', data);
    console.log('📝 Note restaurant ID for next tests');
})
.catch(error => console.error('❌ Error:', error));

// Test 2: Get Owner's Restaurants
console.log('\n📋 Test 2: Get Owner Restaurants');
fetch(`${BASE_URL}/${ownerId}/restaurants`)
.then(response => response.json())
.then(data => {
    console.log('✅ Owner restaurants:', data);
    console.log('📊 Total restaurants:', data.length);
})
.catch(error => console.error('❌ Error:', error));

// Test 3: Update Restaurant (Owner Only)
console.log('\n🔄 Test 3: Update Restaurant');
const restaurantId = 1; // Pizza Palace
const updateData = {
    name: "Mario's Updated Pizza Palace",
    location: "Updated Address 123",
    contactInfo: "+1-555-UPDT",
    description: "Updated description"
};

fetch(`${BASE_URL}/${ownerId}/restaurants/${restaurantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
})
.then(response => response.json())
.then(data => {
    console.log('✅ Restaurant updated:', data);
})
.catch(error => console.error('❌ Error:', error));

// Test 4: Role Validation - Customer Tries to Create Restaurant (Should Fail)
console.log('\n🚫 Test 4: Customer Creates Restaurant (Should Fail)');
const customerId = 2; // John (Customer)
fetch(`${BASE_URL}/${customerId}/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRestaurant)
})
.then(response => {
    console.log('📊 Response status:', response.status);
    if (response.status === 403) {
        console.log('✅ Correctly forbidden for customer');
    } else {
        console.log('❌ Should have been forbidden');
    }
})
.catch(error => console.error('❌ Error:', error));

// Test 5: Ownership Validation - Different Owner Tries Update (Should Fail)
console.log('\n🚫 Test 5: Wrong Owner Updates Restaurant (Should Fail)');
const otherOwnerId = 5; // Bob
fetch(`${BASE_URL}/${otherOwnerId}/restaurants/${restaurantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
})
.then(response => {
    console.log('📊 Response status:', response.status);
    if (response.status === 403) {
        console.log('✅ Correctly forbidden for wrong owner');
    } else {
        console.log('❌ Should have been forbidden');
    }
})
.catch(error => console.error('❌ Error:', error));

console.log('\n=================================================');
console.log('🍕 MENU ITEM CRU OPERATIONS TESTS');
console.log('=================================================');

// Test 6: Create Menu Item (Owner Only)
console.log('\n📦 Test 6: Create Menu Item');
const menuItem = {
    name: "Quattro Stagioni Pizza",
    description: "Four seasons pizza with mushrooms, ham, artichokes",
    price: 16.99,
    category: "main",
    available: true
};

fetch(`${BASE_URL}/${ownerId}/restaurants/${restaurantId}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuItem)
})
.then(response => response.json())
.then(data => {
    console.log('✅ Menu item created:', data);
    console.log('📝 Note menu item ID for next tests');
})
.catch(error => console.error('❌ Error:', error));

// Test 7: Update Menu Item (Owner Only)
console.log('\n🔄 Test 7: Update Menu Item');
const menuItemId = "B001"; // Margherita Pizza
const updateMenuItem = {
    name: "Premium Margherita Pizza",
    description: "Premium margherita with buffalo mozzarella",
    price: 18.99,
    category: "main",
    available: true
};

fetch(`${BASE_URL}/${ownerId}/restaurants/${restaurantId}/menu/${menuItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateMenuItem)
})
.then(response => response.json())
.then(data => {
    console.log('✅ Menu item updated:', data);
})
.catch(error => console.error('❌ Error:', error));

// Test 8: Delete Menu Item (Owner Only)
console.log('\n🗑️ Test 8: Delete Menu Item');
const deleteMenuItemId = "A002"; // Garlic Bread
fetch(`${BASE_URL}/${ownerId}/restaurants/${restaurantId}/menu/${deleteMenuItemId}`, {
    method: 'DELETE'
})
.then(response => {
    console.log('📊 Response status:', response.status);
    if (response.status === 200) {
        console.log('✅ Menu item deleted successfully');
    }
})
.catch(error => console.error('❌ Error:', error));

// Test 9: Menu Item Role Validation (Should Fail)
console.log('\n🚫 Test 9: Customer Creates Menu Item (Should Fail)');
fetch(`${BASE_URL}/${customerId}/restaurants/${restaurantId}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuItem)
})
.then(response => {
    console.log('📊 Response status:', response.status);
    if (response.status === 403) {
        console.log('✅ Correctly forbidden for customer');
    }
})
.catch(error => console.error('❌ Error:', error));

console.log('\n=================================================');
console.log('📋 ORDER MANAGEMENT TESTS (Accept/Reject)');
console.log('=================================================');

// First create an order to test accept/reject
console.log('\n📦 Step 1: Create Order for Testing');
const testOrder = {
    customerId: 2,
    restaurantId: 1,
    deliveryAddress: "456 Customer Ave, Midtown",
    items: [
        { menuItemId: "B001", menuItemName: "Margherita Pizza", quantity: 1, price: 12.99 }
    ]
};

fetch('http://localhost:8084/api/user-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testOrder)
})
.then(response => response.json())
.then(order => {
    console.log('✅ Test order created:', order);
    const orderId = order.id;
    
    // Test 10: Accept Order (Business Owner)
    console.log('\n✅ Test 10: Accept Order');
    fetch(`${BASE_URL}/${ownerId}/restaurants/${restaurantId}/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Order accepted:', data);
        console.log('📊 Order status should be CONFIRMED');
    })
    .catch(error => console.error('❌ Error accepting order:', error));
})
.catch(error => console.error('❌ Error creating test order:', error));

// Create another order for reject test
setTimeout(() => {
    console.log('\n📦 Step 2: Create Another Order for Reject Test');
    fetch('http://localhost:8084/api/user-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder)
    })
    .then(response => response.json())
    .then(order => {
        console.log('✅ Second test order created:', order);
        const orderId = order.id;
        
        // Test 11: Reject Order (Business Owner)
        console.log('\n❌ Test 11: Reject Order');
        fetch(`${BASE_URL}/${ownerId}/restaurants/${restaurantId}/orders/${orderId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            console.log('✅ Order rejected:', data);
            console.log('📊 Order status should be REJECTED');
        })
        .catch(error => console.error('❌ Error rejecting order:', error));
    })
    .catch(error => console.error('❌ Error creating second test order:', error));
}, 2000);

// Test 12: Order Management Role Validation
setTimeout(() => {
    console.log('\n🚫 Test 12: Customer Tries Order Management (Should Fail)');
    fetch(`${BASE_URL}/${customerId}/restaurants/${restaurantId}/orders/1/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        console.log('📊 Response status:', response.status);
        if (response.status === 403) {
            console.log('✅ Correctly forbidden for customer');
        }
    })
    .catch(error => console.error('❌ Error:', error));
}, 4000);

console.log('\n=================================================');
console.log('🧪 CROSS-PORT TESTING');
console.log('=================================================');

console.log('\n📝 Manual Testing Instructions:');
console.log('1. Open http://localhost:3000 in one browser tab');
console.log('2. Open http://localhost:3001 in another browser tab');
console.log('3. Run these tests from BOTH tabs to verify CORS works');
console.log('4. Check that all operations work from both frontend ports');

console.log('\n🎯 Expected Results:');
console.log('✅ Restaurant CRU: Only BUSINESS_OWNER can create/update');
console.log('✅ Menu CRU: Only restaurant owner can manage menu items');
console.log('✅ Order Management: Only restaurant owner can accept/reject');
console.log('✅ Role Validation: 403 Forbidden for wrong roles');
console.log('✅ Ownership Validation: 403 Forbidden for wrong owners');
console.log('✅ CORS: All requests work from ports 3000 and 3001');

console.log('\n🔥 All tests completed! Check results above.');