// src/modules/state.js

// 'export' membuat variabel ini bisa diimpor dan digunakan oleh file lain.
export let state = {
  score: 0,
  attempts: 0,
  correctPokemon: null,
  timer: null,
  answerSubmitted: false,
  gameSettings: {
    difficulty: 'normal',
    generations: ['gen1'],
    mode: 'classic',
  },
};

export const TOTAL_GUESSES = 10; // Mode Klasik

// === FUNGSI UNTUK LOCALSTORAGE ===

export function getHighScore() {
  return localStorage.getItem('pokemonHighScore') || 0;
}

export function saveHighScore(score) {
  localStorage.setItem('pokemonHighScore', score);
}

export function getCollection() {
    return JSON.parse(localStorage.getItem('pokemonCollection')) || [];
}

export function saveToCollection(pokemon) {
    const collection = getCollection();
    if (!collection.some(p => p.name === pokemon.name)) {
        collection.push(pokemon);
        localStorage.setItem('pokemonCollection', JSON.stringify(collection));
    }
}
