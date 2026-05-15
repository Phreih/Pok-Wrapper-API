require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const pokemonRoutes = require("./routes/pokemon.routes");
const typeRoutes = require("./routes/type.routes");
const battleRoutes = require("./routes/battle.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globales ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Rate limiting: máximo 100 peticiones por 15 min por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: "Demasiadas peticiones. Intenta de nuevo en 15 minutos.",
  },
});
app.use(limiter);

// ─── Ruta raíz con info de la API ────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a PokéWrapper API 🎮",
    version: "1.0.0",
    description: "API que consume PokeAPI y expone datos organizados de Pokémon",
    endpoints: {
      pokemon: {
        "GET /api/pokemon": "Listar Pokémon con paginación",
        "GET /api/pokemon/:idOrName": "Obtener detalles de un Pokémon",
        "GET /api/pokemon/:idOrName/stats": "Estadísticas de combate de un Pokémon",
        "GET /api/pokemon/search?name=": "Buscar Pokémon por nombre parcial",
      },
      types: {
        "GET /api/types": "Listar todos los tipos de Pokémon",
        "GET /api/types/:type": "Pokémon de un tipo específico",
        "GET /api/types/:type/weaknesses": "Debilidades de un tipo",
      },
      battle: {
        "GET /api/battle/compare/:pokemon1/:pokemon2": "Comparar dos Pokémon",
        "GET /api/battle/recommend?type=": "Recomendar Pokémon contra un tipo enemigo",
      },
    },
    source: "https://pokeapi.co",
  });
});

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use("/api/pokemon", pokemonRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/battle", battleRoutes);

// ─── Manejo de errores ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 PokéWrapper API corriendo en http://localhost:${PORT}`);
  console.log(`📖 Documentación: http://localhost:${PORT}/\n`);
});

module.exports = app;
