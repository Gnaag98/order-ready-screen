/** Redraws visual of pending orders.
 * @param {Object.<number, Object.<string, Number>>} pendingOrders - keys: order ids, values: orders.
 */
export function redrawPendingOrders(pendingOrders) {
	redrawOrders(pendingOrders, 'pending');
}

/** Redraws visual of completed orders.
 * @param {Object.<number, Object.<string, Number>>} completedOrders - keys: order ids, values: orders.
 */
export function redrawCompletedOrders(completedOrders) {
	redrawOrders(completedOrders, 'completed');
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
