const { Router } = require("express");
const boatController = require("../controllers/boatController");
const { middleware } = require("../functions/middleware");

const router = Router();

// GET - retrieve all boats with pagination
router.get("/", boatController.boats_get);
// GET - a single boat by ID
router.get("/:boatId", boatController.boat_get);
// GET - get all loads associated with boat
router.get("/:boatId/loads", boatController.boat_loads_get);
// POST - Create new boat
router.post("/", middleware.validateBoatSchema, boatController.create_boat);
// PUT - add load to boat
router.put("/:boatId/loads/:loadId", boatController.assign_load_to_boat);
// DELETE - remove load from boat
router.delete("/:boatId/loads/:loadId", boatController.remove_load_from_boat);
// DELETE - delete a given boat
router.delete("/:boatId", boatController.delete_boat);

module.exports = router;
