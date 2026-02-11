/** Redraws visual of pending orders. */
export function redrawPendingOrders(pendingOrders) {
	const orders_element = document.getElementById('pending-orders');
	const order_template = document.getElementById('pending-order');
	// Clear list.
	orders_element.textContent = '';
	// Repopulate list.
	for (let order of pendingOrders) {
		const order_clone = document.importNode(order_template.content, true);
		const order_number_element = order_clone.querySelector('.order');
		order_number_element.textContent = order;
		orders_element.appendChild(order_clone);
	}
}
