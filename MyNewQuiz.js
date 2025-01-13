// Globals
let atQuestion = 1;
let userAnswers = [];
let quizData = {};
let timerInterval;

// Load quiz data from selected quiz JSON file
async function loadQuiz() {
  const selectedQuizFile = localStorage.getItem("selectedQuiz");

  if (!selectedQuizFile) {
    alert("No quiz selected. Redirecting to home page...");
    window.location.href = "musabHome.html";
    return;
  }

  try {
    const response = await fetch(selectedQuizFile);
    quizData = await response.json();
    setupQuiz();
  } catch (error) {
    console.error("Error loading quiz data:", error);
    alert("Failed to load quiz. Redirecting to home page.");
    window.location.href = "musabHome.html";
  }
}

// Initialize quiz setup
function setupQuiz() {
  document.querySelector("#QuizName").textContent = `${quizData.name} Quiz`;
  document.querySelector("#totalQuestions").textContent =
    quizData.questions.length;
  loadQuestion(atQuestion);
  document.querySelector(".quizSubmitBtn").style.display = "none";
  disableNext();
}

// Load a specific question
function loadQuestion(index) {
  const question = quizData.questions[index - 1];
  const middleBlock = document.querySelector("#QmiddleBlock");

  middleBlock.innerHTML = `
    <div class="questionBlock">
      <div class="questionText">${index}. ${question.question}</div>
      <div class="answersBlock">
        ${question.answers
          .map(
            (answer, i) => `
            <div class="answer" data-question-index="${index}" data-answer-index="${
              i + 1
            }">
              <input type="radio" name="question${index}" id="answer${i}" ${
              userAnswers[index - 1] === i + 1 ? "checked" : ""
            }>
              <label for="answer${i}">${answer}</label>
            </div>
          `
          )
          .join("")}
      </div>
    </div>
  `;
  document.querySelector("#questionNumberDynamic").textContent = index;
  disableNext();
  startTimer(); // Start the timer for the current question
}

// Record the user's selected answer
document.addEventListener("click", (event) => {
  if (event.target.closest(".answer")) {
    const answerDiv = event.target.closest(".answer");
    const questionIndex = parseInt(answerDiv.dataset.questionIndex, 10);
    const answerIndex = parseInt(answerDiv.dataset.answerIndex, 10);
    selectAnswer(questionIndex, answerIndex);
  }
});

function selectAnswer(questionIndex, answerIndex) {
  userAnswers[questionIndex - 1] = answerIndex;
  const answers = document.querySelectorAll(
    `[data-question-index="${questionIndex}"]`
  );
  answers.forEach((answer, index) => {
    if (index === answerIndex - 1) {
      answer.classList.add("selected");
      answer.querySelector("input[type='radio']").checked = true;
    } else {
      answer.classList.remove("selected");
      answer.querySelector("input[type='radio']").checked = false;
    }
  });
  enableNext();
}

// Enable/Disable Next button
function enableNext() {
  const nextButton = document.querySelector(".NextBtn");
  nextButton.style.backgroundColor = "var(--primary-color)";
  nextButton.disabled = false;
}

function disableNext() {
  const nextButton = document.querySelector(".NextBtn");

  nextButton.disabled = true;
  nextButton.style.backgroundColor = "gray";
}

// Navigate to the next question
document.querySelector(".NextBtn").addEventListener("click", () => {
  if (atQuestion < quizData.questions.length) {
    atQuestion++;
    loadQuestion(atQuestion);
    if (atQuestion === quizData.questions.length) {
      document.querySelector(".NextBtn").style.display = "none";
      document.querySelector(".quizSubmitBtn").style.display = "block";
    }
  }
});

// Submit quiz and save results in sessionStorage
// document.querySelector(".quizSubmitBtn").addEventListener("click", () => {
//   clearInterval(timerInterval);

//   const correctAnswers = quizData.questions.map((q) => q.correct);
//   const totalQuestions = quizData.questions.length;
//   const correctCount = userAnswers.reduce(
//     (acc, answer, index) => (answer === correctAnswers[index] ? acc + 1 : acc),
//     0
//   );
//   const score = ((correctCount / totalQuestions) * 100).toFixed(2);

//   // Save results in sessionStorage
//   sessionStorage.setItem("userAnswers", JSON.stringify(userAnswers));
//   sessionStorage.setItem("correctAnswers", JSON.stringify(correctAnswers));
//   sessionStorage.setItem("questions", JSON.stringify(quizData.questions));
//   sessionStorage.setItem("score", score);

//   // Redirect to results page
//   window.location.href = "AshjanResultPage.html"; // Update path if necessary
// });

document.querySelector("#submitButton").addEventListener("click", () => {
  clearInterval(timerInterval);

  const correctAnswers = quizData.questions.map((q) => q.correct);
  const totalQuestions = quizData.questions.length;
  const correctCount = userAnswers.reduce(
    (acc, answer, index) => (answer === correctAnswers[index] ? acc + 1 : acc),
    0
  );
  const score = ((correctCount / totalQuestions) * 100).toFixed(2);

  // Store results in sessionStorage
  sessionStorage.setItem("userAnswers", JSON.stringify(userAnswers));
  sessionStorage.setItem("correctAnswers", JSON.stringify(correctAnswers));
  sessionStorage.setItem("questions", JSON.stringify(quizData.questions));
  sessionStorage.setItem("score", score);

  // Redirect to the results page
  window.location.href = "results.html"; // Update the path to the result page
});

// Simplified Timer countdown
// Simplified Timer countdown
function startTimer() {
  let timer = 35; // Start at 3 seconds (يمكن تعديله حسب الحاجة)
  const timerElement = document.getElementById("time"); // عنصر عرض المؤقت

  clearInterval(timerInterval); // إيقاف أي مؤقت سابق
  timerInterval = setInterval(() => {
    timerElement.textContent = `${timer}`; // تحديث عرض المؤقت

    if (--timer < 0) {
      // عندما يصل المؤقت إلى 0
      clearInterval(timerInterval);
      if (atQuestion < quizData.questions.length) {
        if (!userAnswers[atQuestion - 1]) {
          userAnswers[atQuestion - 1] = null;
        }

        atQuestion++;
        loadQuestion(atQuestion);

        if (atQuestion === quizData.questions.length) {
          document.querySelector(".NextBtn").style.display = "none";
          document.querySelector(".quizSubmitBtn").style.display = "block";
        }
      } else {
        document.querySelector(".quizSubmitBtn").click();
      }
    }
  }, 1000);
}

// Start the quiz
window.addEventListener("load", () => {
  loadQuiz();
});

// checking user access
window.onload = function () {
  if (sessionStorage.getItem("user") !== "true") {
    alert("please log in");
    window.location.href = "login.html";
  }
};
