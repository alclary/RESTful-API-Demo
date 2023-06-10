const { query } = require("express");
const db = require("./db");

const BOAT = "Boat";
const LOAD = "Load";

async function get_boat(id) {
  const key = await db.datastore.key([BOAT, parseInt(id, 10)]);
  const result = await db.datastore.get(key);
  return result[0];
}

async function get_boats(offset, limit) {
  let q = db.datastore.createQuery(BOAT).offset(offset).limit(limit);
  const boats = await db.datastore.runQuery(q);
  return [boats[0].map(db.fromDatastore), boats[1]];
}

async function get_load(id) {
  const key = await db.datastore.key([LOAD, parseInt(id, 10)]);
  const result = await db.datastore.get(key);
  return result[0];
}

async function get_loads(offset, limit) {
  let q = db.datastore.createQuery(LOAD).offset(offset).limit(limit);
  const loads = await db.datastore.runQuery(q);
  return [loads[0].map(db.fromDatastore), loads[1]];
}

async function get_load_w_boat(boatId) {
  const q = db.datastore
    .createQuery(LOAD)
    .filter("current_boat", "=", parseInt(boatId, 10));
  const loads = await db.datastore.runQuery(q);
  return loads[0].map(db.fromDatastore);
}

module.exports = {
  get_boat,
  get_boats,
  get_load,
  get_loads,
  get_load_w_boat,
};
