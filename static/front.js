import { redrawPendingOrders, redrawCompletedOrders } from './common.js';

/** Fetches list of orders. */
function getOrders() {
	window.fetch('/orders')
	.then(response => handleResponse(response))
	.catch(error => console.error(error));
}

/** Creates, or recreates, sections to sort orders by color into.
 * @param {Object.<number, Object.<string, Number>>} orders - pending or completed orders.
 * @param {string} orderStatus - 'pending' or 'completed'.
*/
function recreateColorSections(orders, orderStatus) {
	const sectionTemplate = document.querySelector('#color-section');

	// Get active order colors.
	/**@type {Set.<Number>} */
	const colorSet = new Set();
	for (const [id, order] of Object.entries(orders)) {
		colorSet.add(order.color);
	}
	const colorsSorted = [...colorSet].sort();

	const ordersElement = document.querySelector(`#${orderStatus}-orders`);
	// Clear previous sections, if any.
	ordersElement.textContent = '';
	// Add section per color.
	for (const color of colorsSorted) {
		const orderClone = document.importNode(sectionTemplate.content, true);
		const listElement = orderClone.querySelector('ul');
		listElement.dataset.color = color;
		ordersElement.appendChild(listElement);
	}
}

/** Redraws returned orders.
 * @param {Response} response
 * @returns {Promise<void>}
*/
function handleResponse(response) {
	return response.json()
		.then(json => {
			const pendingOrders = json['pending_orders'];
			const completedOrders = json['completed_orders'];
			recreateColorSections(pendingOrders, 'pending');
			recreateColorSections(completedOrders, 'completed');
			redrawPendingOrders(pendingOrders);
			redrawCompletedOrders(completedOrders);
		});
}

// Fetch orders repeatedly, first on load.
window.addEventListener('load', () => {
	getOrders();
	window.setInterval(getOrders, 1000);
});
