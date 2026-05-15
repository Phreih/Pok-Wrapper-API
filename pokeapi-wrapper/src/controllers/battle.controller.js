const pokeService = require("../services/pokeapi.service");

/**
 * Calcula un "poder de combate" simple basado en stats
 */
function calcBattlePower(stats) {
  const weights = {
    hp: 1,
    attack: 1.5,
    defense: 1,
    special_attack: 1.5,
    special_defense: 1,
    speed: 1.2,
  };
  return Object.entries(stats).reduce((total, [stat, value]) => {
    const key = stat.replace("-", "_");
    return total + value * (weights[key] || 1);
  }, 0);
}

function formatStats(raw) {
  return raw.stats.reduce((acc, s) => {
    acc[s.stat.name.replace("-", "_")] = s.base_stat;
    return acc;
  }, {});
}

// ─── GET /api/battle/compare/:pokemon1/:pokemon2 ──────────────────────────────
async function comparePokemon(req, res, next) {
  try {
    const { pokemon1, pokemon2 } = req.params;

    const [raw1, raw2] = await Promise.all([
      pokeService.getPokemonRaw(pokemon1.toLowerCase()),
      pokeService.getPokemonRaw(pokemon2.toLowerCase()),
    ]);

    const stats1 = formatStats(raw1);
    const stats2 = formatStats(raw2);
    const power1 = calcBattlePower(stats1);
    const power2 = calcBattlePower(stats2);

    const bst1 = Object.values(stats1).reduce((a, b) => a + b, 0);
    const bst2 = Object.values(stats2).reduce((a, b) => a + b, 0);

    // Comparar stat por stat
    const statComparison = {};
    Object.keys(stats1).forEach((stat) => {
      const v1 = stats1[stat];
      const v2 = stats2[stat];
      statComparison[stat] = {
        [raw1.name]: v1,
        [raw2.name]: v2,
        winner: v1 > v2 ? raw1.name : v2 > v1 ? raw2.name : "empate",
        difference: Math.abs(v1 - v2),
      };
    });

    const winner =
      power1 > power2 ? raw1.name : power2 > power1 ? raw2.name : "empate";

    res.json({
      success: true,
      comparison: {
        [raw1.name]: {
          id: raw1.id,
          types: raw1.types.map((t) => t.type.name),
          base_stat_total: bst1,
          battle_power: Math.round(power1),
          sprite: raw1.sprites?.front_default,
        },
        [raw2.name]: {
          id: raw2.id,
          types: raw2.types.map((t) => t.type.name),
          base_stat_total: bst2,
          battle_power: Math.round(power2),
          sprite: raw2.sprites?.front_default,
        },
      },
      stat_comparison: statComparison,
      verdict: {
        winner,
        margin:
          winner !== "empate"
            ? `${Math.round(Math.abs(power1 - power2))} puntos de poder`
            : "exactamente iguales",
        note:
          "El resultado se basa en estadísticas base ponderadas. El tipo, movimientos y estrategia también importan.",
      },
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: "Uno o ambos Pokémon no fueron encontrados. Verifica los nombres.",
      });
    }
    next(err);
  }
}

// ─── GET /api/battle/recommend?type=fire ──────────────────────────────────────
async function recommendAgainstType(req, res, next) {
  try {
    const { type } = req.query;
    if (!type) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'type' es requerido. Ej: /api/battle/recommend?type=fire",
      });
    }

    // Obtener el tipo enemigo y sus debilidades
    const enemyType = await pokeService.getType(type.toLowerCase());
    const weaknesses = enemyType.damage_relations.double_damage_from.map(
      (t) => t.name
    );

    if (weaknesses.length === 0) {
      return res.json({
        success: true,
        enemy_type: type,
        message: `El tipo ${type} no tiene debilidades conocidas.`,
        recommendations: [],
      });
    }

    // Buscar Pokémon del primer tipo que es fuerte contra el enemigo
    const strongType = weaknesses[0];
    const typeData = await pokeService.getType(strongType);

    const recommendations = typeData.pokemon
      .slice(0, 5)
      .map((p) => ({
        name: p.pokemon.name,
        id: parseInt(p.pokemon.url.split("/").filter(Boolean).pop()),
        strong_type: strongType,
        url: `/api/pokemon/${p.pokemon.name}`,
      }));

    res.json({
      success: true,
      enemy_type: enemyType.name,
      enemy_weak_to: weaknesses,
      recommended_type: strongType,
      recommendations,
      tip: `Usa Pokémon de tipo ${strongType} para combatir Pokémon de tipo ${type}.`,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: `Tipo '${req.query.type}' no encontrado. Usa GET /api/types para ver los tipos válidos.`,
      });
    }
    next(err);
  }
}

module.exports = { comparePokemon, recommendAgainstType };
