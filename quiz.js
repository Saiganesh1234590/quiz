const app = document.getElementById("app");

let score = 0;
let questionIndex = 0;
let questions = [];
let currentLevel = 1; // Start at Level 1
const maxLevels = 100; // up to Level 100
const questionsPerLevel = 3;

// Decide difficulty based on level
function getDifficulty(level) {
  if (level <= 30) return "easy";
  if (level <= 70) return "medium";
  return "hard";
}

async function fetchQuestions(difficulty) {
  const res = await fetch(`https://opentdb.com/api.php?amount=${questionsPerLevel}&difficulty=${difficulty}&type=multiple`);
  const data = await res.json();
  return data.results.map(q => {
    const options = [...q.incorrect_answers, q.correct_answer];
    options.sort(() => Math.random() - 0.5); // shuffle
    return {
      question: q.question,
      options,
      answer: q.correct_answer
    };
  });
}

async function startQuiz() {
  score = 0;
  currentLevel = 1;
  questionIndex = 0;
  questions = await fetchQuestions(getDifficulty(currentLevel));
  renderQuestion();
}

function renderProgressBar() {
  const percent = ((currentLevel - 1) / maxLevels) * 100;
  return `
    <div class="w-full bg-gray-200 rounded-full h-4 mb-6 shadow-inner">
      <div class="bg-green-500 h-4 rounded-full transition-all duration-500" style="width: ${percent}%;"></div>
    </div>
    <p class="text-sm font-medium text-gray-600 mb-4">Level ${currentLevel} / ${maxLevels}</p>
  `;
}

function renderQuestion() {
  if (questionIndex >= questions.length) {
    // Level completed
    if (currentLevel < maxLevels) {
      currentLevel++;
      questionIndex = 0;
      loadNextLevel();
    } else {
      renderResults();
    }
    return;
  }

  const q = questions[questionIndex];

  app.innerHTML = `
    ${renderProgressBar()}
    <h1 class="text-2xl font-bold mb-2 text-gray-800">Level ${currentLevel} (${getDifficulty(currentLevel).toUpperCase()})</h1>
    <h2 class="text-xl font-semibold mb-4 text-gray-700">Question ${questionIndex + 1} of ${questionsPerLevel}</h2>
    <p class="text-lg mb-6 text-gray-700">${q.question}</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      ${q.options.map(option => `
        <button class="option-btn w-full py-3 rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-lg font-semibold shadow-md" data-option="${option}">
          ${option}
        </button>
      `).join("")}
    </div>
    <p class="text-md font-medium text-gray-600 mb-4">Score: ${score}</p>
  `;

  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => handleAnswer(btn.dataset.option));
  });
}

function handleAnswer(option) {
  const q = questions[questionIndex];
  if (option === q.answer) {
    score++;
    alert("✅ Correct!");
  } else {
    alert("❌ Incorrect! Correct Answer: " + q.answer);
  }
  questionIndex++;
  renderQuestion();
}

async function loadNextLevel() {
  alert(`🎉 Congrats! You cleared Level ${currentLevel - 1}. Now moving to Level ${currentLevel}!`);
  questions = await fetchQuestions(getDifficulty(currentLevel));
  renderQuestion();
}

function renderResults() {
  app.innerHTML = `
    <h2 class="text-3xl font-bold mb-4 text-gray-800">🏆 You completed all ${maxLevels} levels!</h2>
    <p class="text-xl font-medium mb-6 text-gray-700">Your Final Score: ${score} / ${maxLevels * questionsPerLevel}</p>
    <button onclick="startQuiz()" class="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md">Restart Quiz</button>
  `;
}

startQuiz();
