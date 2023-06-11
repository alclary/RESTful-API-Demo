const { Router } = require("express");
const boatController = require("../controllers/boatController");
const { middleware } = require("../functions/middleware");

const router = Router();

// GET - retrieve all boats with pagination
router.get("/", middleware.requireJwtAuth, boatController.boats_get);
// GET - a single boat by ID
router.get("/:boatId", middleware.requireJwtAuth, boatController.boat_get);
// POST - Create new boat
router.post(
  "/",
  [middleware.requireJwtAuth, middleware.validateBoatSchema],
  boatController.create_boat
);
// PATCH - update a given boat
// TODO PATCH boat
// PUT - add load to boat
router.put(
  "/:boatId/loads/:loadId",
  middleware.requireJwtAuth,
  boatController.assign_load_to_boat
);
// DELETE - remove load from boat
router.delete(
  "/:boatId/loads/:loadId",
  middleware.requireJwtAuth,
  boatController.remove_load_from_boat
);
// DELETE - delete a given boat
router.delete(
  "/:boatId",
  middleware.requireJwtAuth,
  boatController.delete_boat
);

module.exports = router;
