from flask import Flask, render_template, request

app = Flask(__name__)

pending_orders: list[int] = []
last_added_order: int | None = None


def get_order_response():
	"""Common response to adding/listing orders."""
	next_available_number = (
		last_added_order + 1 if last_added_order is not None else 0)
	return {
		'pending_orders': pending_orders,
		'next_available_number': next_available_number
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


@app.get('/list')
def list_orders():
	return get_order_response()


@app.post('/add')
def add_order():
	print(request.json)
	new_order = int(request.json['order'])
	# TODO: Validate new order.
	pending_orders.append(new_order)
	global last_added_order
	last_added_order = new_order
	return get_order_response()
