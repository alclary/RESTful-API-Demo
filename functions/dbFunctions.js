const db = require("../db");

// Datastore entity names
const BOAT = "Boat";
const LOAD = "Load";
const USER = "User";

module.exports.get_boat = async (id) => {
  const key = db.datastore.key([BOAT, parseInt(id, 10)]);
  const result = await db.datastore.get(key);
  return result[0];
};

module.exports.get_boats = async (offset, limit) => {
  let q = db.datastore.createQuery(BOAT).offset(offset).limit(limit);
  const boats = await db.datastore.runQuery(q);
  return [boats[0].map(db.fromDatastore), boats[1]];
};

module.exports.get_load = async (id) => {
  const key = db.datastore.key([LOAD, parseInt(id, 10)]);
  const result = await db.datastore.get(key);
  return result[0];
};

module.exports.get_loads = async (offset, limit) => {
  let q = db.datastore.createQuery(LOAD).offset(offset).limit(limit);
  const loads = await db.datastore.runQuery(q);
  return [loads[0].map(db.fromDatastore), loads[1]];
};

module.exports.get_load_w_boat = async (boatId) => {
  const q = db.datastore
    .createQuery(LOAD)
    .filter("current_boat", "=", parseInt(boatId, 10));
  const loads = await db.datastore.runQuery(q);
  return loads[0].map(db.fromDatastore);
};
