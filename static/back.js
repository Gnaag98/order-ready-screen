let pendingOrders = [];

let nextOrder = 0;

// Add new order and refresh list of pending orders.
const button = document.getElementById('add');
button.addEventListener('click', () => {
	window.fetch('/add', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ 'order': nextOrder++ })
	})
	.then(response => response.json())
	.then(json => {
		// Refresh list of pending orders.
		const orders_element = document.getElementById('pending-orders');
		orders_element.textContent = '';
		pendingOrders = json['pending_orders'];
		for (let order of pendingOrders) {
			const order_element = document.createElement('li');
			order_element.textContent = order;
			orders_element.appendChild(order_element);
		}
	})
	.catch(error => console.error(error));
});
