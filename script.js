const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const TOTAL_GUESSES = 5;
const TIMER_DURATION = 10;

let score = 0;
let attempts = 0;
let correctPokemon = "";
let timer;
let answerSubmitted = false; // Flag untuk mencegah input ganda

const pokemonImage = document.getElementById("pokemon-image");
const optionsContainer = document.getElementById("options");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const feedbackDisplay = document.getElementById("feedback");

// Fungsi untuk mengambil Pokémon secara acak dari generasi 1-4
async function getRandomPokemon() {
  const randomId = Math.floor(Math.random() * 493) + 1; // Gen 1-4 (ID 1-493)
  const response = await fetch(API_URL + randomId);
  const data = await response.json();
  return {
    name: data.name,
    image: data.sprites.other["official-artwork"].front_default,
  };
}

// Fungsi untuk memulai game baru
async function startGame() {
  // Reset flag untuk pertanyaan baru
  answerSubmitted = false;
  // Bersihkan feedback sebelumnya
  feedbackDisplay.textContent = "";

  if (attempts >= TOTAL_GUESSES) {
    alert(`Game Over! Skor Akhir: ${score}`);
    resetGame();
    return;
  }

  // Pastikan gambar di-reset ke mode siluet
  pokemonImage.classList.add("silhouette");

  // Bersihkan opsi jawaban sebelumnya dan timer
  optionsContainer.innerHTML = "";
  clearInterval(timer);

  const correctData = await getRandomPokemon();
  correctPokemon = correctData.name;
  pokemonImage.src = correctData.image;

  // Mengumpulkan opsi jawaban (benar + 3 salah)
  const options = new Set();
  options.add(correctPokemon);
  while (options.size < 4) {
    const randomOption = (await getRandomPokemon()).name;
    options.add(randomOption);
  }

  // Acak opsi jawaban
  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
  shuffledOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add(
      "bg-blue-600",
      "hover:bg-blue-700",
      "text-white",
      "p-2",
      "rounded"
    );
    // Tambahkan event listener, cek flag answerSubmitted agar klik ganda tidak diproses
    button.addEventListener("click", () => {
      if (!answerSubmitted) {
        answerSubmitted = true;
        checkAnswer(option);
      }
    });
    optionsContainer.appendChild(button);
  });

  startTimer();
}

// Fungsi untuk mengecek jawaban
function checkAnswer(selected) {
  clearInterval(timer);
  // Tampilkan gambar asli dengan menghapus efek siluet
  pokemonImage.classList.remove("silhouette");

  if (selected !== correctPokemon) {
    // Jika jawaban salah, tampilkan feedback jawaban yang benar
    feedbackDisplay.textContent = `Jawaban yang benar adalah: ${correctPokemon}`;
  } else {
    score++;
  }
  attempts++;
  scoreDisplay.textContent = `Score: ${score}`;

  // Tampilkan gambar asli selama 2 detik sebelum lanjut ke pertanyaan berikutnya
  setTimeout(() => {
    startGame();
  }, 2000);
}

// Fungsi untuk memulai timer
function startTimer() {
  let timeLeft = TIMER_DURATION;
  timerDisplay.textContent = `Time: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      // Hanya proses jika belum ada jawaban yang dipilih
      if (!answerSubmitted) {
        answerSubmitted = true;
        pokemonImage.classList.remove("silhouette");
        feedbackDisplay.textContent = `Jawaban yang benar adalah: ${correctPokemon}`;
        attempts++;
        setTimeout(() => {
          startGame();
        }, 2000);
      }
    }
  }, 1000);
}

// Fungsi untuk mereset game
function resetGame() {
  score = 0;
  attempts = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  startGame();
}

// Mulai game saat halaman dimuat
startGame();