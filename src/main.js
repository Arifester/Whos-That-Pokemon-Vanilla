// src/main.js
import './style.css';

// Impor semua modul yang kita butuhkan
import { state, getHighScore, saveHighScore, saveToCollection, getCollection, TOTAL_GUESSES } from './modules/state.js';
import { getRandomPokemon } from './modules/api.js';
import { screens, gameElements, menuElements, pokedexElements, gameOverElements, showScreen, updateScoreUI, updateGuessDisplay, renderPokedex } from './modules/ui.js';

// === FUNGSI ALUR GAME UTAMA ===

// BARU: Variabel untuk menyimpan ID dari setTimeout
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
    // DIUBAH: Pastikan tombol diaktifkan kembali
    button.disabled = false;
    button.classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'p-3', 'rounded-lg', 'transition', 'duration-200');
    // Hapus style jawaban sebelumnya jika ada
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
    // DIUBAH: Simpan ID timeout
    nextRoundTimeoutId = setTimeout(endGame, 2000);
  } else {
    // DIUBAH: Simpan ID timeout
    nextRoundTimeoutId = setTimeout(nextRound, 2000);
  }
}

function startTimer() {
  // DIUBAH: Pastikan timer lama selalu bersih sebelum membuat yang baru
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
  // DIUBAH: Tambahkan pembersihan menyeluruh di awal game
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
  // DIUBAH: Jadikan endGame sebagai satu-satunya pembersih utama
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

  // DIUBAH: Tombol Menu Utama sekarang juga harus membersihkan game
  gameOverElements.mainMenuBtn.addEventListener('click', () => {
    endGame(); // Hentikan dan bersihkan game
    showScreen('start'); // Baru tampilkan menu utama
    // Tampilkan high score lagi setelah kembali ke menu
    menuElements.highScoreDisplay.textContent = getHighScore(); 
  });

  menuElements.highScoreDisplay.textContent = getHighScore();
  showScreen('start');
}

init();
