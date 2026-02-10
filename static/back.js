let pendingOrders = [];

let nextAvailableNumber = 0;

/** Redraws visual of pending orders. */
function redrawPendingOrders() {
	const orders_element = document.getElementById('pending-orders');
	// Clear list.
	orders_element.textContent = '';
	// Repopulate list.
	for (let order of pendingOrders) {
		const order_element = document.createElement('li');
		order_element.textContent = order;
		orders_element.appendChild(order_element);
	}
}

/** Handes response of adding/listing orders. */
function handleResponse(json) {
	pendingOrders = json['pending_orders'];
	nextAvailableNumber = json['next_available_number'];
	redrawPendingOrders();
}

// Redraw pending orders on load.
window.addEventListener('load', () => {
	window.fetch('/list')
	.then(response => response.json())
	.then(json => {
		handleResponse(json);
	})
	.catch(error => console.error(error));
});

// Button to add new order and refresh list of pending orders.
const button = document.getElementById('add');
button.addEventListener('click', () => {
	window.fetch('/add', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ 'order': nextAvailableNumber++ })
	})
	.then(response => response.json())
	.then(json => {
		handleResponse(json);
	})
	.catch(error => console.error(error));
});
