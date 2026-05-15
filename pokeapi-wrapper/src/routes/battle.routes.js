const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/battle.controller");

router.get("/compare/:pokemon1/:pokemon2", ctrl.comparePokemon);
router.get("/recommend", ctrl.recommendAgainstType);

module.exports = router;
