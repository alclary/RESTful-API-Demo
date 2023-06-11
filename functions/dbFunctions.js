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

module.exports.get_entities = async (entity, owner) => {
  let q = db.datastore.createQuery(entity);
  if (owner) {
    q = q.filter("owner", "=", owner);
  }
  const results = await db.datastore.runQuery(q);
  return results[0].map(db.attachId);
};

module.exports.get_entities_paginate = async (entity, owner, cursor) => {
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

module.exports.ensure_user_in_db = async (oidcUserObj) => {
  let q = db.datastore.createQuery("User").filter("sub", "=", oidcUserObj.sub);
  const results = await db.datastore.runQuery(q);
  // User does not exist in database; create new user
  if (results[0].length === 0) {
    const newUser = {
      sub: oidcUserObj.sub,
      email: oidcUserObj.email,
      name: oidcUserObj.name,
    };
    const newUserKey = db.datastore.key("User");
    await db.datastore.save({ key: newUserKey, data: newUser });
    return;
  }
  // User exists in database; do nothing
  return;
};
