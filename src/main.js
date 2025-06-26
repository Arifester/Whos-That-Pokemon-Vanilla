// src/main.js
import './style.css';

// Impor semua modul yang kita butuhkan
import { state, getHighScore, saveHighScore, saveToCollection, getCollection, TOTAL_GUESSES } from './modules/state.js';
import { getRandomPokemon } from './modules/api.js';
import { screens, gameElements, menuElements, pokedexElements, gameOverElements, showScreen, updateScoreUI, updateGuessDisplay, renderPokedex } from './modules/ui.js';

// === FUNGSI ALUR GAME UTAMA ===

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
    button.classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'p-3', 'rounded-lg', 'transition', 'duration-200');
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

  // Nonaktifkan semua tombol agar tidak bisa diklik lagi
  const allButtons = gameElements.optionsContainer.querySelectorAll('button');
  allButtons.forEach(button => {
    button.disabled = true;
    // Hapus efek hover agar terlihat tidak aktif
    button.classList.remove('hover:bg-blue-700'); 
  });

  // Cari tombol yang benar dan beri warna hijau
  allButtons.forEach(button => {
    // Gunakan textContent untuk mencocokkan nama, sesuaikan jika perlu
    if (button.textContent.toLowerCase() === state.correctPokemon.name) {
      button.classList.remove('bg-blue-600');
      button.classList.add('bg-green-500'); // Warna hijau untuk jawaban benar
    }
  });

  state.attempts++;

  if (selectedOption === state.correctPokemon.name) {
    state.score++;
    gameElements.feedbackDisplay.textContent = 'Jawaban Benar!';
    gameElements.feedbackDisplay.classList.remove('text-red-500');
    gameElements.feedbackDisplay.classList.add('text-green-400');
    saveToCollection(state.correctPokemon);
  } else {
    // Jika jawaban yang dipilih salah, beri warna merah pada pilihan tersebut
    allButtons.forEach(button => {
        if (button.textContent.toLowerCase() === selectedOption) {
            button.classList.remove('bg-blue-600');
            button.classList.add('bg-red-500'); // Warna merah untuk jawaban salah
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
    setTimeout(endGame, 2000);
  } else {
    setTimeout(nextRound, 2000);
  }
}

function startTimer() {
  const DURATION_MAP = { easy: 15, normal: 10, hard: 5 };
  let timeLeft = DURATION_MAP[state.gameSettings.difficulty];
  gameElements.timerDisplay.textContent = `Time: ${timeLeft}s`;

  state.timer = setInterval(() => {
    timeLeft--;
    gameElements.timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(state.timer);
      checkAnswer(null);
    }
  }, 1000);
}

function startGame() {
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
  document.getElementById('quit-game-btn').addEventListener('click', endGame);
  
  menuElements.startGameBtn.addEventListener('click', startGame);
  menuElements.viewCollectionBtn.addEventListener('click', () => {
      renderPokedex(getCollection());
      showScreen('pokedex');
  });

  pokedexElements.closeBtn.addEventListener('click', () => {
      showScreen('start');
  });

  gameOverElements.playAgainBtn.addEventListener('click', startGame);
  gameOverElements.mainMenuBtn.addEventListener('click', () => {
    menuElements.highScoreDisplay.textContent = getHighScore();
    showScreen('start');
  });

  menuElements.highScoreDisplay.textContent = getHighScore();
  showScreen('start');
}

init();
