require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../db");
const { get_load, get_loads, get_boat } = require("../apiFunctions");
const {
  Validator,
  ValidationError,
} = require("express-json-validator-middleware");
const { Datastore } = require("@google-cloud/datastore");

const LOAD = "Load";
const load_paginate = 3;
const base_path = process.env.BASE_PATH;
const loads_path = "/loads";

const loadSchema = {
  type: "object",
  required: ["volume", "item", "creation_date"],
  properties: {
    volume: {
      type: "integer",
    },
    item: {
      type: "string",
    },
    creation_date: {
      type: "string",
    },
  },
};

// initialize JSONSchema validator
const { validate } = new Validator();

// GET - retrieve all loads with pagination
router.get("/", async (req, res) => {
  // if offset string var provided, use, else 0
  let offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
  const loads = await get_loads(offset, load_paginate);
  if (loads[1].moreResults !== Datastore.NO_MORE_RESULTS) {
    offset += load_paginate;
    let next = base_path + loads_path + "?offset=" + offset;
    res.status(200).json({ loads: loads[0], next });
  } else {
    res.status(200).json({ loads: loads[0] });
  }
});

// GET - retrieve specific load
router.get("/:loadId", async (req, res) => {
  const load = await get_load(req.params.loadId);
  if (load === undefined) {
    res.status(404).json({ Error: "No load with this load_id exists" });
  } else {
    res.status(200).json({ id: req.params.loadId, ...load });
  }
});

// POST - create a new load
router.post("/", validate({ body: loadSchema }), async (req, res) => {
  const newKey = db.datastore.key(LOAD);
  const loadData = { ...req.body };
  loadData.carrier = null;
  // Save first to initialize the new key entry (required for ID)
  await db.datastore.save({ key: newKey, data: loadData });
  // Generate path to load
  loadData.self = base_path + loads_path + "/" + newKey.id;
  // Save again to add the path to load under 'self' data key
  await db.datastore.save({ key: newKey, data: loadData });
  res.status(201).json({ id: newKey.id, ...loadData });
});

// DELETE - delete a given load
router.delete("/:loadId", async (req, res) => {
  const load = await get_load(req.params.loadId);
  if (load === undefined) {
    res.status(404).json({ Error: "No load with this load_id exists" });
  } else {
    // Handle associated assignment
    const boat = await get_boat(load.carrier.id);
    boat.loads = boat.loads.filter((load) => load.id != req.params.loadId);
    db.datastore.save(boat);
    // Handle load delete
    const loadKey = db.datastore.key([LOAD, parseInt(req.params.loadId, 10)]);
    await db.datastore.delete(loadKey);
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
