// Order Messaging Integration Tests
// Tests the complete flow from order creation to messaging with Kafka events
// Run each test individually in browser console to verify messaging integration

console.log('🔄 Order Messaging Integration Tests - Testing Kafka messaging-events emission');

// Test 1: Create an Order (via User Service API Gateway)
console.log('\n📦 Test 1: Create Order via User Service');
fetch('http://localhost:8084/api/user-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        customerId: 2,
        restaurantId: 1,
        deliveryAddress: "456 Customer Ave, Midtown",
        items: [
            { menuItemId: "B001", menuItemName: "Margherita Pizza", quantity: 1, price: 12.99 }
        ]
    })
})
.then(response => response.json())
.then(order => {
    console.log('✅ Order created:', order);
    console.log('📝 Next: Run Test 2 with orderId =', order.id);
})
.catch(error => console.error('❌ Error creating order:', error));

// Test 2: Accept Order via User Service (This should trigger messaging!)
// Replace {ORDER_ID} with actual order ID from Test 1
console.log('\n🎯 Test 2: Accept Order via User Service (Triggers Messaging)');
const orderId = 1; // UPDATE THIS with actual order ID from Test 1
fetch(`http://localhost:8084/api/user-orders/${orderId}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(order => {
    console.log('✅ Order accepted and confirmed:', order);
    console.log('🎉 Check console logs for "[OrderService] MESSAGING TRIGGER"');
    console.log('📝 Next: Run Test 3 to create confirmation message');
})
.catch(error => console.error('❌ Error accepting order:', error));

// Test 3: Create Order Confirmation Message (Direct test of messaging endpoint)
console.log('Test 3: Create Order Confirmation Message');
const testOrderId = 1; // UPDATE THIS with actual order ID
fetch(`http://localhost:8084/api/user-orders/${testOrderId}/messaging/confirmation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        restaurantOwnerId: 4, // Mario (restaurant owner)
        customerId: 2        // John (customer)
    })
})
.then(response => response.json())
.then(message => {
    console.log('✅ Confirmation message created:', message);
    console.log('🎯 This should emit MessageSentEvent to Kafka messaging-events topic!');
})
.catch(error => console.error('❌ Error creating confirmation message:', error));

// Test 4: Verify Message in Database / check in h2-console
console.log('\n🔍 Test 4: Verify Message in User Inbox');
fetch('http://localhost:8084/api/users/2/messages/inbox')
.then(response => response.json())
.then(messages => {
    console.log('✅ User inbox messages:', messages);
    console.log('🔍 Look for ORDER_CONFIRMATION message type');
})
.catch(error => console.error('❌ Error fetching inbox:', error));

// Test 5: Get Order Messages
console.log('\n📋 Test 5: Get All Messages for Order');
const checkOrderId = 1; // UPDATE THIS with actual order ID
fetch(`http://localhost:8084/api/users/messages/order/${checkOrderId}`)
.then(response => response.json())
.then(messages => {
    console.log('✅ Order messages:', messages);
    console.log('📊 Total messages for order:', messages.length);
})
.catch(error => console.error('❌ Error fetching order messages:', error));

console.log('\n🎯 KAFKA VERIFICATION:');
console.log('Run this command in terminal to see Kafka events:');
console.log('./bin/kafka-console-consumer.sh --bootstrap-server=localhost:9092 --topic messaging-events');
console.log('\n🔥 Expected: MessageSentEvent should appear in messaging-events topic when Test 3 runs');
