/** Redraws visual of pending orders. */
export function redrawPendingOrders(pendingOrders) {
	const orders_element = document.getElementById('pending-orders');
	// Clear list.
	orders_element.textContent = '';
	// Repopulate list.
	for (let order of pendingOrders) {
		const order_element = document.createElement('li');
		order_element.textContent = order;
		orders_element.appendChild(order_element);
	}
}
