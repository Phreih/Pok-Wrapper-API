const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/type.controller");

router.get("/", ctrl.listTypes);
router.get("/:type/weaknesses", ctrl.getTypeWeaknesses);
router.get("/:type", ctrl.getPokemonByType);

module.exports = router;
