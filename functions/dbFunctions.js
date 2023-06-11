const db = require("../db");
const { Datastore } = require("@google-cloud/datastore");

// Datastore entity names
const entitiesPerPage = 5;
// const BOAT = "Boat";
// const LOAD = "Load";
// const USER = "User";

module.exports.get_entity = async (entity, id) => {
  const key = db.datastore.key([entity, parseInt(id, 10)]);
  const result = await db.datastore.get(key);
  return result[0];
};

module.exports.get_entities = async (entity, owner, cursor) => {
  let q = db.datastore.createQuery(entity).limit(entitiesPerPage);
  if (owner) {
    q = q.filter("owner", "=", owner);
  }
  if (cursor) {
    q = q.start(cursor);
  }

  const results = await db.datastore.runQuery(q);
  const entities = results[0];
  const info = results[1];
  // NOTE: this is broken with datastore emulation; should work in production;
  // see https://github.com/googleapis/google-cloud-node/issues/2846
  if (info.moreResults !== Datastore.NO_MORE_RESULTS) {
    return [entities.map(db.attachId), info.endCursor];
  } else {
    return [entities.map(db.attachId), null];
  }
};
