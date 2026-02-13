import { redrawPendingOrders, redrawCompletedOrders } from './common.js'

let nextAvailableOrderNumber = 0;

/** Sets the next available order number to one higher than the latest order. */
function setNextAvailableOrderNumber(pendingOrders, completedOrders) {
	const orderIds = [
		...Object.keys(pendingOrders), ...Object.keys(completedOrders)
	];
	const orderNumbers = [
		...Object.values(pendingOrders), ...Object.values(completedOrders)
	];
	let currentHighestId = -1;
	orderIds.forEach((id, index) => {
		if (id > currentHighestId) {
			nextAvailableOrderNumber = orderNumbers[index] + 1;
			currentHighestId = id;
		}
	});
}

/** Redraws returned orders and sets the next order number. */
function handleResponse(json) {
	const pendingOrders = json['pending_orders'];
	const completedOrders = json['completed_orders'];
	redrawPendingOrders(pendingOrders);
	redrawCompletedOrders(completedOrders);
}

// Redraw pending orders on load.
window.addEventListener('load', () => {
	window.fetch('/list')
	.then(response => response.json())
	.then(json => {
		handleResponse(json);
		const pendingOrders = json['pending_orders'];
		const completedOrders = json['completed_orders'];
		setNextAvailableOrderNumber(pendingOrders, completedOrders);
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
		body: JSON.stringify({ 'order': nextAvailableOrderNumber++ })
	})
	.then(response => response.json())
	.then(json => {
		handleResponse(json);
	})
	.catch(error => console.error(error));
});
