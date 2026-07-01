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
    // Key by the IMMUTABLE id, never by mutable fields.
    this.reservations.set(reservation.id, hour)
  }

  getReservationTime(reservation) {
    return this.reservations.get(reservation.id)
  }
}
