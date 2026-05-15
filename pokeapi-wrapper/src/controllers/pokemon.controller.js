const pokeService = require("../services/pokeapi.service");

/**
 * Transforma los datos crudos de PokeAPI en un formato limpio y útil
 */
function formatPokemon(raw) {
  return {
    id: raw.id,
    name: raw.name,
    height_m: (raw.height / 10).toFixed(1),   // decímetros → metros
    weight_kg: (raw.weight / 10).toFixed(1),   // hectogramos → kg
    base_experience: raw.base_experience,
    types: raw.types.map((t) => t.type.name),
    abilities: raw.abilities.map((a) => ({
      name: a.ability.name,
      hidden: a.is_hidden,
    })),
    stats: raw.stats.reduce((acc, s) => {
      acc[s.stat.name.replace("-", "_")] = s.base_stat;
      return acc;
    }, {}),
    sprite: raw.sprites?.front_default || null,
    sprite_shiny: raw.sprites?.front_shiny || null,
  };
}

// ─── GET /api/pokemon ─────────────────────────────────────────────────────────
async function listPokemon(req, res, next) {
  try {
    let { limit = 20, page = 1 } = req.query;
    limit = Math.min(parseInt(limit) || 20, 100);
    page = Math.max(parseInt(page) || 1, 1);
    const offset = (page - 1) * limit;

    const raw = await pokeService.listPokemon(limit, offset);

    res.json({
      success: true,
      total: raw.count,
      page,
      limit,
      total_pages: Math.ceil(raw.count / limit),
      results: raw.results.map((p) => ({
        name: p.name,
        id: parseInt(p.url.split("/").filter(Boolean).pop()),
        url: `/api/pokemon/${p.name}`,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/pokemon/search ──────────────────────────────────────────────────
async function searchPokemon(req, res, next) {
  try {
    const { name } = req.query;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'name' debe tener al menos 2 caracteres.",
      });
    }

    // PokeAPI no tiene búsqueda parcial; traemos una lista grande y filtramos
    const raw = await pokeService.listPokemon(1300, 0);
    const matches = raw.results
      .filter((p) => p.name.includes(name.toLowerCase().trim()))
      .slice(0, 20)
      .map((p) => ({
        name: p.name,
        id: parseInt(p.url.split("/").filter(Boolean).pop()),
        url: `/api/pokemon/${p.name}`,
      }));

    res.json({
      success: true,
      query: name,
      count: matches.length,
      results: matches,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/pokemon/:idOrName ───────────────────────────────────────────────
async function getPokemon(req, res, next) {
  try {
    const { idOrName } = req.params;
    const raw = await pokeService.getPokemonRaw(idOrName.toLowerCase());
    res.json({ success: true, data: formatPokemon(raw) });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: `Pokémon '${req.params.idOrName}' no encontrado.`,
      });
    }
    next(err);
  }
}

// ─── GET /api/pokemon/:idOrName/stats ─────────────────────────────────────────
async function getPokemonStats(req, res, next) {
  try {
    const { idOrName } = req.params;
    const raw = await pokeService.getPokemonRaw(idOrName.toLowerCase());

    const stats = raw.stats.reduce((acc, s) => {
      acc[s.stat.name.replace("-", "_")] = s.base_stat;
      return acc;
    }, {});

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    // Clasificación según BST (Base Stat Total)
    let tier;
    if (total >= 600) tier = "Legendario/Pseudolegendario";
    else if (total >= 500) tier = "Muy fuerte";
    else if (total >= 400) tier = "Competitivo";
    else if (total >= 300) tier = "Promedio";
    else tier = "Débil (etapa inicial)";

    res.json({
      success: true,
      pokemon: raw.name,
      id: raw.id,
      stats,
      base_stat_total: total,
      tier,
      best_stat: Object.entries(stats).sort((a, b) => b[1] - a[1])[0],
      worst_stat: Object.entries(stats).sort((a, b) => a[1] - b[1])[0],
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: `Pokémon '${req.params.idOrName}' no encontrado.`,
      });
    }
    next(err);
  }
}

module.exports = { listPokemon, searchPokemon, getPokemon, getPokemonStats };
