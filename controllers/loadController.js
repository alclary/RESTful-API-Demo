require("dotenv").config();
const db = require("../db");
const { get_load, get_loads, get_boat } = require("../functions/dbFunctions");
const { Datastore } = require("@google-cloud/datastore");

// Constants
const entityKey = "Load";
const entitiesPerPage = 3;
const loads_path = "/loads";
const base_path = process.env.BASE_PATH;

// GET / - retrieve all loads with pagination
module.exports.loads_get = async (req, res) => {
  // if offset string var provided, use, else 0
  let offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
  const loads = await get_loads(offset, entitiesPerPage);
  if (loads[1].moreResults !== Datastore.NO_MORE_RESULTS) {
    offset += entitiesPerPage;
    let next = base_path + loads_path + "?offset=" + offset;
    res.status(200).json({ loads: loads[0], next });
  } else {
    res.status(200).json({ loads: loads[0] });
  }
};

// GET /:loadId - retrieve specific load
module.exports.load_get = async (req, res) => {
  const load = await get_load(req.params.loadId);
  if (load === undefined) {
    res.status(404).json({ Error: "No load with this load_id exists" });
  } else {
    res.status(200).json({ id: req.params.loadId, ...load });
  }
};

// POST / - create a new load
module.exports.create_load = async (req, res) => {
  const newKey = db.datastore.key(entityKey);
  const loadData = { ...req.body };
  loadData.carrier = null;
  // Save first to initialize the new key entry (required for ID)
  await db.datastore.save({ key: newKey, data: loadData });
  // Generate path to load
  loadData.self = base_path + loads_path + "/" + newKey.id;
  // Save again to add the path to load under 'self' data key
  await db.datastore.save({ key: newKey, data: loadData });
  res.status(201).json({ id: newKey.id, ...loadData });
};

// DELETE /:loadId - delete a given load
module.exports.delete_load = async (req, res) => {
  const load = await get_load(req.params.loadId);
  if (load === undefined) {
    res.status(404).json({ Error: "No load with this load_id exists" });
  } else {
    // Handle associated assignment
    const boat = await get_boat(load.carrier.id);
    boat.loads = boat.loads.filter((load) => load.id != req.params.loadId);
    db.datastore.save(boat);
    // Handle load delete
    const loadKey = db.datastore.key([
      entityKey,
      parseInt(req.params.loadId, 10),
    ]);
    await db.datastore.delete(loadKey);
    res.status(204).send();
  }
};
