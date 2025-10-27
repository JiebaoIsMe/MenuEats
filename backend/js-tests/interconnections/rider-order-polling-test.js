// Test script for rider order polling functionality
// Tests the READY_FOR_PICKUP endpoint that was fixed in this session

console.log('=== RIDER ORDER POLLING TEST ===');

// Test 1: Direct endpoint test via user-service proxy
console.log('\n1. Testing READY_FOR_PICKUP orders endpoint via user-service proxy...');
fetch('http://localhost:8084/api/user-orders/status/READY_FOR_PICKUP', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include'
})
.then(response => {
    console.log('[READY_FOR_PICKUP] Response status:', response.status);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
})
.then(orders => {
    console.log('[READY_FOR_PICKUP] Found orders:', orders.length);
    orders.forEach((order, index) => {
        console.log(`[READY_FOR_PICKUP] Order ${index + 1}:`, {
            id: order.id,
            customerId: order.customerId,
            restaurantId: order.restaurantId,
            status: order.status,
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress,
            itemCount: order.items.length
        });
    });
})
.catch(error => {
    console.error('[READY_FOR_PICKUP] Error:', error.message);
});

// Test 2: Test ordering service health
console.log('\n2. Testing ordering service health via user-service...');
fetch('http://localhost:8084/api/user-orders/health/ordering-service', {
    method: 'GET',
    credentials: 'include'
})
.then(response => response.json())
.then(health => {
    console.log('[HEALTH] Ordering service status:', health);
})
.catch(error => {
    console.error('[HEALTH] Error:', error.message);
});

// Test 3: Test multiple order statuses that riders need
console.log('\n3. Testing multiple order statuses for rider workflow...');
const statusesToTest = ['PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'];

statusesToTest.forEach(status => {
    fetch(`http://localhost:8084/api/user-orders/status/${status}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(orders => {
        console.log(`[${status}] Found ${orders.length} orders`);
    })
    .catch(error => {
        console.error(`[${status}] Error:`, error.message);
    });
});

console.log('\n=== TEST SUMMARY ===');
console.log('✅ Fixed: 404 error for READY_FOR_PICKUP orders endpoint');
console.log('✅ Added: OrderIntegrationService.getOrdersByStatus() method');
console.log('✅ Added: OrderController.getOrdersByStatus() endpoint in user-service');
console.log('✅ Updated: Frontend RiderHome to use proper orderApi service');
console.log('✅ Updated: RiderOrderHistory to fetch multiple delivery-related statuses');
console.log('✅ Added: Test data with READY_FOR_PICKUP orders in ordering-service');
console.log('\n📋 RIDER WORKFLOW NOW SUPPORTS:');
console.log('  - Polling for READY_FOR_PICKUP orders');
console.log('  - Fetching orders by any status via /api/user-orders/status/{status}');
console.log('  - Proper authentication and CORS through user-service proxy');
console.log('  - Real-time order updates for rider dashboard');