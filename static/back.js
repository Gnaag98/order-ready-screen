import { redrawPendingOrders, redrawCompletedOrders } from './common.js'

const HttpStatus = {
	OK: 200,
	NO_CONTENT: 204,
	NOT_FOUND: 404
}

let nextAvailableOrderNumber = 0;

/** Fetches all orders from the servers. */
function getOrders() {
	window.fetch('/orders')
	.then(response => handleResponse(response))
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
			return handleResponse(response);
		default:
			throw new Error(
				`Status ${response.status} not implemented for ${method} ${url}`
			);
		}
	})
	.catch(error => console.error(error));
}

/** Complete pending order.
 * @param {Number} orderId
 */
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
			return handleResponse(response);
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

/** Changes the status of an order from completed back to pending.
 * @param {Number} orderId
 */
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
			return handleResponse(response);
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
			return handleResponse(response);
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

/** Redraws returned orders and sets the next order number.
 * @param {Response} response - HTTP response.
 * @returns {Promise<void>}
 */
function handleResponse(response) {
	return response.json()
	.then(json => {
		const pendingOrders = json['pending_orders'];
		const completedOrders = json['completed_orders'];
		redrawPendingOrders(pendingOrders);
		redrawCompletedOrders(completedOrders);
		makeOrdersInteractive();
	});
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

/** Sets the next available order number to one higher than the latest order. */
function setNextAvailableOrderNumber() {
	const orderElements = document.querySelectorAll('.order');
	let currentHighestId = -1;
	for (const orderElement of orderElements) {
		const id = orderElement.dataset.id;
		const orderNumber = Number(orderElement.textContent);
		if (id > currentHighestId) {
			nextAvailableOrderNumber = orderNumber + 1;
			currentHighestId = id;
		}
	}
}

// Initialize orders on load.
window.addEventListener('load', () => {
	getOrders();
	setNextAvailableOrderNumber();
});

// Enable adding a new pending order.
document.querySelector('#add').addEventListener('click', () => {
	addOrder();
});

// Enable removing all completed orders.
document.querySelector('#remove-completed').addEventListener('click', () => {
	removeCompletedOrders();
});
