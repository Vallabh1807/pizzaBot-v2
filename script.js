const menu = {
    pizza: [
        { name: "Margherita", basePrice: 200, description: "Classic cheese pizza with fresh tomatoes and basil.", image: "./images/pizzaMargarita.jpg" },
        { name: "Pepperoni", basePrice: 300, description: "Topped with spicy pepperoni and mozzarella cheese.", image: "./images/pizza2.jpg" },
        { name: "BBQ Chicken", basePrice: 350, description: "Grilled chicken with tangy BBQ sauce and red onions.", image: "./images/bbq.jpg" }
    ],
    drinks: [
        { name: "Coke", price: 50, description: "Chilled classic Coca-Cola.", image: "./images/coke.jpeg" },
        { name: "Sprite", price: 50, description: "Refreshing lemon-lime soda.", image: "./images/spritw.jpeg" },
        { name: "Water", price: 20, description: "Bottled still water.", image: "./images/water.jpg" }
    ],
    others: [
        { name: "Garlic Bread", price: 100, description: "Crispy garlic bread topped with butter and herbs.", image: "./images/garlic.jpeg" },
        { name: "Fries", price: 80, description: "Golden fries with a sprinkle of salt.", image: "./images/fries.jpeg" }
    ]
};

let order = {};
let totalPrice = 0;

// Display menu based on category
function showMenu(category) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = ''; // Clear previous items

    menu[category].forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.classList.add('menu-item');
        
        // For Pizza, show size selection
        if (category === 'pizza') {
            menuItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <select class="select-size" id="${item.name}-size">
                        <option value="0">Select Size</option>
                        <option value="1">Small - ₹${item.basePrice}</option>
                        <option value="1.5">Medium - ₹${item.basePrice * 1.5}</option>
                        <option value="2">Large - ₹${item.basePrice * 2}</option>
                    </select>
                    <button onclick="addItemToOrder('${item.name}', ${item.basePrice})">Add</button>
                </div>
            `;
        } else {
            // For Drinks and Others, no size selection
            menuItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <button onclick="addItemToOrder('${item.name}', ${item.price})">Add</button>
                </div>
            `;
        }

        menuContainer.appendChild(menuItem);
    });
}

// Add item to order or increase quantity if it already exists
function addItemToOrder(name, basePrice) {
    let price = basePrice;

    // Only for pizzas, check for size selection
    if (menu.pizza.some(item => item.name === name)) {
        const sizeMultiplier = document.getElementById(`${name}-size`).value;
        if (!sizeMultiplier || sizeMultiplier === "0") {
            alert("Please select a size!");
            return;
        }
        price = basePrice * sizeMultiplier;
    }

    if (order[name]) {
        order[name].quantity += 1;
        order[name].totalPrice += price;
    } else {
        order[name] = {
            quantity: 1,
            price: price,
            totalPrice: price
        };
    }
    updateOrderSummary();
}

// Update order summary with quantity and total price for each item
function updateOrderSummary() {
    const orderList = document.getElementById('order-list');
    const totalPriceElement = document.getElementById('total-price');
    orderList.innerHTML = ''; // Clear previous order list
    totalPrice = 0; // Reset total price

    for (const [name, details] of Object.entries(order)) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${name} x ${details.quantity} = ₹${details.totalPrice}
            <button class="delete-btn" onclick="removeItemFromOrder('${name}')">Delete</button>`;
        orderList.appendChild(listItem);
        totalPrice += details.totalPrice;
    }

    totalPriceElement.textContent = totalPrice;
}

// Remove item from the order
function removeItemFromOrder(name) {
    delete order[name];
    updateOrderSummary();
}

// Confirm order and send back to WhatsApp bot
function confirmOrder() {
    const note = document.getElementById('notes').value;
    let orderDetails = {
        items: [],
        total: totalPrice,
        note: note
    };
    
    for (const [name, details] of Object.entries(order)) {
        orderDetails.items.push({
            name: name,
            quantity: details.quantity,
            price: details.totalPrice
        });
    }

    // Send order details back to Voiceflow bot
    const voiceflowReturnUrl = `https://api.voiceflow.com/runtime/66efc26f425398f11ccf9d46/interact?user_id={user_id}`;
    fetch(voiceflowReturnUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer VF.DM.66f09d078d9312ecde1d7217.aSjIKUevqaBw0Qvp'
        },
        body: JSON.stringify({
            type: 'order',
            orderDetails: orderDetails
        })
    })
    .then(response => {
        if (response.ok) {
            alert('Order sent to bot!');
            window.location.href = 'https://creator.voiceflow.com/project/66efc26f425398f11ccf9d46/canvas/64dbb6696a8fab0013dba194';  // Redirect to the bot's link
        } else {
            alert('Error placing order.');
        }
    });
}


