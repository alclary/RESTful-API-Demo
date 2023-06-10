require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../db");
const { get_boat, get_load, get_boats } = require("../apiFunctions");
const {
  Validator,
  ValidationError,
} = require("express-json-validator-middleware");
const { Datastore } = require("@google-cloud/datastore");

const BOAT = "Boat";
const boat_paginate = 3;
const base_path = process.env.BASE_PATH;
const boats_path = "/boats";

const boatSchema = {
  type: "object",
  required: ["name", "type", "length"],
  properties: {
    name: {
      type: "string",
    },
    type: {
      type: "string",
    },
    length: {
      type: "integer",
    },
  },
};

// initialize JSONSchema validator
const { validate } = new Validator();

// GET - retrieve all boats with pagination
router.get("/", async (req, res) => {
  // if offset string var provided, use, else 0
  let offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
  const boats = await get_boats(offset, boat_paginate);
  if (boats[1].moreResults !== Datastore.NO_MORE_RESULTS) {
    offset += boat_paginate;
    let next = base_path + boats_path + "?offset=" + offset;
    res.status(200).json({ boats: boats[0], next });
  } else {
    res.status(200).json({ boats: boats[0] });
  }
});

// GET - a single boat by ID
router.get("/:boatId", async (req, res) => {
  const boat = await get_boat(req.params.boatId);
  if (boat === undefined) {
    res.status(404).json({ Error: "No boat with this boat_id exists" });
  } else {
    res.status(200).json({ id: req.params.boatId, ...boat });
  }
});

// GET - get all loads associated with boat
router.get("/:boatId/loads", async (req, res) => {
  const boat = await get_boat(req.params.boatId);
  if (boat === undefined) {
    res.status(404).json({ Error: "No boat with this boat_id exists" });
  } else {
    loads = await Promise.all(
      boat.loads.map(async (load_stub) => {
        const load = await get_load(load_stub.id);
        return {
          item: load.item,
          creation_date: load.creation_date,
          volume: load.volume,
          self: load.self,
        };
      })
    );
    res.status(200).json({
      length: boat.loads.length,
      loads,
    });
  }
});

// POST - Create new boat
router.post("/", validate({ body: boatSchema }), async (req, res) => {
  const newKey = db.datastore.key(BOAT);
  const boatData = { ...req.body };
  // If loads not provided in request, initialized emply list
  if (!boatData.loads) {
    boatData.loads = [];
  }
  // Save first to initialize the new key entry (required for ID)
  await db.datastore.save({ key: newKey, data: boatData });
  // Generate path to boat
  boatData.self = base_path + boats_path + "/" + newKey.id;
  // Save again to add the path to boat under 'self' data key
  await db.datastore.save({ key: newKey, data: boatData });
  res.status(201).json({ id: newKey.id, ...boatData });
});

// PUT - add load to boat
router.put("/:boatId/loads/:loadId", async (req, res) => {
  const boat = await get_boat(req.params.boatId);
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
});

// DELETE - remove load from boat
router.delete("/:boatId/loads/:loadId", async (req, res) => {
  const boat = await get_boat(req.params.boatId);
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
});

// DELETE - delete a given boat
router.delete("/:boatId", async (req, res) => {
  const boat = await get_boat(req.params.boatId);
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
    const boatKey = db.datastore.key([BOAT, parseInt(req.params.boatId, 10)]);
    await db.datastore.delete(boatKey);
    res.status(204).send();
  }
});

// Error handler middleware for validation errors.
router.use((error, request, response, next) => {
  if (error instanceof ValidationError) {
    response.status(400).json({
      Error:
        "The request object is missing at least one of the required attributes",
    });
    next();
  } else {
    next(error);
  }
});

module.exports = router;
