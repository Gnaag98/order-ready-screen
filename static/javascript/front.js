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

/** Redraws visual of either pending or completed orders.
 * @param {Object.<number, Object.<string, Number>>} orders - either pending or completed orders.
 * @param {string} orderStatus - either 'pending' or 'completed'.
 * @param {Number} maxOrderCountPerColor - for each color, don't show more orders than this.
 */
function redrawOrders(orders, orderStatus, maxOrderCountPerColor) {
	const ordersElement = document.querySelector(`#${orderStatus}-orders`);
	const orderTemplate = document.querySelector('#order');
	const hiddenOrderCountTemplate = document.querySelector(
		'#hidden-order-count'
	);
	// Clear lists.
	for (const listElement of ordersElement.querySelectorAll('.orders')) {
		listElement.textContent = '';
	}

	// Sort orders by color.
	let ordersByColor = {}
	for (const [id, order] of Object.entries(orders)) {
		const color = order.color;
		if (!(color in ordersByColor)) {
			ordersByColor[color] = [];
		}
		ordersByColor[color].push({
			id: id,
			order: order
		});
	}

	// Repopulate list.
	for (const [color, orders] of Object.entries(ordersByColor)) {
		const listElement = ordersElement.querySelector(`[data-color="${color}"`);
		// Show newest orders first.
		let orders_reversed = orders.toReversed();
		// Don't show too many orders.
		for (let i = 0; i < Math.min(orders.length, maxOrderCountPerColor); ++i) {
			const id = orders_reversed[i].id
			const number = orders_reversed[i].order.number

			const orderClone = document.importNode(orderTemplate.content, true);
			const orderElement = orderClone.querySelector('.order');
			orderElement.dataset.id = id;
			orderElement.dataset.status = orderStatus;
			orderElement.textContent = number;
			listElement.appendChild(orderClone);
		}
		// Show how many orders were hidden.
		if (orders.length > maxOrderCountPerColor) {
			const hiddenOrderCount = orders.length - maxOrderCountPerColor;
			const hiddenOrderCountClone = document.importNode(
				hiddenOrderCountTemplate.content, true
			);
			const hiddenOrderCountElement = hiddenOrderCountClone.querySelector(
				'.hidden-order-count'
			);
			hiddenOrderCountElement.textContent = `+${hiddenOrderCount}`;
			listElement.appendChild(hiddenOrderCountClone);
		}
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
			redrawOrders(pendingOrders, 'pending', 30);
			redrawOrders(completedOrders, 'completed', 13);
		});
}

// Fetch orders repeatedly, first on load.
window.addEventListener('load', () => {
	getOrders();
	window.setInterval(getOrders, 1000);
});
