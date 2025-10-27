// Logistics Service Integration Tests
// Tests delivery tracking, rider assignment, and status updates
// Copy and paste these tests one by one in browser console

// Test 0: Health Check Logistics Service via User Service
console.log('=== Test 0: Health Check Logistics Service ===');
fetch('http://localhost:8084/api/logistics/health/logistics-service', {
    method: 'GET',
    credentials: 'include'
})
.then(response => {
    console.log('Logistics Health Check Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Logistics Health Check Response:', data);
    console.log('Logistics Service Available:', data['logistics-service-available']);
})
.catch(error => {
    console.error('Logistics Health Check Error:', error);
});

// Test 1: Create Delivery Tracking for Order (Order ID 1)
console.log('\n=== Test 1: Create Delivery Tracking ===');
fetch('http://localhost:8084/api/logistics/track', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        orderId: 1
    })
})
.then(response => {
    console.log('Create Delivery Tracking Status:', response.status);
    if (response.status === 201) {
        console.log('✓ Delivery tracking created successfully');
    }
    return response.json();
})
.then(data => {
    console.log('Created Delivery Tracking:', data);
    console.log('Order ID:', data.orderId);
    console.log('Logistics Status:', data.logisticsStatus);
    console.log('Estimated Delivery Time:', data.estimatedDeliveryTime);
})
.catch(error => {
    console.error('Create Delivery Tracking Error:', error);
});

// Test 2: Get Delivery Tracking by Order ID
console.log('\n=== Test 2: Get Delivery Tracking by Order ID ===');
fetch('http://localhost:8084/api/logistics/track/order/1', {
    method: 'GET',
    credentials: 'include'
})
.then(response => {
    console.log('Get Delivery Tracking Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Delivery Tracking Details:', data);
    console.log('Current Logistics Status:', data.logisticsStatus);
    console.log('Rider ID:', data.riderId || 'Not assigned yet');
    console.log('ETA:', data.estimatedDeliveryTime);
    console.log('Last Updated:', data.updatedAt);
})
.catch(error => {
    console.error('Get Delivery Tracking Error:', error);
});

// Test 3: Get Available Riders
console.log('\n=== Test 3: Get Available Riders ===');
fetch('http://localhost:8084/api/logistics/riders/available', {
    method: 'GET',
    credentials: 'include'
})
.then(response => {
    console.log('Get Available Riders Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Available Riders:', data);
    console.log('Number of available riders:', data.length);
    data.forEach(rider => {
        console.log(`Rider ${rider.id}: User ID=${rider.userId}, Available=${rider.isAvailable}`);
    });
})
.catch(error => {
    console.error('Get Available Riders Error:', error);
});

// Test 4: Manual Rider Assignment (if needed)
console.log('\n=== Test 4: Assign Rider to Order ===');
fetch('http://localhost:8084/api/logistics/assign-rider', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        orderId: 1,
        riderId: 1  // Assuming rider ID 1 exists
    })
})
.then(response => {
    console.log('Assign Rider Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Rider Assignment Result:', data);
    console.log('Order ID:', data.orderId);
    console.log('Assigned Rider ID:', data.riderId);
    console.log('New Status:', data.logisticsStatus);
})
.catch(error => {
    console.error('Assign Rider Error:', error);
});

// Test 5: Simulate Rider Status Updates
console.log('\n=== Test 5: Rider Status Updates Simulation ===');

// Function to update status with delay
function updateStatusWithDelay(orderId, status, delay, description) {
    setTimeout(() => {
        console.log(`\n--- ${description} ---`);
        fetch(`http://localhost:8084/api/logistics/track/order/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                status: status
            })
        })
        .then(response => {
            console.log(`${description} Status:`, response.status);
            return response.json();
        })
        .then(data => {
            console.log(`${description} Result:`, data);
            console.log('New Logistics Status:', data.logisticsStatus);
            if (data.pickupTime) console.log('Pickup Time:', data.pickupTime);
            if (data.departureTime) console.log('Departure Time:', data.departureTime);
            if (data.deliveryTime) console.log('Delivery Time:', data.deliveryTime);
        })
        .catch(error => {
            console.error(`${description} Error:`, error);
        });
    }, delay);
}

// Simulate the delivery process (only if not already automated)
// updateStatusWithDelay(1, 'RIDER_EN_ROUTE_TO_RESTAURANT', 1000, 'Rider heading to restaurant');
// updateStatusWithDelay(1, 'ARRIVED_AT_RESTAURANT', 4000, 'Rider arrived at restaurant');
// updateStatusWithDelay(1, 'PICKED_UP_FROM_RESTAURANT', 8000, 'Order picked up');
// updateStatusWithDelay(1, 'RIDER_EN_ROUTE_TO_CUSTOMER', 10000, 'Rider heading to customer');
// updateStatusWithDelay(1, 'NEAR_CUSTOMER', 15000, 'Rider near customer');
// updateStatusWithDelay(1, 'DELIVERED', 18000, 'Order delivered');

console.log('Note: Automated status updates are enabled. Manual updates commented out.');

// Test 6: Get Rider Deliveries (for a specific rider)
console.log('\n=== Test 6: Get Rider Deliveries ===');
fetch('http://localhost:8084/api/logistics/riders/1/deliveries', {
    method: 'GET',
    credentials: 'include'
})
.then(response => {
    console.log('Get Rider Deliveries Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Rider 1 Deliveries:', data);
    console.log('Number of deliveries:', data.length);
    data.forEach(delivery => {
        console.log(`Order ${delivery.orderId}: Status=${delivery.logisticsStatus}, ETA=${delivery.estimatedDeliveryTime}`);
    });
})
.catch(error => {
    console.error('Get Rider Deliveries Error:', error);
});

// Test 7: Multiple Order Tracking Test
console.log('\n=== Test 7: Create Multiple Order Tracking ===');
const orderIds = [2, 1001, 1002];

orderIds.forEach((orderId, index) => {
    setTimeout(() => {
        console.log(`\n--- Creating tracking for Order ${orderId} ---`);
        fetch('http://localhost:8084/api/logistics/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                orderId: orderId
            })
        })
        .then(response => {
            console.log(`Order ${orderId} Tracking Status:`, response.status);
            return response.json();
        })
        .then(data => {
            console.log(`Order ${orderId} Tracking Created:`, data);
            console.log(`Order ${orderId} Status:`, data.logisticsStatus);
        })
        .catch(error => {
            console.error(`Order ${orderId} Tracking Error:`, error);
        });
    }, index * 2000); // Stagger requests by 2 seconds
});

// Test 8: Real-time Status Monitoring
console.log('\n=== Test 8: Real-time Status Monitoring ===');
let monitoringInterval;

function startMonitoring(orderId) {
    console.log(`Starting real-time monitoring for Order ${orderId}...`);
    
    monitoringInterval = setInterval(() => {
        fetch(`http://localhost:8084/api/logistics/track/order/${orderId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log(`[${new Date().toLocaleTimeString()}] Order ${orderId} Status: ${data.logisticsStatus}`);
        })
        .catch(error => {
            console.error('Monitoring error:', error);
        });
    }, 5000); // Check every 5 seconds
    
    // Stop monitoring after 30 seconds
    setTimeout(() => {
        clearInterval(monitoringInterval);
        console.log('Real-time monitoring stopped.');
    }, 30000);
}

// Uncomment to start monitoring
// startMonitoring(1);

console.log('\n=== Logistics Delivery Tests Complete ===');
console.log('These tests verify:');
console.log('- Delivery tracking creation and retrieval');
console.log('- Rider assignment and availability');
console.log('- Logistics status updates and simulation');
console.log('- Real-time tracking capabilities');
console.log('- Integration between user-service and logistics-service');