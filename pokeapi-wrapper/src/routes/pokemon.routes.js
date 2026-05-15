const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/pokemon.controller");

// IMPORTANTE: La ruta /search debe ir ANTES de /:idOrName
router.get("/search", ctrl.searchPokemon);
router.get("/:idOrName/stats", ctrl.getPokemonStats);
router.get("/:idOrName", ctrl.getPokemon);
router.get("/", ctrl.listPokemon);

module.exports = router;
