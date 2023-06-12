require("dotenv").config();
const { get_entity, get_entities } = require("../functions/dbFunctions");

// Constants
const entityKey = "User";

// GET / - retrieve all users *without* pagination
module.exports.users_get = async (req, res) => {
  // Users do not require owner parameter; null passed
  const users = await get_entities(entityKey, null);
  // Only return public data
  const usersPublic = users.map((user) => ({
    id: user.id,
    sub: user.sub,
    self: user.self,
    boats: user.boats,
  }));
  res.status(200).json(usersPublic);
};

// GET /:userId- a single user by ID
module.exports.user_get = async (req, res) => {
  const user = await get_entity(entityKey, req.params.userId);
  if (user === undefined) {
    res.status(404).json({ Error: "No user with this ID exists" });
  } else {
    // If querying self, return all data
    if (req.auth?.sub === user.sub) {
      res.status(200).json({ id: req.params.userId, ...user });
    } else {
      // Otherwise, only return public data
      const userPublic = {
        id: user.id,
        sub: user.sub,
        self: user.self,
        boats: user.boats,
      };
      res.status(200).json(userPublic);
    }
  }
};
