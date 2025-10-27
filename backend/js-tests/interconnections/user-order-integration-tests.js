// User-Service to Ordering-Service Integration Tests
// Direct HTTP communication without Kafka/EDA
// Copy and paste these tests one by one in browser console
// Updated for current data structure: String menuItemId, proper order creation flow

// Test 0: Create New Order via User Service (Frontend data structure)
console.log('=== Test 0: Create New Order ===');
fetch('http://localhost:8084/api/user-orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        customerId: 2,
        restaurantId: 2,
        deliveryAddress: '123 Test Street, Test City',
        items: [
            {
                menuItemId: 'A003',
                menuItemName: 'French Fries',
                quantity: 2,
                price: 4.99
            },
            {
                menuItemId: 'B003',
                menuItemName: 'Classic Burger',
                quantity: 1,
                price: 10.99
            }
        ]
    })
})
.then(response => {
    console.log('Create Order Status:', response.status);
    if (response.status === 201) {
        console.log('✓ Order created successfully');
    }
    return response.json();
})
.then(data => {
    console.log('Created Order Response:', data);
    console.log('Order ID:', data.id);
    console.log('Total Amount:', data.totalAmount);
    console.log('Items:', data.items);
    console.log('Status:', data.status);
})
.catch(error => {
    console.error('Create Order Error:', error);
});

// Test 1: Health check for ordering service via user-service
console.log('=== Test 1: Health Check Ordering Service ===');
fetch('http://localhost:8084/api/user-orders/health/ordering-service', {
    method: 'GET',
    credentials: 'include'
})
.then(response => {
    console.log('Health Check Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Health Check Response:', data);
    console.log('Ordering Service Available:', data['ordering-service-available']);
})
.catch(error => {
    console.error('Health Check Error:', error);
});

// Test 1.1: Create Order with Single Item (French Fries)
console.log('\n=== Test 1.1: Create Order - Single Item ===');
fetch('http://localhost:8084/api/user-orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        customerId: 2,
        restaurantId: 2,
        deliveryAddress: '456 Single Item Ave',
        items: [
            {
                menuItemId: 'A003',
                menuItemName: 'French Fries',
                quantity: 1,
                price: 4.99
            }
        ]
    })
})
.then(response => {
    console.log('Single Item Order Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Single Item Order:', data);
    console.log('Total should be 4.99:', data.totalAmount);
})
.catch(error => {
    console.error('Single Item Order Error:', error);
});

// Test 1.2: Create Order with Multiple Items from Burger Haven
console.log('\n=== Test 1.2: Create Order - Multiple Items ===');
fetch('http://localhost:8084/api/user-orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        customerId: 2,
        restaurantId: 2,
        deliveryAddress: '789 Multi Item Blvd',
        items: [
            {
                menuItemId: 'A003',
                menuItemName: 'French Fries',
                quantity: 2,
                price: 4.99
            },
            {
                menuItemId: 'A004',
                menuItemName: 'Onion Rings',
                quantity: 1,
                price: 5.99
            },
            {
                menuItemId: 'B004',
                menuItemName: 'Cheeseburger',
                quantity: 1,
                price: 11.99
            },
            {
                menuItemId: 'D001',
                menuItemName: 'Chocolate Shake',
                quantity: 1,
                price: 4.99
            }
        ]
    })
})
.then(response => {
    console.log('Multi Item Order Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Multi Item Order:', data);
    console.log('Total should be 32.95:', data.totalAmount);
    console.log('Items count:', data.items.length);
})
.catch(error => {
    console.error('Multi Item Order Error:', error);
});

// Test 2: Get all orders for John (customerId: 2) via user-service
console.log('\n=== Test 2: Get John\'s Orders via User Service ===');
fetch('http://localhost:8084/api/user-orders/customer/2', {
    method: 'GET',
    credentials: 'include'
})
.then(response => {
    console.log('Get Orders Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('John\'s Orders via User Service:', data);
    console.log('Number of orders:', data.length);
    data.forEach(order => {
        console.log(`Order ${order.id}: Status=${order.status}, Total=$${order.totalAmount}, Items=${order.items.length}`);
        order.items.forEach(item => {
            console.log(`  - ${item.menuItemName} (${item.menuItemId}): Qty=${item.quantity}, Price=$${item.price}`);
        });
    });
})
.catch(error => {
    console.error('Get Orders Error:', error);
});

// Test 3: Get specific order details (Order 1001)
console.log('\n=== Test 3: Get Order 1001 Details ===');
fetch('http://localhost:8084/api/user-orders/1001', {
    method: 'GET',
    credentials: 'include'
})
.then(response => {
    console.log('Get Order Details Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Order 1001 Details:', data);
    console.log('Order Status:', data.status);
    console.log('Delivery Address:', data.deliveryAddress);
    console.log('Items:');
    data.items.forEach(item => {
        console.log(`  - ${item.menuItemName}: Qty=${item.quantity}, Price=$${item.price}`);
    });
})
.catch(error => {
    console.error('Get Order Details Error:', error);
});

// Test 4: Update order status (PREPARING → READY_FOR_PICKUP)
console.log('\n=== Test 4: Update Order Status ===');
fetch('http://localhost:8084/api/user-orders/1001/status', {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        status: 'READY_FOR_PICKUP'
    })
})
.then(response => {
    console.log('Update Status Response:', response.status);
    return response.json();
})
.then(data => {
    console.log('Updated Order:', data);
    console.log('New Status:', data.status);
})
.catch(error => {
    console.error('Update Status Error:', error);
});


// Test 6: Error handling - Non-existent order
console.log('\n=== Test 6: Error Handling - Non-existent Order ===');
fetch('http://localhost:8084/api/user-orders/99999', {
    method: 'GET',
    credentials: 'include'
})
.then(response => {
    console.log('Non-existent Order Status:', response.status);
    if (response.status === 404) {
        console.log('✓ Proper 404 handling for non-existent order');
    }
    return response.text();
})
.then(data => {
    console.log('Response body:', data);
})
.catch(error => {
    console.error('Error handling test error:', error);
});

// Test 7: Cancel order test (Order 1004)
// NOTE: Uses user-service proxy (8084) NOT direct ordering-service (8082) to avoid CORS
console.log('\n=== Test 7: Cancel Order ===');
fetch('http://localhost:8084/api/user-orders/1004', {
    method: 'DELETE',
    credentials: 'include'
})
.then(response => {
    console.log('Cancel Order Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Cancelled Order:', data);
    console.log('Status after cancellation:', data.status);
})
.catch(error => {
    console.error('Cancel Order Error:', error);
});

// Test 8: Validation Tests - Missing Required Fields
console.log('\n=== Test 8: Validation - Missing Customer ID ===');
fetch('http://localhost:8084/api/user-orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        restaurantId: 2,
        deliveryAddress: '123 Missing Customer St',
        items: [
            {
                menuItemId: 'A003',
                menuItemName: 'French Fries',
                quantity: 1,
                price: 4.99
            }
        ]
    })
})
.then(response => {
    console.log('Missing Customer ID Status:', response.status);
    if (response.status === 400) {
        console.log('✓ Proper validation - 400 Bad Request for missing customerId');
    }
    return response.text();
})
.then(data => {
    console.log('Response:', data);
})
.catch(error => {
    console.error('Validation test error:', error);
});

// Test 9: Data Structure Validation - String menuItemId Test
console.log('\n=== Test 9: Data Structure - String menuItemId Validation ===');
fetch('http://localhost:8084/api/user-orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        customerId: 2,
        restaurantId: 2,
        deliveryAddress: '999 String ID Test Ave',
        items: [
            {
                menuItemId: 'A003',  // String ID
                menuItemName: 'French Fries',
                quantity: 1,
                price: 4.99
            },
            {
                menuItemId: 'B003',  // String ID
                menuItemName: 'Classic Burger',
                quantity: 1,
                price: 10.99
            }
        ]
    })
})
.then(response => {
    console.log('String menuItemId Status:', response.status);
    if (response.status === 201) {
        console.log('✓ String menuItemId accepted correctly');
    }
    return response.json();
})
.then(data => {
    console.log('String ID Order:', data);
    console.log('Verifying menuItemId types:');
    data.items.forEach(item => {
        console.log(`  ${item.menuItemName}: menuItemId="${item.menuItemId}" (type: ${typeof item.menuItemId})`);
    });
})
.catch(error => {
    console.error('String ID test error:', error);
});

// Test 10: Frontend Data Structure Simulation
console.log('\n=== Test 10: Frontend Data Structure Simulation ===');
fetch('http://localhost:8084/api/user-orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        customerId: 2,
        restaurantId: 2,
        deliveryAddress: '555 Frontend Simulation Drive, Test City, TC 12345',
        items: [
            {
                menuItemId: 'A003',
                menuItemName: 'French Fries',
                quantity: 3,
                price: 4.99
            }
        ]
    })
})
.then(response => {
    console.log('Frontend Simulation Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Frontend-like Order Created:', data);
    console.log('This simulates the exact data structure sent from order-checkout.jsx');
    console.log('Customer ID:', data.customerId);
    console.log('Restaurant ID:', data.restaurantId);
    console.log('Address:', data.deliveryAddress);
    console.log('Items with String IDs:', data.items);
})
.catch(error => {
    console.error('Frontend simulation error:', error);
});

console.log('\n=== User-Order Integration Tests Complete ===');
console.log('These tests verify the direct HTTP communication between user-service and ordering-service');
console.log('without using Kafka/EDA patterns.');
console.log('Updated tests include:');
console.log('- Order creation with current String menuItemId data structure');
console.log('- Single and multiple item orders');
console.log('- Data validation tests');
console.log('- Frontend data structure simulation');

// Performance test
console.log('\n=== Performance Test: Multiple Rapid Calls ===');
const startTime = Date.now();
Promise.all([
    fetch('http://localhost:8084/api/user-orders/customer/2', { credentials: 'include' }),
    fetch('http://localhost:8084/api/user-orders/health/ordering-service', { credentials: 'include' }),
    // Create a test order in parallel
    fetch('http://localhost:8084/api/user-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            customerId: 2,
            restaurantId: 2,
            deliveryAddress: 'Performance Test Address',
            items: [{ menuItemId: 'A003', menuItemName: 'French Fries', quantity: 1, price: 4.99 }]
        })
    })
])
.then(responses => {
    const endTime = Date.now();
    console.log(`✓ All 3 parallel requests completed in ${endTime - startTime}ms`);
    console.log('Response statuses:', responses.map(r => r.status));
    console.log('Performance test includes: GET orders, health check, POST create order');
})
.catch(error => {
    console.error('Performance test error:', error);
});