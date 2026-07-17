// Used for drag-and-drop using interact().
import '../node_modules/interactjs/dist/interact.min.js';

import { NextOrderNumber } from './next_order_number.js';

const HttpStatus = {
	OK: 200,
	NO_CONTENT: 204,
	NOT_FOUND: 404
}

// Position used during drag events to reposition the dragged element.
const drag_position = { x: 0, y: 0 }

/** @type {NextOrderNumber} */
let nextOrderNumber;

/** Fetches all orders from the servers. */
async function getOrders() {
	const response = await window.fetch('/orders');
	await handleResponse(response);
}

/** Add pending order.
 * @param {Number} orderNumber
 * @param {Number} orderColor
 */
async function addOrder(orderNumber, orderColor) {
	const url = '/add';
	const method = 'POST';
	const response = await window.fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			'order_number': orderNumber, 'order_color': orderColor
		})
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

/** Removes an order specified by id.
 * @param {Number} orderId
 */
async function removeOrder(orderId) {
	const url = `/order/${orderId}`
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

/** Redraws visual of either pending or completed orders.
 * @param {Object.<number, Object.<string, Number>>} orders - either pending or completed orders.
 * @param {string} orderStatus - either 'pending' or 'completed'.
 */
function redrawOrders(orders, orderStatus) {
	const ordersElement = document.querySelector(`#${orderStatus}-orders`);
	const orderTemplate = document.querySelector('#order');
	// Clear lists.
	for (const listElement of ordersElement.querySelectorAll('.orders')) {
		listElement.textContent = '';
	}
	// Repopulate list.
	for (const [id, order] of Object.entries(orders)) {
		const number = order.number;
		const color = order.color;
		const listElement = ordersElement.querySelector(`[data-color="${color}"`);
		const orderClone = document.importNode(orderTemplate.content, true);
		const orderElement = orderClone.querySelector('.order');
		orderElement.dataset.id = id;
		orderElement.dataset.status = orderStatus;
		orderElement.textContent = number;
		listElement.appendChild(orderClone);
	}
}

/** Redraws returned orders and sets the next order number.
 * @param {Response} response - HTTP response.
 */
async function handleResponse(response) {
	const json = await response.json();
	const pendingOrders = json['pending_orders'];
	const completedOrders = json['completed_orders'];
	redrawOrders(pendingOrders, 'pending');
	redrawOrders(completedOrders, 'completed');
	makeOrdersInteractive();
}

/** Adds the ability to click on an order to change its status. */
function makeOrdersInteractive() {
	const pendingOrderElements = document.querySelectorAll(
		'.order[data-status=pending]'
	);
	for (const orderElement of pendingOrderElements) {
		orderElement.addEventListener('click', () => {
			// Prevent click if element was just dragged.
			if (orderElement.dataset.dragged !== "true") {
				const orderId = Number(orderElement.dataset.id);
				completeOrder(orderId);
			}
		});
	}
	const completedOrderElements = document.querySelectorAll(
		'.order[data-status=completed]'
	);
	for (const orderElement of completedOrderElements) {
		orderElement.addEventListener('click', () => {
			if (orderElement.dataset.dragged !== "true") {
				const orderId = Number(orderElement.dataset.id);
				redoOrder(orderId);
			}
		});
	}
}

/** Initialize buttons to select order color. */
function initializeColorButtons() {
	for (const button of document.querySelectorAll('.color')) {
		button.addEventListener('click', () => {
			const active = document.querySelector('.color.active');
			active.classList.remove('active');
			button.classList.add('active');
			// Swap to the numbering of the new color.
			const color = Number(button.dataset.color);
			const orderElements = document.querySelectorAll(
				`#pending-orders .orders[data-color="${color}"] .order`
			);
			if (orderElements.length > 0) {
				let latestOrderElement = orderElements[0];
				for (const orderElement of orderElements) {
					if (Number(orderElement.dataset.id) > Number(latestOrderElement.dataset.id)) {
						latestOrderElement = orderElement;
					}
				}
				const latestOrderNumber = Number(latestOrderElement.textContent);
				// TODO: Use a NextOrderNumber instance per color, since this
				// will stop working when orders are completed.
				nextOrderNumber.set(latestOrderNumber + 1);
			} else {
				nextOrderNumber.clear();
			}
		});
	}
}

/** Creates sections to sort orders by color into. */
function createColorSections() {
	const sectionTemplate = document.querySelector('#color-section');
	const colorElements = document.querySelectorAll('.color');
	for (const orderStatus of ['pending', 'completed']) {
		const ordersElement = document.querySelector(`#${orderStatus}-orders`);
		// Add section per color.
		for (const colorElement of colorElements) {
			const orderClone = document.importNode(sectionTemplate.content, true);
			const listElement = orderClone.querySelector('ul');
			listElement.dataset.color = colorElement.dataset.color;
			ordersElement.appendChild(listElement);
		}
	}
}

/** Initialize order coloring. */
function initializeColors() {
	initializeColorButtons();
	createColorSections();
}

/** Initialize keypad. */
function initializeKeypad() {
	// Initialize digit buttons.
	for (const button of document.querySelectorAll('.keys .digit')) {
		const digit = Number(button.textContent);
		button.addEventListener('click', () => {
			nextOrderNumber.appendDigit(digit)
		});
	}
	// Initialize clear button.
	document.querySelector('.keys .clear').addEventListener('click', () => {
		nextOrderNumber.clear();
	});
	// Initialize add button.
	document.querySelector('.keys .add').addEventListener('click', () => {
		const orderNumber = nextOrderNumber.get_and_increment();
		// Add order, if valid.
		if (orderNumber != null) {
			const colorElement = document.querySelector('.color.active');
			const orderColor = Number(colorElement.dataset.color);
			addOrder(orderNumber, orderColor);
		}
	});
}

// Initialize page.
window.addEventListener('load', async () => {
	// Enable removing all completed orders.
	document.querySelector('#remove-completed').addEventListener('click', () => {
		removeCompletedOrders();
	});

	initializeColors();
	initializeKeypad();

	await getOrders();

	const nextOrderNumberElement = document.querySelector('#next-order-number');
	nextOrderNumber = new NextOrderNumber(nextOrderNumberElement);

	interact('.draggable').draggable({
		listeners: {
			start (event) {
				event.target.dataset.dragged="true";
			},
			move (event) {
				drag_position.x += event.dx;
				drag_position.y += event.dy;
				event.target.style.transform =
					`translate(${drag_position.x}px, ${drag_position.y}px)`;
			},
			end (event) {
				drag_position.x = 0;
				drag_position.y = 0;
				event.target.style.transform =
					`translate(${drag_position.x}px, ${drag_position.y}px)`;

				// Delay deactivating dragging status to prevent click event.
				setTimeout(() => event.target.dataset.dragged="false", 100);
			}
		}
	});

	interact('#drop-zone').dropzone({
		ondragenter: function (event) {
			// Highlight drop zone.
			const dropZoneElement = event.target;
			dropZoneElement.classList.add('hover');
			// Backup text content before modifying.
			const textElement = dropZoneElement.querySelector('p');
			textElement.dataset.text = textElement.textContent;
			textElement.textContent = 'Remove order';
		},
		ondragleave: function (event) {
			// Stop highlighting drop zone.
			const dropZoneElement = event.target;
			dropZoneElement.classList.remove('hover');
			// Reset text content.
			const textElement = dropZoneElement.querySelector('p');
			textElement.textContent = textElement.dataset.text;
		},
		ondrop: function (event) {
			const orderElement = event.relatedTarget;
			// Hide order to prevent order reappearing where if was picked.
			orderElement.style.visibility = 'hidden';
			// Remove order.
			const orderId = Number(orderElement.dataset.id);
			removeOrder(orderId);
			// Stop highlighting drop zone.
			const dropZoneElement = event.target;
			dropZoneElement.classList.remove('hover');
			// Reset text content.
			const textElement = dropZoneElement.querySelector('p');
			textElement.textContent = textElement.dataset.text;
		}
	})
});
