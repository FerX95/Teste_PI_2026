let questions = [];
let current = 0;
let score = 0;
let lives = 3;
let correctAnswers = 0;
let wrongAnswers = 0;
let playerName = "";
let playerAvatar = "img/avatars/avatar_01.png";
let gameStarted = false;
let questionStartedAt = 0;
let timerInterval = null;

const maxPointsPerQuestion = 100;
const mediumPointsPerQuestion = 50;
const minimumPointsPerQuestion = 10;
const maxPointsLimitSeconds = 120;
const mediumPointsLimitSeconds = 240;
const answerFeedbackDelay = 4000;

const themeToggle = document.getElementById("theme-toggle");
const startButton = document.getElementById("start-button");
const helpButton = document.getElementById("help-button");
const backButton = document.getElementById("back-button");
const playerNameInput = document.getElementById("player-name");
const savedTheme = localStorage.getItem("theme");

function updateThemeButton() {
  const isDarkTheme = document.body.classList.contains("dark-theme");
  themeToggle.textContent = isDarkTheme ? "Tema claro" : "Tema escuro";
  themeToggle.setAttribute(
    "aria-label",
    isDarkTheme ? "Alternar para tema claro" : "Alternar para tema escuro"
  );
}

if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const isDarkTheme = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  updateThemeButton();
});

updateThemeButton();

startButton.addEventListener("click", startGame);
helpButton.addEventListener("click", showHelp);
backButton.addEventListener("click", showStartScreen);

playerNameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    startGame();
  }
});

function showHelp() {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("help-screen").classList.remove("hidden");
}

function showStartScreen() {
  document.getElementById("help-screen").classList.add("hidden");
  document.getElementById("start-screen").classList.remove("hidden");
  playerNameInput.focus();
}

function startGame() {
  if (gameStarted) {
    return;
  }

  gameStarted = true;
  playerName = playerNameInput.value.trim() || "Jogador";
  playerAvatar = document.querySelector('input[name="avatar"]:checked').value;
  startButton.disabled = true;
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  loadQuestions();
}

async function loadQuestions() {
  const questionElement = document.getElementById("question");
  questionElement.textContent = "Carregando perguntas...";

  try {
    const response = await fetch("JSON/questions.json");

    if (!response.ok) {
      throw new Error("Nao foi possivel carregar o arquivo de perguntas.");
    }

    questions = await response.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("O arquivo de perguntas esta vazio ou invalido.");
    }

    shuffleQuestions();
    updateStatus();
    loadQuestion();
  } catch (error) {
    questionElement.textContent = "Erro ao carregar perguntas.";
    document.getElementById("options").innerHTML = "";
    console.error(error);
  }
}

function shuffleQuestions() {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
}

function updateStatus() {
  const livesElement = document.getElementById("lives");
  livesElement.innerHTML = "";
  livesElement.setAttribute("aria-label", `Vidas: ${lives}`);

  for (let i = 0; i < lives; i++) {
    const heart = document.createElement("img");
    heart.src = "img/heart.png";
    heart.alt = "";
    heart.className = "heart-icon";
    livesElement.appendChild(heart);
  }

  document.getElementById("score").textContent = `Pontos: ${score}`;
}

function updateQuestionProgress() {
  document.getElementById("question-progress").textContent = `Questao ${current + 1} de ${questions.length}`;
}

function updateTimer() {
  return (Date.now() - questionStartedAt) / 1000;
}

function startTimer() {
  clearInterval(timerInterval);
  questionStartedAt = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function calculateSpeedPoints() {
  const elapsedSeconds = (Date.now() - questionStartedAt) / 1000;

  if (elapsedSeconds <= maxPointsLimitSeconds) {
    return maxPointsPerQuestion;
  }

  if (elapsedSeconds <= mediumPointsLimitSeconds) {
    return mediumPointsPerQuestion;
  }

  return minimumPointsPerQuestion;
}

function disableOptions() {
  document.querySelectorAll(".options button").forEach(button => {
    button.disabled = true;
  });
}

function finishGame(message) {
  stopTimer();
  const remainingHearts = Array.from({ length: lives }, () => (
    '<img class="heart-icon" src="img/heart.png" alt="">'
  )).join("");

  document.querySelector(".container").innerHTML = `
    <div class="final-screen">
      <h2>${message}</h2>
      <div class="player-summary">
        <img class="player-avatar-final" src="${playerAvatar}" alt="">
        <div>
          <span class="final-label">Jogador</span>
          <strong>${playerName}</strong>
        </div>
      </div>

      <div class="final-score-card">
        <span class="final-label">Pontuacao final</span>
        <strong>${score}</strong>
      </div>

      <div class="final-stats">
        <div class="final-stat">
          <span class="final-label">Corretas</span>
          <strong>${correctAnswers}</strong>
        </div>
        <div class="final-stat">
          <span class="final-label">Erradas</span>
          <strong>${wrongAnswers}</strong>
        </div>
      </div>

      <div class="final-lives-box">
        <span class="final-label">Vidas restantes</span>
        <div class="final-lives" aria-label="Vidas restantes: ${lives}">${remainingHearts}</div>
      </div>
    </div>
    <button class="restart-button" onclick="location.reload()">Jogar novamente</button>
  `;
}

function loadQuestion() {
  const q = questions[current];
  updateQuestionProgress();
  document.getElementById("question").textContent = q.question;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option);
    optionsDiv.appendChild(btn);
  });

  updateStatus();
  startTimer();
}

function checkAnswer(selected) {
  const q = questions[current];
  const feedback = document.getElementById("feedback");
  const earnedPoints = calculateSpeedPoints();

  stopTimer();
  disableOptions();
  feedback.classList.remove("correct", "incorrect");

  if (selected === q.answer) {
    correctAnswers++;
    score += earnedPoints;
    feedback.classList.add("correct");
    feedback.textContent = `Correto! +${earnedPoints} pontos. ${q.explanation}`;
  } else {
    wrongAnswers++;
    lives--;
    feedback.classList.add("incorrect");
    feedback.textContent = `Errado! Voce perdeu 1 vida. ${q.explanation}`;
  }

  updateStatus();
  current++;

  if (lives <= 0) {
    setTimeout(() => {
      finishGame("Fim de jogo!");
    }, answerFeedbackDelay);
  } else if (current < questions.length) {
    setTimeout(() => {
      feedback.textContent = "";
      feedback.classList.remove("correct", "incorrect");
      loadQuestion();
    }, answerFeedbackDelay);
  } else {
    setTimeout(() => {
      finishGame("Fim do jogo!");
    }, answerFeedbackDelay);
  }
}

playerNameInput.focus();
