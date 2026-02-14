import { redrawPendingOrders, redrawCompletedOrders } from './common.js'

const HttpStatus = {
	OK: 200,
	NO_CONTENT: 204,
	NOT_FOUND: 404
}

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

/** Fetches all orders from the servers. */
function getOrders() {
	window.fetch('/orders')
	.then(response => response.json())
	.then(json => {
		handleResponse(json);
		const pendingOrders = json['pending_orders'];
		const completedOrders = json['completed_orders'];
		// Move this to onload.
		setNextAvailableOrderNumber(pendingOrders, completedOrders);
	})
	.catch(error => console.error(error));
}

/** Add pending order. */
function addOrder() {
	const url = '/add';
	const method = 'POST';
	window.fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ 'order_number': nextAvailableOrderNumber++ })
	})
	.then(response => {
		switch (response.status) {
		case HttpStatus.OK:
			return response.json().then(json => handleResponse(json));
		default:
			throw new Error(
				`Status ${response.status} not implemented for ${method} ${url}`
			);
		}
	})
	.catch(error => console.error(error));
}

/** Complete pending order. */
function completeOrder(orderId) {
	const url = '/complete';
	const method = 'POST';
	window.fetch(url, {
		method: method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ 'order_id': orderId })
	})
	.then(response => {
		switch (response.status) {
		case HttpStatus.OK:
			return response.json().then(json => handleResponse(json));
		case HttpStatus.NOT_FOUND:
			throw new Error(
				`Server found no order with id ${orderId} to complete`
			);
		default:
			throw new Error(
				`Status ${response.status} not implemented for ${method} ${url}`
			);
		}
	})
	.catch(error => console.error(error));
}

/** Changes the status of an order from completed back to pending. */
function redoOrder(orderId) {
	const url = '/redo';
	const method = 'POST';
	window.fetch(url, {
		method: method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ 'order_id': orderId })
	})
	.then(response => {
		switch (response.status) {
		case HttpStatus.OK:
			return response.json().then(json => handleResponse(json));
		case HttpStatus.NOT_FOUND:
			throw new Error(
				`Server found no order with id ${orderId} to redo`
			);
		default:
			throw new Error(
				`Status ${response.status} not implemented for ${method} ${url}`
			);
		}
	})
	.catch(error => console.error(error));
}

/** Removes all completed orders. */
function removeCompletedOrders() {
	const url = '/completed-orders'
	const method = 'DELETE';
	window.fetch(url, { method: method })
	.then(response => {
		switch (response.status) {
		case HttpStatus.OK:
			return response.json().then(json => handleResponse(json));
			case HttpStatus.NO_CONTENT:
			// Do nothing since nothing was removed.
			break;
		default:
			throw new Error(
				`Status ${response.status} not implemented for ${method} ${url}`
			);
		}
	})
	.catch(error => console.error(error));
}

/** Redraws returned orders and sets the next order number. */
function handleResponse(json) {
	const pendingOrders = json['pending_orders'];
	const completedOrders = json['completed_orders'];
	redrawPendingOrders(pendingOrders);
	redrawCompletedOrders(completedOrders);
	makeOrdersInteractive();
}

/** Adds the ability to click on an order to change its status. */
function makeOrdersInteractive() {
	const pendingOrderElements = document.querySelectorAll(
		'.order[data-status=pending]'
	);
	for (const orderElement of pendingOrderElements) {
		orderElement.addEventListener('click', () => {
			const orderId = Number(orderElement.dataset.id);
			completeOrder(orderId);
		});
	}
	const completedOrderElements = document.querySelectorAll(
		'.order[data-status=completed]'
	);
	for (const orderElement of completedOrderElements) {
		orderElement.addEventListener('click', () => {
			const orderId = Number(orderElement.dataset.id);
			redoOrder(orderId);
		});
	}
}

// Redraw pending orders on load.
window.addEventListener('load', () => {
	getOrders();
});

// Enable adding a new pending order.
document.querySelector('#add').addEventListener('click', () => {
	addOrder();
});

// Enable removing all completed orders.
document.querySelector('#remove-completed').addEventListener('click', () => {
	removeCompletedOrders();
});
