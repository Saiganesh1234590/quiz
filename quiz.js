const app = document.getElementById("app");

// total levels
const TOTAL_LEVELS = 100;
let level = 1;
let currentQ = 0;
let score = 0;
let questions = [];

// Fetch questions from API
async function fetchQuestions(difficulty) {
  const res = await fetch(`https://opentdb.com/api.php?amount=3&difficulty=${difficulty}&type=multiple`);
  const data = await res.json();
  return data.results.map(q => {
    const options = [...q.incorrect_answers];
    const randIndex = Math.floor(Math.random() * (options.length + 1));
    options.splice(randIndex, 0, q.correct_answer);
    return {
      question: q.question,
      options,
      answer: q.correct_answer
    };
  });
}

// Decide difficulty based on level
function getDifficulty(level) {
  if (level <= 30) return "easy";
  if (level <= 70) return "medium";
  return "hard";
}

// Start level
async function startLevel() {
  const difficulty = getDifficulty(level);
  questions = await fetchQuestions(difficulty);
  currentQ = 0;
  renderQuestion();
}

// Render progress bar
function renderProgress() {
  const progressPercent = (level / TOTAL_LEVELS) * 100;
  return `
    <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
      <div class="bg-indigo-600 h-3 rounded-full" style="width:${progressPercent}%"></div>
    </div>
  `;
}

// Render question
function renderQuestion(feedback = "", selected = "") {
  const q = questions[currentQ];

  app.innerHTML = `
    <h1 class="text-xl font-bold mb-2">Level ${level}</h1>
    ${renderProgress()}
    <p class="text-md mb-4">Score: ${score} | Question ${currentQ + 1} of ${questions.length}</p>
    <p class="text-lg font-semibold mb-4">${q.question}</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      ${q.options
        .map(
          (opt) => `
          <button 
            class="w-full py-2 px-4 rounded-xl font-medium shadow-md transition ${
              selected
                ? opt === q.answer
                  ? "bg-green-500 text-white"
                  : opt === selected
                  ? "bg-red-500 text-white"
                  : "bg-gray-200"
                : "bg-white hover:bg-indigo-100"
            }"
            onclick="handleAnswer('${opt}')"
            ${selected ? "disabled" : ""}
          >
            ${opt}
          </button>
        `
        )
        .join("")}
    </div>
    ${
      feedback
        ? `<p class="mb-4 text-lg font-medium">${feedback}</p>
           <button onclick="nextQuestion()" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Next</button>`
        : ""
    }
  `;
}

// Handle answer
function handleAnswer(option) {
  const q = questions[currentQ];
  if (option === q.answer) {
    score++;
    renderQuestion("✅ Correct!", option);
  } else {
    renderQuestion(`❌ Incorrect! Correct: ${q.answer}`, option);
  }
}

// Next question or level
function nextQuestion() {
  if (currentQ + 1 < questions.length) {
    currentQ++;
    renderQuestion();
  } else {
    if (level < TOTAL_LEVELS) {
      level++;
      startLevel();
    } else {
      renderResults();
    }
  }
}

// Results screen
function renderResults() {
  app.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">🎉 Quiz Completed!</h2>
    <p class="text-lg mb-6">Your Final Score: ${score} / ${TOTAL_LEVELS * 3}</p>
    <button onclick="restartQuiz()" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl">Restart Quiz</button>
  `;
}

// Restart quiz
function restartQuiz() {
  level = 1;
  score = 0;
  startLevel();
}

// Start the first level
startLevel();
