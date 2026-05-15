# 🎮 PokéWrapper API

> API REST propia construida sobre [PokeAPI](https://pokeapi.co) que organiza, transforma y enriquece datos de Pokémon con endpoints propios, lógica de negocio y funcionalidades originales.

---

## 📋 Tabla de contenidos

- [Descripción](#descripción)
- [API Externa utilizada](#api-externa-utilizada)
- [Tecnologías](#tecnologías)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Endpoints](#endpoints)
  - [Raíz](#raíz)
  - [Pokémon](#pokémon)
  - [Tipos](#tipos)
  - [Batalla](#batalla)
- [Ejemplos de respuestas](#ejemplos-de-respuestas)
- [Manejo de errores](#manejo-de-errores)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Descripción

**PokéWrapper API** no es un proxy simple de PokeAPI. Agrega valor mediante:

- **Transformación de datos**: convierte unidades (decímetros → metros, hectogramos → kg), limpia campos innecesarios y presenta solo lo relevante.
- **Lógica propia**: calcula un índice de "poder de combate" ponderado, clasifica Pokémon por tier (Legendario, Competitivo, etc.) y genera recomendaciones estratégicas.
- **Funcionalidades originales**: comparación entre dos Pokémon, recomendaciones para contrarrestar un tipo enemigo, búsqueda por nombre parcial.
- **Paginación y control**: todos los endpoints de lista soportan paginación con parámetros `page` y `limit`.

---

## API Externa utilizada

| Campo | Valor |
|-------|-------|
| **Nombre** | PokeAPI |
| **URL** | https://pokeapi.co |
| **Documentación** | https://pokeapi.co/docs/v2 |
| **Requiere API Key** | ❌ No |
| **Plan gratuito** | ✅ Completamente gratuita |
| **Formato** | JSON |
| **Endpoints consumidos** | `/pokemon/{id}`, `/pokemon-species/{id}`, `/pokemon`, `/type/{name}`, `/type` |

---

## Tecnologías

- **Node.js** v18+
- **Express** — Framework web
- **Axios** — Cliente HTTP para consumir PokeAPI
- **dotenv** — Variables de entorno
- **cors** — Habilitar CORS
- **express-rate-limit** — Protección contra abuso

---

## Instalación y ejecución

### Requisitos previos

- Node.js v18 o superior instalado
- npm v8 o superior

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/pokeapi-wrapper.git
cd pokeapi-wrapper

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario (el puerto por defecto es 3000)

# 4. Ejecutar el servidor
npm start

# Para desarrollo con reinicio automático:
npm run dev
```

El servidor quedará disponible en: `http://localhost:3000`

---

## Endpoints

### Raíz

#### `GET /`
Retorna información general de la API y todos los endpoints disponibles.

---

### Pokémon

#### `GET /api/pokemon`
Lista todos los Pokémon con paginación.

**Query params:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página |
| `limit` | number | 20 | Resultados por página (máx. 100) |

**Ejemplo:** `GET /api/pokemon?page=2&limit=10`

---

#### `GET /api/pokemon/search`
Busca Pokémon cuyo nombre contenga el texto dado.

**Query params:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `name` | string | ✅ | Texto a buscar (mín. 2 caracteres) |

**Ejemplo:** `GET /api/pokemon/search?name=char`

---

#### `GET /api/pokemon/:idOrName`
Retorna los detalles completos de un Pokémon por ID numérico o nombre.

**Params:**

| Parámetro | Tipo | Ejemplo |
|-----------|------|---------|
| `idOrName` | string \| number | `pikachu`, `25`, `charizard` |

**Ejemplo:** `GET /api/pokemon/pikachu`

---

#### `GET /api/pokemon/:idOrName/stats`
Retorna las estadísticas de combate de un Pokémon con análisis propio: total de stats base (BST), clasificación por tier y mejor/peor estadística.

**Ejemplo:** `GET /api/pokemon/mewtwo/stats`

---

### Tipos

#### `GET /api/types`
Lista todos los tipos de Pokémon disponibles.

**Ejemplo:** `GET /api/types`

---

#### `GET /api/types/:type`
Lista todos los Pokémon de un tipo específico con paginación.

**Params:**

| Parámetro | Tipo | Ejemplo |
|-----------|------|---------|
| `type` | string | `fire`, `water`, `electric` |

**Query params:** `page`, `limit` (igual que `/api/pokemon`)

**Ejemplo:** `GET /api/types/fire?limit=10`

---

#### `GET /api/types/:type/weaknesses`
Retorna las relaciones de daño de un tipo: debilidades, resistencias, inmunidades.

**Ejemplo:** `GET /api/types/fire/weaknesses`

---

### Batalla

#### `GET /api/battle/compare/:pokemon1/:pokemon2`
Compara dos Pokémon estadísticamente. Calcula un índice de poder ponderado y determina un ganador. Incluye comparación stat por stat.

**Params:**

| Parámetro | Tipo | Ejemplo |
|-----------|------|---------|
| `pokemon1` | string | `pikachu` |
| `pokemon2` | string | `bulbasaur` |

**Ejemplo:** `GET /api/battle/compare/charizard/blastoise`

---

#### `GET /api/battle/recommend`
Recomienda Pokémon para contrarrestar un tipo enemigo, basándose en las relaciones de daño.

**Query params:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `type` | string | ✅ | Tipo del Pokémon enemigo |

**Ejemplo:** `GET /api/battle/recommend?type=dragon`

---

## Ejemplos de respuestas

### `GET /api/pokemon/pikachu`

```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "pikachu",
    "height_m": "0.4",
    "weight_kg": "6.0",
    "base_experience": 112,
    "types": ["electric"],
    "abilities": [
      { "name": "static", "hidden": false },
      { "name": "lightning-rod", "hidden": true }
    ],
    "stats": {
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "special_attack": 50,
      "special_defense": 50,
      "speed": 90
    },
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    "sprite_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png"
  }
}
```

### `GET /api/pokemon/mewtwo/stats`

```json
{
  "success": true,
  "pokemon": "mewtwo",
  "id": 150,
  "stats": {
    "hp": 106,
    "attack": 110,
    "defense": 90,
    "special_attack": 154,
    "special_defense": 90,
    "speed": 130
  },
  "base_stat_total": 680,
  "tier": "Legendario/Pseudolegendario",
  "best_stat": ["special_attack", 154],
  "worst_stat": ["defense", 90]
}
```

### `GET /api/battle/compare/charizard/blastoise`

```json
{
  "success": true,
  "comparison": {
    "charizard": {
      "id": 6,
      "types": ["fire", "flying"],
      "base_stat_total": 534,
      "battle_power": 721,
      "sprite": "https://..."
    },
    "blastoise": {
      "id": 9,
      "types": ["water"],
      "base_stat_total": 530,
      "battle_power": 706,
      "sprite": "https://..."
    }
  },
  "stat_comparison": {
    "hp": { "charizard": 78, "blastoise": 79, "winner": "blastoise", "difference": 1 },
    "attack": { "charizard": 84, "blastoise": 83, "winner": "charizard", "difference": 1 }
  },
  "verdict": {
    "winner": "charizard",
    "margin": "15 puntos de poder",
    "note": "El resultado se basa en estadísticas base ponderadas. El tipo, movimientos y estrategia también importan."
  }
}
```

### `GET /api/battle/recommend?type=dragon`

```json
{
  "success": true,
  "enemy_type": "dragon",
  "enemy_weak_to": ["ice", "dragon", "fairy"],
  "recommended_type": "ice",
  "recommendations": [
    { "name": "dewgong", "id": 87, "strong_type": "ice", "url": "/api/pokemon/dewgong" },
    { "name": "cloyster", "id": 91, "strong_type": "ice", "url": "/api/pokemon/cloyster" }
  ],
  "tip": "Usa Pokémon de tipo ice para combatir Pokémon de tipo dragon."
}
```

---

## Manejo de errores

Todos los errores retornan JSON con la estructura:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

| Código HTTP | Causa |
|-------------|-------|
| `400` | Parámetro faltante o inválido |
| `404` | Pokémon o tipo no encontrado |
| `429` | Demasiadas peticiones (rate limit) |
| `503` | No se pudo conectar a PokeAPI |
| `504` | PokeAPI tardó demasiado (timeout) |
| `500` | Error interno del servidor |

---

## Variables de entorno

Copia `.env.example` a `.env` y ajusta si es necesario:

```env
PORT=3000
POKEAPI_BASE_URL=https://pokeapi.co/api/v2
```

> ⚠️ **Nunca subas el archivo `.env` a GitHub.** Está incluido en `.gitignore`.

> ℹ️ **PokeAPI no requiere API Key**, por lo que no hay credenciales sensibles que proteger en este proyecto.

---

## Estructura del proyecto

```
pokeapi-wrapper/
├── src/
│   ├── index.js                    # Punto de entrada, configuración de Express
│   ├── routes/
│   │   ├── pokemon.routes.js       # Rutas /api/pokemon
│   │   ├── type.routes.js          # Rutas /api/types
│   │   └── battle.routes.js        # Rutas /api/battle
│   ├── controllers/
│   │   ├── pokemon.controller.js   # Lógica de endpoints de Pokémon
│   │   ├── type.controller.js      # Lógica de endpoints de tipos
│   │   └── battle.controller.js    # Lógica de comparación y recomendación
│   ├── services/
│   │   └── pokeapi.service.js      # Capa de acceso a PokeAPI (axios)
│   └── middlewares/
│       └── error.middleware.js     # Manejo de errores 404 y globales
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

---

## Autor

Proyecto desarrollado como parcial de la asignatura de DESARROLLO DE APLICACIONES WEB II - 5C.

**API externa:** [PokeAPI](https://pokeapi.co) — Completamente gratuita, sin API Key requerida.
