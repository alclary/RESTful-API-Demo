require("dotenv").config();
const db = require("../db");
const {
  get_entity,
  get_entities_paginate,
} = require("../functions/dbFunctions");

// Constants
const entityKey = "Boat";
const boats_path = "/boats";
const base_path = process.env.BASE_PATH;

// GET / - retrieve all boats with pagination
module.exports.boats_get = async (req, res) => {
  const [boats, cursor] = await get_entities_paginate(
    entityKey,
    req.auth.sub,
    req.query?.cursor
  );
  if (cursor) {
    next = base_path + boats_path + "?cursor=" + cursor;
    res.status(200).json({ boats, next });
  } else {
    res.status(200).json({ boats });
  }
};

// GET /:boatId- a single boat by ID
module.exports.boat_get = async (req, res) => {
  const boat = await get_entity(entityKey, req.params.boatId);
  if (boat === undefined) {
    res.status(404).json({ Error: "No boat with this ID exists" });
  } else if (boat.owner !== req.auth.sub) {
    res.status(403).json({ Error: "You are not the owner of this boat." });
  } else {
    res.status(200).json({ id: req.params.boatId, ...boat });
  }
};

// POST / - Create new boat
module.exports.create_boat = async (req, res) => {
  const newKey = db.datastore.key(entityKey);
  const boatData = { ...req.body, owner: req.auth.sub };
  // No loads are assigned to the boat at creation
  // TODO implement optional load assignment at creation
  boatData.loads = [];
  // Save first to initialize the new key entry (required for ID)
  await db.datastore.save({ key: newKey, data: boatData });
  // Generate path to boat
  boatData.self = base_path + boats_path + "/" + newKey.id;
  // Save again to add the path to boat under 'self' data key
  await db.datastore.save({ key: newKey, data: boatData });
  res.status(201).json({ id: newKey.id, ...boatData });
};

// PUT /:boatId/loads/:loadId - add load to boat
module.exports.assign_load_to_boat = async (req, res) => {
  const boat = await get_entity(entityKey, req.params.boatId);
  const load = await get_load(req.params.loadId);
  if (boat === undefined || load === undefined) {
    res
      .status(404)
      .json({ Error: "The specified boat and/or load does not exist" });
  } else if (load.carrier) {
    res
      .status(403)
      .json({ Error: "The load is already loaded on another boat" });
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
  const load = await get_load(req.params.loadId);
  if (boat === undefined || load === undefined) {
    res.status(404).json({
      Error:
        "No boat with this boat_id is loaded with the load with this load_id",
    });
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
  } else {
    // Hanlde load unassignment
    boat.loads.forEach(async (load_stub) => {
      const load = await get_load(load_stub.id);
      load.carrier = null;
      await db.datastore.save(load);
    });
    // Handle boat delete
    const boatKey = db.datastore.key([
      entityKey,
      parseInt(req.params.boatId, 10),
    ]);
    await db.datastore.delete(boatKey);
    res.status(204).send();
  }
};
