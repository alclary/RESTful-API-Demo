require("dotenv").config();
const db = require("../db");
const { get_entity, get_entities } = require("../functions/dbFunctions");

// Constants
const entityKey = "User";
const users_path = "/users";
const base_path = process.env.BASE_PATH;

// GET / - retrieve all users *without* pagination
module.exports.users_get = async (req, res) => {
  // Users do not require owner parameter; null passed
  const users = await get_entities(entityKey, null);
  res.status(200).json({ users });
};

// GET /:userId- a single user by ID
module.exports.user_get = async (req, res) => {
  const user = await get_entity(entityKey, req.params.userId);
  if (user === undefined) {
    res.status(404).json({ Error: "No user with this ID exists" });
  } else {
    res.status(200).json({ id: req.params.userId, ...user });
  }
};

// POST / - create a new user
module.exports.create_user = async (req, res) => {
  const newKey = db.datastore.key(entityKey);
  const userData = { ...req.body };
  // Save first to initialize the new key entry (required for ID)
  await db.datastore.save({ key: newKey, data: userData });
  // Generate path to load
  userData.self = base_path + users_path + "/" + newKey.id;
  // Save again to add the path to load under 'self' data key
  await db.datastore.save({ key: newKey, data: userData });
  res.status(201).json({ id: newKey.id, ...userData });
};
