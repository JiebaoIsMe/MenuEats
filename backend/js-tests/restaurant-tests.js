// Restaurant Service CRUD Tests
const BASE_URL = 'http://localhost:8080/restaurants';

// CREATE
async function create() {
    const restaurant = {
        name: "Demo Restaurant",
        location: "123 Demo Street", 
        ownerId: 1
    };
    
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurant)
    });
    
    console.log('CREATE:', await response.text());
}

// READ ALL
async function readAll() {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    console.log('READ ALL:', data);
    return data;
}

// READ ONE
async function readOne(id = 1) {
    const response = await fetch(`${BASE_URL}/${id}`);
    const data = await response.json();
    console.log('READ ONE:', data);
    return data;
}

// UPDATE
async function update(id = 1) {
    const restaurant = {
        id: id,
        name: "Updated Restaurant",
        location: "Updated Location",
        ownerId: 1
    };
    
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurant)
    });
    
    console.log('UPDATE:', await response.text());
}

// DELETE
async function deleteOne(id = 1) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
    });
    
    console.log('DELETE:', await response.text());
}

// DEMO - Run all operations
async function demo() {
    console.log('=== Restaurant CRUD Demo ===');
    await create();
    await readAll();
    await readOne(1);
    await update(1);
    await readOne(1);
    await deleteOne(1);
    await readAll();
    console.log('=== Demo Complete ===');
}

console.log('Functions: create(), readAll(), readOne(id), update(id), deleteOne(id), demo()');