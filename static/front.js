import { redrawPendingOrders, redrawCompletedOrders } from './common.js'

/** Redraws returned orders. */
function handleResponse(json) {
	const pendingOrders = json['pending_orders'];
	const completedOrders = json['completed_orders'];
	redrawPendingOrders(pendingOrders);
	redrawCompletedOrders(completedOrders);
}

/** Fetches list of orders. */
function list() {
	window.fetch('/list')
	.then(response => response.json())
	.then(json => {
		handleResponse(json);
	})
	.catch(error => console.error(error));
}

// Fetch orders repeatedly, first on load.
window.addEventListener('load', () => {
	list();
	window.setInterval(list, 1000);
});
