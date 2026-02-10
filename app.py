from flask import Flask, render_template, request

app = Flask(__name__)

pending_orders: list[int] = []


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
	# TEMP: reset orders on refresh.
	pending_orders.clear()

	return render_template('back.html')


@app.post('/add')
def add():
	json = request.json
	new_order = int(json['order'])
	pending_orders.append(new_order)
	return { 'pending_orders': pending_orders }
