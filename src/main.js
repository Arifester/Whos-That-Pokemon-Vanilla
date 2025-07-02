// src/main.js
import './style.css';

// Impor semua modul yang kita butuhkan
// DIUBAH: Hapus renderPokedex yang sudah tidak dipakai
import { state, getHighScore, saveHighScore, saveToCollection, getCollection, TOTAL_GUESSES } from './modules/state.js';
import { getRandomPokemon, fetchAllPokemon } from './modules/api.js';
import { screens, gameElements, menuElements, pokedexElements, gameOverElements, showScreen, updateScoreUI, updateGuessDisplay, renderAlmanac } from './modules/ui.js';

// === FUNGSI ALUR GAME UTAMA ===

let nextRoundTimeoutId = null; 

async function nextRound() {
  state.answerSubmitted = false;
  gameElements.feedbackDisplay.textContent = '';
  gameElements.pokemonImage.classList.add('silhouette');
  gameElements.optionsContainer.innerHTML = 'Memuat Pokémon...';
  
  const correctData = await getRandomPokemon(state.gameSettings.generations);
  if (!correctData) {
      showScreen('start');
      return;
  }; 
  
  state.correctPokemon = correctData;
  gameElements.pokemonImage.src = correctData.image;

  const options = new Set([state.correctPokemon.name]);
  while (options.size < 4) {
    const randomOption = (await getRandomPokemon(state.gameSettings.generations)).name;
    options.add(randomOption);
  }

  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
  gameElements.optionsContainer.innerHTML = '';
  shuffledOptions.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option.charAt(0).toUpperCase() + option.slice(1);
    button.disabled = false;
    button.classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'p-3', 'rounded-lg', 'transition', 'duration-200');
    button.classList.remove('bg-green-500', 'bg-red-500');
    button.addEventListener('click', () => checkAnswer(option));
    gameElements.optionsContainer.appendChild(button);
  });

  startTimer();
}

function checkAnswer(selectedOption) {
  if (state.answerSubmitted) return;
  state.answerSubmitted = true;
  clearInterval(state.timer);

  gameElements.pokemonImage.classList.remove('silhouette');

  const allButtons = gameElements.optionsContainer.querySelectorAll('button');
  allButtons.forEach(button => {
    button.disabled = true;
    button.classList.remove('hover:bg-blue-700'); 
  });

  allButtons.forEach(button => {
    if (button.textContent.toLowerCase() === state.correctPokemon.name) {
      button.classList.remove('bg-blue-600');
      button.classList.add('bg-green-500');
    }
  });

  state.attempts++;

  if (selectedOption === state.correctPokemon.name) {
    new Audio('/correct-answer.mp3').play();
    state.score++;
    gameElements.feedbackDisplay.textContent = 'Jawaban Benar!';
    gameElements.feedbackDisplay.classList.remove('text-red-500');
    gameElements.feedbackDisplay.classList.add('text-green-400');
    saveToCollection(state.correctPokemon);
  } else {
    new Audio('/wrong-answer.mp3').play(); 
    allButtons.forEach(button => {
        if (button.textContent.toLowerCase() === selectedOption) {
            button.classList.remove('bg-blue-600');
            button.classList.add('bg-red-500');
        }
    });

    gameElements.feedbackDisplay.textContent = `Salah! Jawabannya adalah ${state.correctPokemon.name}`;
    gameElements.feedbackDisplay.classList.remove('text-green-400');
    gameElements.feedbackDisplay.classList.add('text-red-500');
  }
  
  updateScoreUI();
  updateGuessDisplay();

  const isClassicModeOver = state.gameSettings.mode === 'classic' && state.attempts >= TOTAL_GUESSES;
  const isEndlessModeOver = state.gameSettings.mode === 'endless' && selectedOption !== state.correctPokemon.name;

  if (isClassicModeOver || isEndlessModeOver) {
    nextRoundTimeoutId = setTimeout(endGame, 2000);
  } else {
    nextRoundTimeoutId = setTimeout(nextRound, 2000);
  }
}

function startTimer() {
  clearInterval(state.timer); 

  const DURATION_MAP = { easy: 15, normal: 10, hard: 5 };
  let timeLeft = DURATION_MAP[state.gameSettings.difficulty];
  gameElements.timerDisplay.textContent = `Time: ${timeLeft}s`;

  state.timer = setInterval(() => {
    timeLeft--;
    gameElements.timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(state.timer);
      if (!state.answerSubmitted) {
        checkAnswer(null);
      }
    }
  }, 1000);
}

function startGame() {
  clearInterval(state.timer);
  clearTimeout(nextRoundTimeoutId);

  state.gameSettings.difficulty = menuElements.difficultySelect.value;
  state.gameSettings.mode = menuElements.modeSelect.value;
  const selectedGens = [];
  menuElements.genCheckboxes.forEach(box => {
      if (box.checked) selectedGens.push(box.id);
  });
  state.gameSettings.generations = selectedGens;
  
  if (state.gameSettings.generations.length === 0) {
      alert("Pilih minimal satu generasi untuk bermain!");
      return;
  }

  state.score = 0;
  state.attempts = 0;
  updateScoreUI();
  updateGuessDisplay();

  showScreen('game');
  nextRound();
}

function endGame() {
  clearInterval(state.timer);
  clearTimeout(nextRoundTimeoutId);
  
  const highScore = getHighScore();
  if (state.score > highScore) {
    saveHighScore(state.score);
  }
  
  gameOverElements.finalScore.textContent = state.score;
  gameOverElements.gameOverHighScore.textContent = getHighScore();
  showScreen('gameOver');
}

// === INISIALISASI APLIKASI ===
function init() {
  let almanacData = [];
  const almanacFilters = {
      generation: 'all',
      revealedOnly: false,
  };

  document.getElementById('quit-game-btn').addEventListener('click', endGame);
  
  menuElements.startGameBtn.addEventListener('click', startGame);

  menuElements.viewCollectionBtn.addEventListener('click', async () => {
    showScreen('pokedex');
    if (almanacData.length === 0) {
        almanacData = await fetchAllPokemon(); 
    }
    renderAlmanac(almanacData, almanacFilters); 
  });

  pokedexElements.closeBtn.addEventListener('click', () => {
      showScreen('start');
  });

  gameOverElements.playAgainBtn.addEventListener('click', startGame);

  gameOverElements.mainMenuBtn.addEventListener('click', () => {
    endGame(); 
    showScreen('start');
    menuElements.highScoreDisplay.textContent = getHighScore(); 
  });
  
  const filterButtons = document.querySelectorAll('.pokedex-filter-btn');
  filterButtons.forEach(button => {
      button.addEventListener('click', () => {
          almanacFilters.generation = button.dataset.filter;
          filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          renderAlmanac(almanacData, almanacFilters);
      });
  });

  const toggle = document.getElementById('revealed-only-toggle');
  toggle.addEventListener('change', (e) => {
      almanacFilters.revealedOnly = e.target.checked;
      renderAlmanac(almanacData, almanacFilters);
  });

  menuElements.highScoreDisplay.textContent = getHighScore();
  showScreen('start');
}

init();
