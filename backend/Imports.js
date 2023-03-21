const { MongoClient } = require("mongodb");
const { flights, reservations } = require("./data");
require("dotenv").config();
const assert = require("assert");

//retrieve uri
const { MONGO_URI } = process.env;

// mongoDb connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//have to break down the flights object into an array of objects
const plane = Object.keys(flights).map((f) => {
  return {
    _id: f,
    flight: f,
    seats: flights[f],
  };
});

//async handle batch import
const batchImport = async () => {
  //use const to create a new client with uri and options
  const Client = new MongoClient(MONGO_URI, options);

  try {
    //connect to cluster
    await Client.connect();

    //get reference to the flights in database
    const db = Client.db("Slingair");
    const flightsCollections = db.collection("Flights");
    const reservationsCollections = db.collection("Reservations");

    //insert flight data into collection
    const result = await flightsCollections.insertMany(plane);

    // assert  the the number of docs matches the length flights array
    assert.equal(plane.length, result.insertedCount);

    // //put reservations into collection
    await reservationsCollections.insertMany(reservations);

    //messages
    console.log("success");
  } catch (err) {
    console.log(err.message);
  }
};

//call batchImport
batchImport();
