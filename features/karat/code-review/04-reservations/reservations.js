// Block 1 exhibit, JS edition of the reported Java task:
// "Sometimes getReservationTime() returns null for a reservation that was
//  already stored. The reservations map was not re-created, cleaned or
//  re-populated in any way. Explain why this could be happening."
// Run it: node reservations.js

class Reservation {
  constructor(id, name, personCount) {
    this.id = id;           // immutable
    this.name = name;       // mutable — customers rename reservations
    this.personCount = personCount; // mutable — party size changes
  }
}

class Restaurant {
  constructor() {
    this.reservations = new Map();
  }

  // "hash" the reservation so equal-looking reservations share a key
  key(reservation) {
    return reservation.name + ':' + reservation.personCount;
  }

  makeReservation(reservation, hour) {
    this.reservations.set(this.key(reservation), hour);
  }

  getReservationTime(reservation) {
    var hour = this.reservations.get(this.key(reservation));
    return hour === undefined ? null : hour;
  }
}

const restaurant = new Restaurant();
const reservation = new Reservation('a1', 'Anton', 2);

restaurant.makeReservation(reservation, 18);
console.log('right after storing:', restaurant.getReservationTime(reservation)); // 18

reservation.personCount = 4; // two friends join — a perfectly normal update

console.log('after party grows:  ', restaurant.getReservationTime(reservation)); // null ?!
console.log('entries in the map: ', restaurant.reservations.size); // still 1 — nothing was deleted
