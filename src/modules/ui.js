// src/modules/ui.js
import { state, TOTAL_GUESSES } from './state.js';

// === ELEMEN DOM ===
// Definisikan dan ekspor elemen agar bisa dipakai di main.js untuk event listener
export const screens = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game-screen'),
  gameOver: document.getElementById('game-over-screen'),
  pokedex: document.getElementById('pokedex-screen'),
};

export const gameElements = {
  pokemonImage: document.getElementById('pokemon-image'),
  optionsContainer: document.getElementById('options'),
  scoreDisplay: document.getElementById('score'),
  timerDisplay: document.getElementById('timer'),
  feedbackDisplay: document.getElementById('feedback'),
  guessDisplay: document.getElementById('guess-display'),
};

export const menuElements = {
  startGameBtn: document.getElementById('start-game-btn'),
  difficultySelect: document.getElementById('difficulty-select'),
  modeSelect: document.getElementById('mode-select'),
  genCheckboxes: document.querySelectorAll('input[type="checkbox"]'),
  highScoreDisplay: document.getElementById('high-score-display'),
  viewCollectionBtn: document.getElementById('view-collection-btn'),
};

export const pokedexElements = {
    grid: document.getElementById('pokedex-grid'),
    closeBtn: document.getElementById('close-pokedex-btn'),
};

export const gameOverElements = {
  finalScore: document.getElementById('final-score'),
  gameOverHighScore: document.getElementById('game-over-high-score'),
  playAgainBtn: document.getElementById('play-again-btn'),
  mainMenuBtn: document.getElementById('main-menu-btn'),
};

// === FUNGSI MANAJEMEN UI ===

export function showScreen(screenName) {
  // Sembunyikan semua layar terlebih dahulu
  Object.values(screens).forEach(screen => {
    screen.classList.add('screen-hidden');
  });

  // Tampilkan layar yang dituju
  const targetScreen = screens[screenName];
  targetScreen.classList.remove('screen-hidden');
}

export function updateScoreUI() {
  gameElements.scoreDisplay.textContent = `Score: ${state.score}`;
}

export function updateGuessDisplay() {
    if (state.gameSettings.mode === 'classic') {
        gameElements.guessDisplay.textContent = `Tebakan: ${state.attempts} / ${TOTAL_GUESSES}`;
        gameElements.guessDisplay.classList.remove('hidden');
    } else {
        gameElements.guessDisplay.classList.add('hidden');
    }
}

export function renderPokedex(collection) {
    const grid = pokedexElements.grid;
    grid.innerHTML = ''; 

    if (collection.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-gray-400">Koleksi masih kosong. Ayo bermain dan tangkap beberapa Pokémon!</p>`;
        return;
    }

    collection.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokedex-card';
        
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}" class="w-full h-auto">
            <p class="text-sm font-bold capitalize mt-2">${pokemon.name}</p>
        `;
        grid.appendChild(card);
    });
}
