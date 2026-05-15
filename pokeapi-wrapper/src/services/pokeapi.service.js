const axios = require("axios");

const BASE_URL = process.env.POKEAPI_BASE_URL || "https://pokeapi.co/api/v2";

// Cliente axios configurado
const pokeClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Accept": "application/json" },
});

/**
 * Obtiene datos de un Pokémon por ID o nombre
 */
async function getPokemonRaw(idOrName) {
  const { data } = await pokeClient.get(`/pokemon/${idOrName}`);
  return data;
}

/**
 * Obtiene la especie de un Pokémon (descripción, generación, etc.)
 */
async function getPokemonSpecies(idOrName) {
  const { data } = await pokeClient.get(`/pokemon-species/${idOrName}`);
  return data;
}

/**
 * Lista Pokémon con paginación
 */
async function listPokemon(limit = 20, offset = 0) {
  const { data } = await pokeClient.get(`/pokemon?limit=${limit}&offset=${offset}`);
  return data;
}

/**
 * Obtiene un tipo específico con sus relaciones de daño
 */
async function getType(typeName) {
  const { data } = await pokeClient.get(`/type/${typeName}`);
  return data;
}

/**
 * Lista todos los tipos disponibles
 */
async function listTypes() {
  const { data } = await pokeClient.get(`/type?limit=20`);
  return data;
}

module.exports = {
  getPokemonRaw,
  getPokemonSpecies,
  listPokemon,
  getType,
  listTypes,
};
