# Order-Ready Screen

And _order-ready screen_ shows a list of orders ready for pickup, and optionally
the orders being prepared. An order ready screen is usully part of a
_Kitchen Display System_ (KDS), which completely replaces paper tickets with a
digital system.

## Context & Limitations

This repo is meant to coexist with a traditional paper ticket system, requiring
the staff to manually enter each order number into the system, mark them as
ready, and manually clearing them from the screen.

## Implementation

This project is implemented as a web server using the Python web framework
Flask.

Two views are used: front and back, facing the customers and staff respectively.
The front view shows the order numbers of both in-progress and ready items, and
the back view is used to add, edit and remove order numbers.
