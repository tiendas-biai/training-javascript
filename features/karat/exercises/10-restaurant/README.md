# Exercise 10: Restaurant

## Question

A `Reservation` has an **immutable** `id` and **mutable** fields (`name`,
`personCount`) that may change *after* the reservation has been stored.

Implement the `Restaurant` class so that:

- `makeReservation(reservation, hour)` stores the reservation's hour.
- `getReservationTime(reservation)` returns the stored hour for that
  reservation — and keeps working **even after the reservation's mutable fields
  have changed**.
- `getReservationTime(reservation)` returns `undefined` for a reservation that
  was never stored.

### Example

```js
const restaurant = new Restaurant()
const reservation = new Reservation('a1', 'Anton', 2)

restaurant.makeReservation(reservation, 18)
reservation.personCount = 4 // a mutable field changes

restaurant.getReservationTime(reservation) // => 18  (must still resolve)
```
