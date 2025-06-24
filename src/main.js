import './style.css';

// === KONSTANTA & STATE ===
const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const GEN_RANGES = {
  gen1: { offset: 0, limit: 151 },
  gen2: { offset: 151, limit: 100 },
  gen3: { offset: 251, limit: 135 },
  gen4: { offset: 386, limit: 107 },
};
const TOTAL_GUESSES = 10; // Mode Klasik

let state = {
  score: 0,
  attempts: 0,
  correctPokemon: null,
  timer: null,
  answerSubmitted: false,
  gameSettings: {
    difficulty: 'normal',
    generations: ['gen1'],
    mode: 'classic', // BARU: Tambahkan mode ke state
  },
};

// === ELEMEN DOM ===
const screens = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game-screen'),
  gameOver: document.getElementById('game-over-screen'),
};

const gameElements = {
  pokemonImage: document.getElementById('pokemon-image'),
  optionsContainer: document.getElementById('options'),
  scoreDisplay: document.getElementById('score'),
  timerDisplay: document.getElementById('timer'),
  feedbackDisplay: document.getElementById('feedback'),
  guessDisplay: document.getElementById('guess-display'), // BARU
};

const menuElements = {
  startGameBtn: document.getElementById('start-game-btn'),
  difficultySelect: document.getElementById('difficulty-select'),
  modeSelect: document.getElementById('mode-select'), // BARU
  genCheckboxes: document.querySelectorAll('input[type="checkbox"]'),
  highScoreDisplay: document.getElementById('high-score-display'),
};

const gameOverElements = {
  finalScore: document.getElementById('final-score'),
  gameOverHighScore: document.getElementById('game-over-high-score'),
  playAgainBtn: document.getElementById('play-again-btn'),
  mainMenuBtn: document.getElementById('main-menu-btn'),
};

document.getElementById('quit-game-btn').addEventListener('click', endGame);


// === FUNGSI UTAMA GAME ===

/** Mengambil ID Pokémon yang valid berdasarkan generasi yang dipilih */
function getValidPokemonIds() {
  let ids = [];
  state.gameSettings.generations.forEach(gen => {
    const { offset, limit } = GEN_RANGES[gen];
    for (let i = 1; i <= limit; i++) {
      ids.push(offset + i);
    }
  });
  return ids;
}

/** Mengambil data Pokémon secara acak */
async function getRandomPokemon() {
  const validIds = getValidPokemonIds();
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

/** Memulai babak baru */
async function nextRound() {
  // Reset state & UI untuk babak baru
  state.answerSubmitted = false;
  gameElements.feedbackDisplay.textContent = '';
  gameElements.pokemonImage.classList.add('silhouette');
  gameElements.optionsContainer.innerHTML = 'Memuat Pokémon...';
  
  // Ambil Pokémon untuk jawaban & pilihan
  const correctData = await getRandomPokemon();
  if (!correctData) {
      showScreen('start'); // Kembali ke menu jika tidak ada pokemon
      return;
  }; 
  
  state.correctPokemon = correctData;
  gameElements.pokemonImage.src = correctData.image;

  const options = new Set([state.correctPokemon.name]);
  while (options.size < 4) {
    const randomOption = (await getRandomPokemon()).name;
    options.add(randomOption);
  }

  // Acak dan tampilkan pilihan
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

/** Memeriksa jawaban yang dipilih */
function checkAnswer(selectedOption) {
  if (state.answerSubmitted) return;
  state.answerSubmitted = true;
  clearInterval(state.timer);

  gameElements.pokemonImage.classList.remove('silhouette');
  state.attempts++;

  if (selectedOption === state.correctPokemon.name) {
    state.score++;
    gameElements.feedbackDisplay.textContent = 'Jawaban Benar!';
    gameElements.feedbackDisplay.classList.remove('text-red-500');
    gameElements.feedbackDisplay.classList.add('text-green-400');
  } else {
    gameElements.feedbackDisplay.textContent = `Salah! Jawabannya adalah ${state.correctPokemon.name}`;
    gameElements.feedbackDisplay.classList.remove('text-green-400');
    gameElements.feedbackDisplay.classList.add('text-red-500');
  }
  
  updateScoreUI();
  updateGuessDisplay(); // BARU: Update tampilan tebakan

  // DIUBAH: Logika game over disesuaikan dengan mode permainan
  const isClassicModeOver = state.gameSettings.mode === 'classic' && state.attempts >= TOTAL_GUESSES;
  const isEndlessModeOver = state.gameSettings.mode === 'endless' && selectedOption !== state.correctPokemon.name;

  if (isClassicModeOver || isEndlessModeOver) {
    setTimeout(endGame, 2000);
  } else {
    setTimeout(nextRound, 2000);
  }
}

/** Memulai timer */
function startTimer() {
  const DURATION_MAP = { easy: 15, normal: 10, hard: 5 };
  let timeLeft = DURATION_MAP[state.gameSettings.difficulty];
  gameElements.timerDisplay.textContent = `Time: ${timeLeft}s`;

  state.timer = setInterval(() => {
    timeLeft--;
    gameElements.timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(state.timer);
      checkAnswer(null); // Waktu habis dianggap jawaban salah
    }
  }, 1000);
}


// === FUNGSI MANAJEMEN STATE & UI ===

/** Mengubah layar yang ditampilkan */
function showScreen(screenName) {
  Object.entries(screens).forEach(([name, screen]) => {
    screen.classList.add('hidden');
    if (name === 'gameOver') {
      screen.classList.remove('flex'); // hanya hapus dari gameOver
    }
  });

  const targetScreen = screens[screenName];
  targetScreen.classList.remove('hidden');

  if (screenName === 'gameOver') {
    targetScreen.classList.add('flex'); // aktifkan kembali
  }
}

/** Mengupdate tampilan skor */
function updateScoreUI() {
  gameElements.scoreDisplay.textContent = `Score: ${state.score}`;
}

// BARU: Fungsi untuk mengupdate tampilan jumlah tebakan
function updateGuessDisplay() {
    if (state.gameSettings.mode === 'classic') {
        gameElements.guessDisplay.textContent = `Tebakan: ${state.attempts} / ${TOTAL_GUESSES}`;
        gameElements.guessDisplay.classList.remove('hidden');
    } else {
        gameElements.guessDisplay.classList.add('hidden');
    }
}

/** Memulai permainan */
function startGame() {
  // Ambil pengaturan dari menu
  state.gameSettings.difficulty = menuElements.difficultySelect.value;
  state.gameSettings.mode = menuElements.modeSelect.value; // BARU: Baca mode permainan
  const selectedGens = [];
  menuElements.genCheckboxes.forEach(box => {
      if (box.checked) selectedGens.push(box.id);
  });
  state.gameSettings.generations = selectedGens;
  
  if (state.gameSettings.generations.length === 0) {
      alert("Pilih minimal satu generasi untuk bermain!");
      return;
  }

  // Reset state game
  state.score = 0;
  state.attempts = 0;
  updateScoreUI();
  updateGuessDisplay(); // BARU: Panggil saat game mulai

  showScreen('game');
  nextRound();
}

/** Mengakhiri permainan */
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

/** Fungsi untuk localStorage */
function getHighScore() {
  return localStorage.getItem('pokemonHighScore') || 0;
}

function saveHighScore(score) {
  localStorage.setItem('pokemonHighScore', score);
}

/** Inisialisasi awal */
function init() {
  menuElements.startGameBtn.addEventListener('click', startGame);
  gameOverElements.playAgainBtn.addEventListener('click', startGame);
  gameOverElements.mainMenuBtn.addEventListener('click', () => {
    menuElements.highScoreDisplay.textContent = getHighScore();
    showScreen('start');
  });

  menuElements.highScoreDisplay.textContent = getHighScore();
  showScreen('start');
}

// === MULAI APLIKASI ===
init();
