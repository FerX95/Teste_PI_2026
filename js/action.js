const questions = [
  {
    question: "Um produto custa R$100 à vista ou 2x de R$60. Qual é mais vantajoso?",
    options: ["À vista", "Parcelado"],
    answer: "À vista",
    explanation: "Parcelado = 120, à vista = 100"
  },
  {
    question: "Juros simples: R$200 a 10% ao mês por 2 meses. Total?",
    options: ["R$220", "R$240", "R$260"],
    answer: "R$240",
    explanation: "J = 200*0.1*2 = 40 → total 240"
  },
  {
    question: "Juros compostos: R$100 a 10% por 2 meses. Total aproximado?",
    options: ["R$120", "R$121", "R$122"],
    answer: "R$121",
    explanation: "100*(1.1)^2 = 121"
  }
];

let current = 0;
let score = 0;

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
        </button>`
        ;
    }, 2000);
  }
}

loadQuestion();