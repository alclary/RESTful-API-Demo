const { Router } = require("express");
const userController = require("../controllers/userController");
const { middleware } = require("../functions/middleware");

const router = Router();

// GET - retrieve list of all users
router.get("/", userController.users_get);
// GET - retrieve specific user
router.get("/:userId", userController.user_get);
// POST - create a new user
router.post("/", middleware.validateUserSchema, userController.create_user);

module.exports = router;
