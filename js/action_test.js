let questions = [];
let current = 0;
let score = 0;

// 🔹 Carregar perguntas do JSON
async function loadQuestions() {
  try {
    const response = await fetch('../JSON/questions.json');
    questions = await response.json();

    // 🔀 Embaralhar questões (Fisher-Yates)
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    loadQuestion();
  } catch (error) {
    document.getElementById("question").textContent = "Erro ao carregar perguntas.";
    console.error(error);
  }
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
}

function checkAnswer(selected) {
  const q = questions[current];
  const feedback = document.getElementById("feedback");

  if (selected === q.answer) {
    feedback.textContent = "✅ Correto! " + q.explanation;
    score++;
  } else {
    feedback.textContent = "❌ Errado! " + q.explanation;
  }

  document.getElementById("score").textContent = `Pontuação: ${score}`;

  current++;
  if (current < questions.length) {
    setTimeout(() => {
      feedback.textContent = "";
      loadQuestion();
    }, 2000);
  } else {
    setTimeout(() => {
      document.querySelector(".container").innerHTML = `
        <h2>Fim do jogo!</h2>
        <p>Sua pontuação: ${score}/${questions.length}</p>
        <button onclick="location.reload()" style="margin-top:15px;padding:10px 15px;border:none;border-radius:8px;background:#28a745;color:white;cursor:pointer;">
          Jogar novamente
        </button>
      `;
    }, 2000);
  }
}

loadQuestions();