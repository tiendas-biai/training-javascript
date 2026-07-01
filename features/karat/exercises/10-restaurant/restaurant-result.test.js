import { Restaurant, Reservation } from './restaurant-result'

describe('Restaurant (result)', () => {
  it('returns the stored hour for a reservation', () => {
    const restaurant = new Restaurant()
    const reservation = new Reservation('a1', 'Anton', 2)
    restaurant.makeReservation(reservation, 18)
    expect(restaurant.getReservationTime(reservation)).toBe(18)
  })

  it('still finds the reservation after personCount changes', () => {
    const restaurant = new Restaurant()
    const reservation = new Reservation('a1', 'Anton', 2)
    restaurant.makeReservation(reservation, 18)
    reservation.personCount = 4
    expect(restaurant.getReservationTime(reservation)).toBe(18)
  })

  it('still finds the reservation after name changes', () => {
    const restaurant = new Restaurant()
    const reservation = new Reservation('a1', 'Anton', 2)
    restaurant.makeReservation(reservation, 18)
    reservation.name = 'Antonio'
    expect(restaurant.getReservationTime(reservation)).toBe(18)
  })

  it('returns undefined for a reservation that was never stored', () => {
    const restaurant = new Restaurant()
    expect(
      restaurant.getReservationTime(new Reservation('x', 'Bob', 2))
    ).toBeUndefined()
  })
})
