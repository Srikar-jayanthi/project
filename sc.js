let doubtsData = JSON.parse(localStorage.getItem("doubtsData")) || [];
let isAdmin = false;

const form = document.getElementById('doubtForm');
const questionsList = document.getElementById('questionsList');
const filterDropdown = document.getElementById('filter');
const searchInput = document.getElementById('searchInput');
const clearAllBtn = document.getElementById('clearAllBtn');

window.addEventListener("load", () => {
  const role = localStorage.getItem("userRole");
  isAdmin = role === "admin";
  if (isAdmin) enableAdminControls();
  else disableAdminControls();
  loadDoubts();
});

function enableAdminControls() {
  clearAllBtn.style.display = "inline-block";
}

function disableAdminControls() {
  clearAllBtn.style.display = "none";
}

function saveDoubts() {
  localStorage.setItem("doubtsData", JSON.stringify(doubtsData));
}

function updateStats() {
  document.getElementById("totalQuestions").textContent = doubtsData.length;
  const totalAnswers = doubtsData.reduce((sum, d) => sum + (Array.isArray(d.answers) ? d.answers.length : 0), 0);
  document.getElementById("totalAnswers").textContent = totalAnswers;
  const answered = doubtsData.filter(d => d.answers?.length).length;
  document.getElementById("answeredQuestions").textContent = answered;
}

function loadDoubts(filter = "All") {
  questionsList.innerHTML = "";
  const searchTerm = searchInput.value.toLowerCase().trim();

  const filtered = doubtsData.filter(d => {
    const matchCategory = filter === "All" || d.category === filter;
    const matchSearch = d.question.toLowerCase().includes(searchTerm);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    questionsList.innerHTML = `
      <div class="no-questions">
        <i class="fas fa-comments"></i>
        <h3>No questions found</h3>
        <p>Try a different category or search term.</p>
      </div>
    `;
    updateStats();
    return;
  }

  filtered.forEach((doubt, i) => {
    const realIndex = doubtsData.findIndex(d =>
      d.category === doubt.category &&
      d.question === doubt.question &&
      d.timestamp === doubt.timestamp
    );
    showQuestion(doubt, realIndex);
  });

  updateStats();
}

function showQuestion(doubt, index) {
  const div = document.createElement('div');
  div.className = 'question-card';

  let answersHTML = '';
  if (doubt.answers?.length) {
    answersHTML = `
      <div class="answers-section">
        <h4><i class="fas fa-comments"></i> Answers (${doubt.answers.length}):</h4>
        ${doubt.answers.map(ans => `<div class="answer-item">${ans}</div>`).join('')}
      </div>
    `;
  }

  div.innerHTML = `
    <div class="card-header">
      <div class="category-badge">${doubt.category}</div>
      <div style="display: flex; gap: 10px;">
        ${isAdmin ? `
          <button class="clear-answers-btn" onclick="clearAnswers(${index})" title="Clear all answers">
            <i class="fas fa-eraser"></i>
          </button>
          <button class="delete-btn" onclick="deleteDoubt(${index})" title="Delete this question">
            <i class="fas fa-trash-alt"></i>
          </button>
        ` : ``}
      </div>
    </div>
    <div class="question-text">${doubt.question}</div>
    ${answersHTML}
    ${isAdmin ? `
      <button class="btn" onclick="showAnswerBox(${index})" id="answerBtn-${index}">
        <i class="fas fa-reply"></i> Answer Question
      </button>
      <div id="answerSection-${index}" class="answer-section" style="display: none;">
        <textarea id="answerInput-${index}" class="answer-input" rows="3" placeholder="Type your answer here..."></textarea>
        <button class="btn" onclick="submitAnswer(${index})">
          <i class="fas fa-check"></i> Submit Answer
        </button>
        <button class="btn" onclick="hideAnswerBox(${index})" style="background: linear-gradient(135deg, #6b7280, #4b5563);">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    ` : ``}
  `;

  questionsList.appendChild(div);
}

function showAnswerBox(index) {
  document.getElementById(`answerSection-${index}`).style.display = "block";
  document.getElementById(`answerBtn-${index}`).style.display = "none";
  document.getElementById(`answerInput-${index}`).focus();
}

function hideAnswerBox(index) {
  document.getElementById(`answerSection-${index}`).style.display = "none";
  document.getElementById(`answerBtn-${index}`).style.display = "inline-flex";
  document.getElementById(`answerInput-${index}`).value = "";
}

function submitAnswer(index) {
  const input = document.getElementById(`answerInput-${index}`);
  const answer = input.value.trim();
  if (!answer) return;
  if (!Array.isArray(doubtsData[index].answers)) doubtsData[index].answers = [];
  doubtsData[index].answers.push(answer);
  saveDoubts();
  loadDoubts(filterDropdown.value);
}

function deleteDoubt(index) {
  if (!isAdmin) return alert("Only admin can delete questions.");
  if (!confirm("Delete this question?")) return;
  doubtsData.splice(index, 1);
  saveDoubts();
  loadDoubts(filterDropdown.value);
}

function clearAnswers(index) {
  if (!isAdmin) return alert("Only admin can clear answers.");
  if (!doubtsData[index].answers?.length) return alert("No answers to clear.");
  if (!confirm("Clear all answers?")) return;
  doubtsData[index].answers = [];
  saveDoubts();
  loadDoubts(filterDropdown.value);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const category = document.getElementById('category').value;
  const question = document.getElementById('question').value.trim();
  if (!category || !question) return;
  doubtsData.unshift({
    category,
    question,
    answers: [],
    timestamp: Date.now()
  });
  form.reset();
  filterDropdown.value = "All";
  searchInput.value = "";
  saveDoubts();
  loadDoubts();
});

filterDropdown.addEventListener('change', () => loadDoubts(filterDropdown.value));
searchInput.addEventListener('input', () => loadDoubts(filterDropdown.value));

clearAllBtn.addEventListener('click', () => {
  if (!isAdmin) return alert("Only admin can clear all doubts.");
  if (!confirm("Clear all doubts?")) return;
  doubtsData = [];
  saveDoubts();
  loadDoubts();
});

// Mobile UI controls
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.overlay');

hamburger.addEventListener('click', function () {
  this.classList.toggle('open');
  mobileMenu.classList.toggle('active');
  overlay.classList.toggle('active');
  document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

overlay.addEventListener('click', function () {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('active');
  this.classList.remove('active');
  document.body.style.overflow = '';
});

document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
  link.addEventListener('click', function () {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});
