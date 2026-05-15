const pokeService = require("../services/pokeapi.service");

// ─── GET /api/types ───────────────────────────────────────────────────────────
async function listTypes(req, res, next) {
  try {
    const raw = await pokeService.listTypes();
    const types = raw.results
      .filter((t) => t.name !== "unknown" && t.name !== "shadow")
      .map((t) => ({
        name: t.name,
        url: `/api/types/${t.name}`,
      }));

    res.json({ success: true, count: types.length, types });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/types/:type ─────────────────────────────────────────────────────
async function getPokemonByType(req, res, next) {
  try {
    const { type } = req.params;
    let { limit = 20, page = 1 } = req.query;
    limit = Math.min(parseInt(limit) || 20, 50);
    page = Math.max(parseInt(page) || 1, 1);

    const raw = await pokeService.getType(type.toLowerCase());

    const allPokemon = raw.pokemon.map((p) => ({
      name: p.pokemon.name,
      id: parseInt(p.pokemon.url.split("/").filter(Boolean).pop()),
      url: `/api/pokemon/${p.pokemon.name}`,
    }));

    const offset = (page - 1) * limit;
    const paginated = allPokemon.slice(offset, offset + limit);

    res.json({
      success: true,
      type: raw.name,
      total_pokemon: allPokemon.length,
      page,
      limit,
      total_pages: Math.ceil(allPokemon.length / limit),
      pokemon: paginated,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: `Tipo '${req.params.type}' no encontrado. Usa GET /api/types para ver los tipos válidos.`,
      });
    }
    next(err);
  }
}

// ─── GET /api/types/:type/weaknesses ──────────────────────────────────────────
async function getTypeWeaknesses(req, res, next) {
  try {
    const { type } = req.params;
    const raw = await pokeService.getType(type.toLowerCase());

    const dmg = raw.damage_relations;

    res.json({
      success: true,
      type: raw.name,
      damage_relations: {
        weak_to: dmg.double_damage_from.map((t) => t.name),
        resistant_to: dmg.half_damage_from.map((t) => t.name),
        immune_to: dmg.no_damage_from.map((t) => t.name),
        strong_against: dmg.double_damage_to.map((t) => t.name),
        weak_against: dmg.half_damage_to.map((t) => t.name),
        no_effect_on: dmg.no_damage_to.map((t) => t.name),
      },
      tip: `Los Pokémon de tipo ${raw.name} son débiles contra: ${
        dmg.double_damage_from.map((t) => t.name).join(", ") || "ninguno"
      }`,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: `Tipo '${req.params.type}' no encontrado.`,
      });
    }
    next(err);
  }
}

module.exports = { listTypes, getPokemonByType, getTypeWeaknesses };
