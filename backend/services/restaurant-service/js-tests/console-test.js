// Restaurant Service API Testing Script
// Copy and paste this into your browser console to test the endpoints
// Make sure your restaurant service is running on port 8081

const BASE_URL = 'http://localhost:8081/api';

// Test Restaurant Endpoints
const restaurantTests = {
    // Get all restaurants
    getAllRestaurants: async () => {
        try {
            const response = await fetch(`${BASE_URL}/restaurants`);
            const data = await response.json();
            console.log('✅ All Restaurants:', data);
            return data;
        } catch (error) {
            console.error('❌ Error getting restaurants:', error);
        }
    },

    // Get restaurant by ID
    getRestaurantById: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/restaurants/${id}`);
            const data = await response.json();
            console.log(`✅ Restaurant ${id}:`, data);
            return data;
        } catch (error) {
            console.error(`❌ Error getting restaurant ${id}:`, error);
        }
    },

    // Create new restaurant
    createRestaurant: async (restaurantData) => {
        try {
            const response = await fetch(`${BASE_URL}/restaurants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(restaurantData)
            });
            const data = await response.json();
            console.log('✅ Created Restaurant:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creating restaurant:', error);
        }
    }
};

// Test Menu Endpoints
const menuTests = {
    // Get menu by restaurant ID
    getMenuByRestaurant: async (restaurantId) => {
        try {
            const response = await fetch(`${BASE_URL}/restaurant/${restaurantId}/menu`);
            const data = await response.json();
            console.log(`✅ Menu for Restaurant ${restaurantId}:`, data);
            return data;
        } catch (error) {
            console.error(`❌ Error getting menu for restaurant ${restaurantId}:`, error);
        }
    },

    // Create new menu item
    createMenuItem: async (menuData) => {
        try {
            const response = await fetch(`${BASE_URL}/restaurant/menu`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(menuData)
            });
            const data = await response.json();
            console.log('✅ Created Menu Item:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creating menu item:', error);
        }
    },

    // Update menu item
    updateMenuItem: async (id, menuData) => {
        try {
            const response = await fetch(`${BASE_URL}/restaurant/menu/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(menuData)
            });
            const data = await response.json();
            console.log(`✅ Updated Menu Item ${id}:`, data);
            return data;
        } catch (error) {
            console.error(`❌ Error updating menu item ${id}:`, error);
        }
    },

    // Delete menu item
    deleteMenuItem: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/restaurant/menu/${id}`, {
                method: 'DELETE'
            });
            console.log(`✅ Deleted Menu Item ${id}`);
            return true;
        } catch (error) {
            console.error(`❌ Error deleting menu item ${id}:`, error);
        }
    }
};

// Sample test data
const sampleRestaurant = {
    name: "Mario's Pizza Palace",
    location: "123 Main Street",
    contactInfo: "+1-555-0123",
    description: "Authentic Italian pizza and pasta"
};

const sampleMenuItem = {
    name: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella, and basil",
    price: 1299, // Price in cents (12.99)
    category: "main",
    restaurant_id: 1, // Change this to valid restaurant ID
    available: true
};

// Quick test functions
const quickTests = {
    // Test complete restaurant workflow
    testRestaurantWorkflow: async () => {
        console.log('🧪 Testing Restaurant Workflow...');
        
        // 1. Get all restaurants
        await restaurantTests.getAllRestaurants();
        
        // 2. Create a new restaurant
        const newRestaurant = await restaurantTests.createRestaurant(sampleRestaurant);
        
        // 3. Get the created restaurant by ID
        if (newRestaurant && newRestaurant.id) {
            await restaurantTests.getRestaurantById(newRestaurant.id);
        }
    },

    // Test complete menu workflow
    testMenuWorkflow: async (restaurantId = 1) => {
        console.log(`🧪 Testing Menu Workflow for Restaurant ${restaurantId}...`);
        
        // 1. Get current menu
        await menuTests.getMenuByRestaurant(restaurantId);
        
        // 2. Create a new menu item
        const menuData = { ...sampleMenuItem, restaurant_id: restaurantId };
        const newMenuItem = await menuTests.createMenuItem(menuData);
        
        // 3. Update the menu item
        if (newMenuItem && newMenuItem.id) {
            const updatedData = { 
                ...menuData, 
                price: 1499, // Update price to 14.99
                description: "Updated: Fresh tomatoes, mozzarella, basil, and oregano"
            };
            await menuTests.updateMenuItem(newMenuItem.id, updatedData);
            
            // 4. Get menu again to see changes
            await menuTests.getMenuByRestaurant(restaurantId);
            
            // 5. Delete the menu item (commented out to avoid accidental deletion)
            // await menuTests.deleteMenuItem(newMenuItem.id);
        }
    },

    // Test everything
    runAllTests: async () => {
        console.log('🚀 Running All Tests...');
        await quickTests.testRestaurantWorkflow();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        await quickTests.testMenuWorkflow();
        console.log('✅ All tests completed!');
    }
};

// Instructions
console.log(`
🍕 Restaurant Service API Tester
================================

Available test functions:

RESTAURANT TESTS:
- restaurantTests.getAllRestaurants()
- restaurantTests.getRestaurantById(1)
- restaurantTests.createRestaurant(sampleRestaurant)

MENU TESTS:
- menuTests.getMenuByRestaurant(1)
- menuTests.createMenuItem(sampleMenuItem)
- menuTests.updateMenuItem(1, updatedData)
- menuTests.deleteMenuItem(1)

QUICK TESTS:
- quickTests.testRestaurantWorkflow()
- quickTests.testMenuWorkflow(1) // Pass restaurant ID
- quickTests.runAllTests()

SAMPLE DATA:
- sampleRestaurant: Ready-to-use restaurant data
- sampleMenuItem: Ready-to-use menu item data

USAGE EXAMPLES:
1. Test basic functionality:
   quickTests.runAllTests()

2. Get all restaurants:
   restaurantTests.getAllRestaurants()

3. View menu for restaurant ID 1:
   menuTests.getMenuByRestaurant(1)

4. Create a new restaurant:
   restaurantTests.createRestaurant(sampleRestaurant)

Note: Make sure your restaurant service is running on localhost:8081
`);

// Export for easy access
window.restaurantTests = restaurantTests;
window.menuTests = menuTests;
window.quickTests = quickTests;
window.sampleRestaurant = sampleRestaurant;
window.sampleMenuItem = sampleMenuItem;