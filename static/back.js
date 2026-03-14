import { redrawPendingOrders, redrawCompletedOrders } from './common.js'
import { NextOrderNumber } from './next_order_number.js';

const HttpStatus = {
	OK: 200,
	NO_CONTENT: 204,
	NOT_FOUND: 404
}

/** @type {NextOrderNumber} */
let nextOrderNumber;

/** Fetches all orders from the servers. */
async function getOrders() {
	const response = await window.fetch('/orders');
	await handleResponse(response);
}

/** Add pending order.
 * @param {Number} orderNumber
 */
async function addOrder(orderNumber) {
	const url = '/add';
	const method = 'POST';
	const response = await window.fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ 'order_number': orderNumber })
	});
	switch (response.status) {
	case HttpStatus.OK:
		await handleResponse(response);
		break;
	default:
		throw new Error(
			`Status ${response.status} not implemented for ${method} ${url}`
		);
	}
}

/** Complete pending order.
 * @param {Number} orderId
 */
async function completeOrder(orderId) {
	const url = '/complete';
	const method = 'POST';
	const response = await window.fetch(url, {
		method: method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ 'order_id': orderId })
	});
	switch (response.status) {
	case HttpStatus.OK:
		await handleResponse(response);
		break;
	case HttpStatus.NOT_FOUND:
		throw new Error(
			`Server found no order with id ${orderId} to complete`
		);
	default:
		throw new Error(
			`Status ${response.status} not implemented for ${method} ${url}`
		);
	}
}

/** Changes the status of an order from completed back to pending.
 * @param {Number} orderId
 */
async function redoOrder(orderId) {
	const url = '/redo';
	const method = 'POST';
	const response = await window.fetch(url, {
		method: method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ 'order_id': orderId })
	});
	switch (response.status) {
	case HttpStatus.OK:
		await handleResponse(response);
		break;
	case HttpStatus.NOT_FOUND:
		throw new Error(
			`Server found no order with id ${orderId} to redo`
		);
	default:
		throw new Error(
			`Status ${response.status} not implemented for ${method} ${url}`
		);
	}
}

/** Removes all completed orders. */
async function removeCompletedOrders() {
	const url = '/completed-orders'
	const method = 'DELETE';
	const response = await window.fetch(url, { method: method });
	switch (response.status) {
	case HttpStatus.OK:
		await handleResponse(response);
		break;
	case HttpStatus.NO_CONTENT:
		// Do nothing since nothing was removed.
		break;
	default:
		throw new Error(
			`Status ${response.status} not implemented for ${method} ${url}`
		);
	}
}

/** Redraws returned orders and sets the next order number.
 * @param {Response} response - HTTP response.
 */
async function handleResponse(response) {
	const json = await response.json();
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

/** Initialize keypad. */
function initializeKeypad() {
	// Initialize digit buttons.
	for (const button of document.querySelectorAll('.keypad .digit')) {
		const digit = Number(button.textContent);
		button.addEventListener('click', () => {
			nextOrderNumber.appendDigit(digit)
		});
	}
	// Initialize clear button.
	document.querySelector('.keypad .clear').addEventListener('click', () => {
		nextOrderNumber.clear();
	});
	// Initialize add button.
	document.querySelector('.keypad .add').addEventListener('click', () => {
		const orderNumber = nextOrderNumber.get_and_increment();
		// Add order, if valid.
		if (orderNumber != null) {
			addOrder(orderNumber);
		}
	});
}

// Initialize page.
window.addEventListener('load', async () => {
	// Enable removing all completed orders.
	document.querySelector('#remove-completed').addEventListener('click', () => {
		removeCompletedOrders();
	});

	await getOrders();

	const nextOrderNumberElement = document.querySelector('#next-order-number');
	nextOrderNumber = new NextOrderNumber(nextOrderNumberElement);

	initializeKeypad();
});
