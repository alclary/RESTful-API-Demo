const { Router } = require("express");

const router = Router();

// GET - retrieve list of all users
router.get("/", () => {});
// GET - retrieve specific user
router.get("/:userId", () => {});
// POST - create a new user
router.post("/", () => {});
// TODO determine if needed DELETE - delete a given load
router.delete("/:userId", () => {});

module.exports = router;
