require("dotenv").config();
const db = require("../db");
const {
  get_entity,
  get_entities_paginate,
  get_user_with_sub,
} = require("../functions/dbFunctions");

// Constants
const entityKey = "Boat";
const boats_path = "/boats";
const base_path = process.env.BASE_PATH;

// GET / - retrieve all boats with pagination
module.exports.boats_get = async (req, res) => {
  const [boats, cursor, count] = await get_entities_paginate(
    entityKey,
    req.auth.sub,
    req.query?.cursor
  );
  if (cursor) {
    next = base_path + boats_path + "?cursor=" + cursor;
    res.status(200).json({ boats, next, count });
  } else {
    res.status(200).json({ boats, count });
  }
};

// GET /:boatId- a single boat by ID
module.exports.boat_get = async (req, res) => {
  const boat = await get_entity(entityKey, req.params.boatId);
  if (boat === undefined) {
    res.status(404).json({ Error: "No boat with this ID exists" });
  } else if (boat.owner !== req.auth.sub) {
    res.status(403).json({ Error: "You are not the owner of this boat" });
  } else {
    res.status(200).json({ id: req.params.boatId, ...boat });
  }
};

// POST / - Create new boat
module.exports.create_boat = async (req, res) => {
  const newKey = db.datastore.key(entityKey);
  const boatData = { ...req.body, owner: req.auth.sub, loads: [] };

  // Save to initialize ID; generate path; save again to add path
  await db.datastore.save({ key: newKey, data: boatData });
  boatData.self = base_path + boats_path + "/" + newKey.id;
  await db.datastore.save({ key: newKey, data: boatData });

  // Add boat to user's boats array
  const user = await get_user_with_sub(req.auth.sub);
  user.boats.push({ id: newKey.id, self: boatData.self });
  await db.datastore.save(user);

  res.status(201).json({ id: newKey.id, ...boatData });
};

// PUT /:boatId/loads/:loadId - add load to boat
module.exports.assign_load_to_boat = async (req, res) => {
  const boat = await get_entity(entityKey, req.params.boatId);
  const load = await get_entity("Load", req.params.loadId);
  if (boat === undefined || load === undefined) {
    res
      .status(404)
      .json({ Error: "The specified boat and/or load does not exist" });
  } else if (load.carrier) {
    res
      .status(403)
      .json({ Error: "The load is already loaded on another boat" });
  } else if (boat.owner != req.auth.sub) {
    res.status(403).json({ Error: "You are not the owner of this boat" });
  } else {
    boat.loads.push({ id: req.params.loadId, self: load.self });
    await db.datastore.save(boat);
    load.carrier = { id: req.params.boatId, name: boat.name, self: boat.self };
    await db.datastore.save(load);
    res.status(204).send();
  }
};

// DELETE /:boatId/loads/:loadId - remove load from boat
module.exports.remove_load_from_boat = async (req, res) => {
  const boat = await get_entity(entityKey, req.params.boatId);
  const load = await get_entity("Load", req.params.loadId);
  if (boat === undefined || load === undefined) {
    res.status(404).json({
      Error:
        "No boat with this boat_id is loaded with the load with this load_id",
    });
  } else if (boat.owner != req.auth.sub) {
    res.status(403).json({ Error: "You are not the owner of this boat" });
  } else if (
    // If the current boat's array of loads does NOT contain this load ID
    boat.loads.length === 0
  ) {
    res.status(404).json({
      Error:
        "No boat with this boat_id is loaded with the load with this load_id",
    });
  } else {
    boat.loads = boat.loads.filter((load) => load.id != req.params.loadId);
    await db.datastore.save(boat);
    load.carrier = null;
    await db.datastore.save(load);
    res.status(204).send();
  }
};

// DELETE /:boatId - delete a given boat
module.exports.delete_boat = async (req, res) => {
  const boat = await get_entity(entityKey, req.params.boatId);
  if (boat === undefined) {
    res.status(404).json({ Error: "No boat with this boat_id exists" });
  } else if (boat.owner != req.auth.sub) {
    res.status(403).json({ Error: "You are not the owner of this boat" });
  } else {
    // Handle load unassignment
    boat.loads.forEach(async (load_stub) => {
      const load = await get_entity("Load", load_stub.id);
      load.carrier = null;
      await db.datastore.save(load);
    });
    // Handle removal of boat from user's boats array
    const user = await get_user_with_sub(boat.owner);
    user.boats = user.boats.filter(
      (boat_stub) => boat_stub.id != req.params.boatId
    );
    await db.datastore.save(user);
    // Handle boat delete
    const boatKey = db.datastore.key([
      entityKey,
      parseInt(req.params.boatId, 10),
    ]);
    await db.datastore.delete(boatKey);
    res.status(204).send();
  }
};
