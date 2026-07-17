from dataclasses import dataclass

from flask import Flask, render_template, request


@dataclass
class Order:
	number: int
	color: int


HTTP_STATUS_NO_CONTENT = 204
HTTP_STATUS_NOT_FOUND = 404

app = Flask(__name__)

# Order IDs are used as keys to allow for duplicate order numbers.
pending_orders: dict[int, Order] = {}
completed_orders: dict[int, Order] = {}
next_available_order_id: int = 0


def get_common_response():
	"""Returns both pending and completed orders."""
	return {
		'pending_orders': pending_orders,
		'completed_orders': completed_orders
	}


@app.route('/front')
def front():
	"""Front-of-House (FOH), i.e. restaurant side.

	This view shows order numbers of both in-progress and ready items.
	"""
	return render_template('front.html')


@app.route('/back')
def back():
	"""Back-of-House (BOH), i.e. kitchen side.

	This view is used to add, edit and remove order numbers.
	"""
	return render_template('back.html')


@app.get('/orders')
def get_orders():
	"""Returns a list of pending and completed orders."""
	return get_common_response()

@app.delete('/order/<int:order_id>')
def remove_order(order_id):
	"""Removes the order specified by id."""

	print('before:', pending_orders, completed_orders)

	removed_id = None
	print(removed_id)
	# Try to remove a pending order.
	removed_id = pending_orders.pop(order_id, None)
	print(removed_id)
	# Try to remove a completed order if no pending order was removed.
	if removed_id is None:
		removed_id = completed_orders.pop(order_id, None)
	print(removed_id)

	print('after:', pending_orders, completed_orders)
	if removed_id is not None:
		return get_common_response()
	else:
		# No action needed by the client since nothing was removed.
		return '', HTTP_STATUS_NO_CONTENT


@app.delete('/completed-orders')
def remove_completed_orders():
	"""Removes all completed orders."""
	if completed_orders:
		completed_orders.clear()
		return get_common_response()
	else:
		# No action needed by the client since nothing was removed.
		return '', HTTP_STATUS_NO_CONTENT


@app.post('/add')
def add_order():
	"""Creates a pending order with the given order number."""
	global next_available_order_id
	order_id = next_available_order_id
	next_available_order_id += 1
	order_number = int(request.json['order_number'])
	order_color = int(request.json['order_color'])
	order = Order(order_number, order_color)
	pending_orders[order_id] = order
	return get_common_response()


@app.post('/complete')
def complete_order():
	"""Moves the order with matching id from pending to completed."""
	order_id = int(request.json['order_id'])
	if order_id in pending_orders:
		order = pending_orders[order_id]
		del pending_orders[order_id]
		completed_orders[order_id] = order
		return get_common_response()
	else:
		return (
			f'No pending order with id {order_id} found',
			HTTP_STATUS_NOT_FOUND)


@app.post('/redo')
def redo_order():
	"""Moves the order with matching id from completed to pending."""
	order_id = int(request.json['order_id'])
	if order_id in completed_orders:
		order = completed_orders[order_id]
		del completed_orders[order_id]
		pending_orders[order_id] = order
		return get_common_response()
	else:
		return (
			f'No completed order with id {order_id} found',
			HTTP_STATUS_NOT_FOUND)
