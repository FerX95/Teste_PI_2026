let questions = [];
let current = 0;
let score = 0;
let lives = 3;
let questionStartedAt = 0;
let timerInterval = null;

const maxPointsPerQuestion = 100;
const mediumPointsPerQuestion = 50;
const minimumPointsPerQuestion = 10;
const maxPointsLimitSeconds = 120;
const mediumPointsLimitSeconds = 240;
const answerFeedbackDelay = 4000;

const themeToggle = document.getElementById("theme-toggle");
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
    <h2>${message}</h2>
    <p>Pontuacao final: ${score}</p>
    <div class="final-lives" aria-label="Vidas restantes: ${lives}">${remainingHearts}</div>
    <button class="restart-button" onclick="location.reload()">Jogar novamente</button>
  `;
}

function loadQuestion() {
  const q = questions[current];
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
    score += earnedPoints;
    feedback.classList.add("correct");
    feedback.textContent = `Correto! +${earnedPoints} pontos. ${q.explanation}`;
  } else {
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

loadQuestions();
