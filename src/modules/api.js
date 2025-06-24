// src/modules/api.js

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const GEN_RANGES = {
  gen1: { offset: 0, limit: 151 },
  gen2: { offset: 151, limit: 100 },
  gen3: { offset: 251, limit: 135 },
  gen4: { offset: 386, limit: 107 },
};

function getValidPokemonIds(generations) {
  let ids = [];
  generations.forEach(gen => {
    const { offset, limit } = GEN_RANGES[gen];
    for (let i = 1; i <= limit; i++) {
      ids.push(offset + i);
    }
  });
  return ids;
}

export async function getRandomPokemon(generations) {
  const validIds = getValidPokemonIds(generations);
  if (validIds.length === 0) {
      alert("Pilih minimal satu generasi untuk bermain!");
      return null;
  }
  const randomId = validIds[Math.floor(Math.random() * validIds.length)];
  const response = await fetch(`${API_URL}${randomId}`);
  const data = await response.json();
  return {
    name: data.name,
    image: data.sprites.other['official-artwork'].front_default,
  };
}
