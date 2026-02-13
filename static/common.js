/** Redraws visual of pending orders. */
export function redrawPendingOrders(pendingOrders) {
	redrawOrders(pendingOrders, 'pending');
}

/** Redraws visual of completed orders. */
export function redrawCompletedOrders(completedOrders) {
	redrawOrders(completedOrders, 'completed');
}

/** Redraws visual of either pending or completed orders. */
function redrawOrders(orders, order_status) {
	const orders_element = document.querySelector(`#${order_status}-orders`);
	const order_template = document.querySelector('#order');
	// Clear list.
	orders_element.textContent = '';
	// Repopulate list.
	for (const [id, number] of Object.entries(orders)) {
		const order_clone = document.importNode(order_template.content, true);
		const order_element = order_clone.querySelector('.order');
		order_element.dataset.id = id;
		order_element.textContent = number;
		order_element.classList.add(`${order_status}`);
		orders_element.appendChild(order_clone);
	}
}
