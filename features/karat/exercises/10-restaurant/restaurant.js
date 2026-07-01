// TODO: Implement the `Restaurant` class.
//
// A Reservation has an immutable `id` and mutable fields (`name`,
// `personCount`) that may change AFTER the reservation is stored.
//
// Implement Restaurant so that:
//   - makeReservation(reservation, hour) stores the reservation's hour.
//   - getReservationTime(reservation) returns the stored hour for that
//     reservation, and KEEPS WORKING even after the reservation's mutable
//     fields have changed.
//   - getReservationTime returns undefined for a reservation that was never
//     stored.
//
// Run: npm test -- 10-restaurant

export class Reservation {
  constructor(id, name, personCount) {
    this.id = id
    this.name = name
    this.personCount = personCount
  }
}

export class Restaurant {
  constructor() {
    this.reservations = new Map()
  }

  makeReservation(reservation, hour) {
    this.reservations.set(reservation.id,{reservation,hour})
  }

  getReservationTime(reservation) {
    let reservationMap = this.reservations.get(reservation.id)
    if (reservationMap){
      return reservationMap.hour
    } else {
      return undefined;
    }
  }
}
