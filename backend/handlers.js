"use strict";
require("dotenv").config();

// use this package to generate unique ids: https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");
const { MongoClient, ObjectId } = require("mongodb");
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// First
// returns an array of all flight numbers
const getFlights = async (req, res) => {
  //connect to DB
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    //slingair DB
    const db = client.db("Slingair");
    //turn flights into an array
    const flights = await db.collection("Flights").find().toArray();
    //flight numbers to array
    const flightNumbers = flights.map((flight) => flight.flight);

    res.status(200).json({ status: 200, data: flightNumbers });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Flight not found" });
  } finally {
    client.close();
  }
};

//Second
// returns all the seats on a specified flight
const getFlight = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const flight = req.params.flight;

  try {
    // Connect DB
    await client.connect();
    // Get the database
    const db = client.db("Slingair");
    // find flight
    const result = await db.collection("Flights").findOne({ flight });

    if (!result) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.status(200).json({ status: 200, data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.close();
  }
};

//third
// returns all reservations
const getReservations = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    //connect to client
    await client.connect();
    const db = client.db("Slingair");
    //turn reservations into an array
    const reservations = await db.collection("Reservations").find().toArray();
    res.status(200).json({ status: 200, data: reservations });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "No Reservation Found" });
  } finally {
    client.close();
  }
};

//fourth
// returns a single reservation
const getSingleReservation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const reservation = req.params.reservation;

  try {
    // connect to the database
    await client.connect();
    // get a reference to the database
    const db = client.db("Slingair");
    // find the reservation
    const result = await db
      .collection("Reservations")
      .findOne({ _id: reservation });
    // check if the result is null
    if (result === null) {
      return res.status(404).json({ message: "No Reservation Found" });
    }
    // return the reservation
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    // always close the connection
    await client.close();
  }
};

//fifth
// creates a new reservation
const addReservation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const reservation = req.body;
  console.log(reservation);
  const newReservation = {
    _id: reservation.id,
    flight: reservation.selectedFlight,
    seat: reservation.selectedSeat,
    firstName: reservation.givenName,
    lastName: reservation.surname,
    email: reservation.email,
  };

  try {
    //connect to db
    await client.connect();
    //get db
    const db = client.db("Slingair");

    //insert new reservation
    const result = await db
      .collection("Reservations")
      .insertOne(newReservation);
    //updated seat
    const addSeatToFlight = await db.collection("Flights").updateOne(
      {
        _id: reservation.selectedFlight,
        "seats.id": reservation.selectedSeat.toUpperCase(),
      },
      { $set: { "seats.$.isAvailable": false } }
    );

    //return success
    return res
      .status(200)
      .json({ status: 200, message: "Reservation Created", data: result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Seat Not Available" });
  } finally {
    await client.close();
  }
};

//sixth
// updates a specified reservation
const updateReservation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const reservationId = req.body._id;
  const newSeat = req.body.seat;
  const newFlightNum = req.body.flight;

  try {
    //connect to db
    await client.connect();

    //get db
    const db = client.db("Slingair");

    //get old reservation
    const oldReservation = await db
      .collection("Reservations")
      .findOne({ _id: ObjectId(reservationId) });

    //check if seat is available
    const seatQuery = { flight: newFlightNum, seat: newSeat };
    const seatAvailable = await db
      .collection("Reservations")
      .findOne(seatQuery);

    if (seatAvailable) {
      return res
        .status(400)
        .json({ status: 400, message: "Seat Not Available" });
    }

    //update reservation
    const updates = {
      $set: {
        flight: newFlightNum,
        seat: newSeat,
        givenName: req.body.givenName,
        surname: req.body.surname,
      },
    };
    const result = await db
      .collection("Reservations")
      .updateOne({ _id: ObjectId(reservationId) }, updates);
    //update flights/seat
    const oldSeatQuery = {
      flight: oldReservation.flight,
      seat: oldReservation.seat,
    };
    const newSeatQuery = { flight: newFlightNum, seat: newSeat };

    const oldSeatUpdate = { $set: { isAvailable: true } };
    const newSeatUpdate = { $set: { isAvailable: false } };

    const oldSeatUpdateResult = await db
      .collection("Flights")
      .updateOne(oldSeatQuery, oldSeatUpdate);
    const newSeatUpdateResult = await db
      .collection("Flights")
      .updateOne(newSeatQuery, newSeatUpdate);

    // return a success response
    return res
      .status(200)
      .json({ status: 200, message: "Reservation updated" });
  } catch (error) {
    console.log(error);
    // return an error response
    return res.status(500).json({
      message:
        "Something went wrong internally, unable to update your reservation",
    });
  } finally {
    //close the connection
    await client.close();
  }
};

//seventh
// deletes a specified reservation
const deleteReservation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const reservationId = req.params.reservation;

  try {
    //connect to db
    await client.connect();

    //get db
    const db = client.db("Slingair");
    const reservationsCollection = db.collection("Reservations");

    //verify if reservation exists
    const reservation = await reservationsCollection.findOne({
      _id: reservationId,
    });
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    //update corresponding flight document
    const update = {
      $set: { isAvailable: true },
    };
    const fixSeat = await db
      .collection("Flights")
      .updateOne(
        { flightNumber: reservation.flight, "seats.id": reservation.seat },
        update
      );

    //delete
    const result = await reservationsCollection.deleteOne({
      _id: reservationId,
    });

    const flightDelete = await db
      .collection("Flights")
      .updateOne(
        { flightNumber: reservation.flight },
        { $pull: { reservations: reservationId } }
      );

    //return success
    return res
      .status(200)
      .json({ status: 200, message: "Reservation deleted" });
  } catch (error) {
    console.log(error);
    //return error
    return res.status(500).json({ message: "unable to delete" });
  } finally {
    //close
    await client.close();
  }
};

module.exports = {
  getFlights,
  getFlight,
  getReservations,
  addReservation,
  getSingleReservation,
  deleteReservation,
  updateReservation,
};
