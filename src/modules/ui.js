// src/modules/ui.js
import { state, TOTAL_GUESSES } from './state.js';
import { getCollection } from './state.js';

// === ELEMEN DOM ===
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
  Object.values(screens).forEach(screen => {
    screen.classList.add('screen-hidden');
  });
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

// Definisikan rentang ID generasi di sini agar UI tahu cara memfilter
const GEN_FILTER_RANGES = {
    "1": [1, 151], "2": [152, 251], "3": [252, 386], "4": [387, 493], "5": [494, 649],
    "6": [650, 721], "7": [722, 809], "8": [810, 905], "9": [906, 1025]
};

export function renderAlmanac(allPokemon, filters) {
    const grid = pokedexElements.grid;
    grid.innerHTML = '<p class="col-span-full text-center">Loading...</p>';
    
    const unlockedCollection = getCollection();
    const unlockedIds = new Set(unlockedCollection.map(p => p.id));

    let filteredPokemon = allPokemon;
    if (filters.generation !== 'all') {
        const [start, end] = GEN_FILTER_RANGES[filters.generation];
        filteredPokemon = allPokemon.filter(p => p.id >= start && p.id <= end);
    }

    if (filters.revealedOnly) {
        filteredPokemon = filteredPokemon.filter(p => unlockedIds.has(p.id));
    }

    grid.innerHTML = '';

    if (filteredPokemon.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-gray-400">Tidak ada Pokémon yang cocok dengan filter ini.</p>`;
        return;
    }

    filteredPokemon.forEach(pokemon => {
        const isUnlocked = unlockedIds.has(pokemon.id);
        const card = document.createElement('div');
        card.className = 'pokedex-card flex flex-col items-center justify-start';
        
        const nameDisplay = isUnlocked ? pokemon.name : '?????';
        const imageClass = isUnlocked ? '' : 'silhouette';

        card.innerHTML = `
            <span class="text-xs font-mono text-gray-400">#${String(pokemon.id).padStart(4, '0')}</span>
            <img src="${pokemon.image}" alt="${pokemon.name}" class="w-full h-auto ${imageClass}" style="image-rendering: pixelated;">
            <p class="text-sm font-bold capitalize mt-1 h-5">${nameDisplay}</p>
        `;
        grid.appendChild(card);
    });
}
