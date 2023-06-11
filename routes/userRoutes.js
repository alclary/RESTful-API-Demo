const { Router } = require("express");
const userController = require("../controllers/userController");

const router = Router();

// GET - retrieve list of all users
router.get("/", userController.users_get);
// GET - retrieve specific user
router.get("/:userId", userController.user_get);

module.exports = router;
