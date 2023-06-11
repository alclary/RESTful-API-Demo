const db = require("../db");
const { Datastore } = require("@google-cloud/datastore");

// Datastore entity names
const entitiesPerPage = 5;
const BOAT = "Boat";
const LOAD = "Load";
const USER = "User";

module.exports.get_boat = async (id) => {
  const key = db.datastore.key([BOAT, parseInt(id, 10)]);
  const result = await db.datastore.get(key);
  return result[0];
};

module.exports.get_boats = async (owner, cursor) => {
  let q = db.datastore
    .createQuery(BOAT)
    .filter("owner", "=", owner)
    .limit(entitiesPerPage);
  if (cursor) {
    q = q.start(cursor);
  }

  const results = await db.datastore.runQuery(q);
  const boats = results[0];
  const info = results[1];
  // NOTE: this is broken with datastore emulation; should work in production;
  // see https://github.com/googleapis/google-cloud-node/issues/2846
  if (info.moreResults !== Datastore.NO_MORE_RESULTS) {
    return [boats.map(db.attachId), info.endCursor];
  } else {
    return [boats.map(db.attachId), null];
  }
};

module.exports.get_load = async (id) => {
  const key = db.datastore.key([LOAD, parseInt(id, 10)]);
  const result = await db.datastore.get(key);
  return result[0];
};

// TODO refactor with get_boats above -> get_entities
module.exports.get_loads = async (cursor) => {
  let q = db.datastore.createQuery(LOAD).limit(entitiesPerPage);
  if (cursor) {
    q = q.start(cursor);
  }
  const results = await db.datastore.runQuery(q);
  const loads = results[0];
  const info = results[1];
  // NOTE: this is broken with datastore emulation; should work in production;
  // see https://github.com/googleapis/google-cloud-node/issues/2846
  if (info.moreResults !== Datastore.NO_MORE_RESULTS) {
    return [loads.map(db.attachId), info.endCursor];
  } else {
    return [loads.map(db.attachId), null];
  }
};

// TODO potentially delete
// module.exports.get_load_w_boat = async (boatId) => {
//   const q = db.datastore
//     .createQuery(LOAD)
//     .filter("current_boat", "=", parseInt(boatId, 10));
//   const results = await db.datastore.runQuery(q);
//   return results[0].map(db.attachId);
// };
