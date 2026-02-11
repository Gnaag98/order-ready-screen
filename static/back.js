import { redrawPendingOrders } from './common.js'

let pendingOrders = [];

let nextAvailableNumber = 0;

/** Redraws returned orders and sets the next order number. */
function handleResponse(json) {
	pendingOrders = json['pending_orders'];
	nextAvailableNumber = json['next_available_number'];
	redrawPendingOrders(pendingOrders);
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
