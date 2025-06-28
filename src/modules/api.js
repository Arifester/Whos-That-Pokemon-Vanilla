// src/modules/api.js
const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const GEN_RANGES = {
  gen1: { offset: 0, limit: 151 },
  gen2: { offset: 151, limit: 100 },
  gen3: { offset: 251, limit: 135 },
  gen4: { offset: 386, limit: 107 },
  gen5: { offset: 493, limit: 156 },
  gen6: { offset: 649, limit: 72 },
  gen7: { offset: 721, limit: 88 },
  gen8: { offset: 809, limit: 96 },
  gen9: { offset: 905, limit: 120 },
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
    id: data.id,
    name: data.name,
    image: data.sprites.other['official-artwork'].front_default,
  };
}

let allPokemonList = []; // Cache untuk menyimpan daftar

export async function fetchAllPokemon() {
    // Jika daftar sudah ada di cache, langsung kembalikan
    if (allPokemonList.length > 0) {
        return allPokemonList;
    }

    // Ambil daftar nama dan URL dari API (total 1025 Pokémon Gen 1-9)
    const response = await fetch(`${API_URL}?limit=1025`);
    const data = await response.json();
    
    // Proses data agar sesuai dengan format yang kita butuhkan
    allPokemonList = data.results.map((pokemon, index) => ({
        id: index + 1,
        name: pokemon.name,
        // Kita bisa "menebak" URL gambar dari ID-nya untuk efisiensi
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`
    }));

    return allPokemonList;
}
