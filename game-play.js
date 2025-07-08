const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startGameBtn = document.getElementById('startGameBtn');
const quitBtn = document.getElementById('quitBtn');
const quitFailBtn = document.getElementById('quitFailBtn');
const restartBtn = document.getElementById('restartBtn');

const countdown = document.getElementById('countdown');

const questionModal = document.getElementById('failModal');
const questionForm = document.getElementById('questionForm');
const submitAnswersBtn = document.getElementById('submitAnswersBtn');

const gameOverModal = document.getElementById('gameOverModal');
const finalScoreText = document.getElementById('finalScore');

let bird = {
  x: 80,
  y: 300,
  radius: 15,
  velocity: 0,
  gravity: 0.6,
  jumpStrength: -10
};

let pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 3;

let gameRunning = false;
let score = 0;
let questionIndex = 0;
let correctAnswers = 0;
let questionsAsked = 0;
const maxQuestions = 3;

const questions = [
  {
    question: "What programming language do I code in?",
    options: ["Python", "Swift", "JavaScript", "C++"],
    answer: 1
  },
  {
    question: "Which role did I hold in 2023?",
    options: ["Chairperson", "Exco Member", "Assistant COO", "Junior DCL"],
    answer: 0
  },
  {
    question: "What is my favorite field?",
    options: ["Leadership", "Sports", "Cybersecurity", "Music"],
    answer: 2
  },
  // Add more questions as needed
];

let animationId;

function resetGame() {
  bird.y = 300;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  questionIndex = 0;
  correctAnswers = 0;
  questionsAsked = 0;
  gameRunning = false;
  clearCanvas();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBird() {
  ctx.beginPath();
  ctx.fillStyle = '#2563eb';
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function createPipe() {
  const minHeight = 50;
  const maxHeight = canvas.height - pipeGap - minHeight;
  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  const bottomHeight = canvas.height - topHeight - pipeGap;
  pipes.push({ x: canvas.width, top: topHeight, bottom: bottomHeight, width: pipeWidth });
}

function drawPipes() {
  ctx.fillStyle = '#16a34a';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
  });
}

function update() {
  if (!gameRunning) return;

  clearCanvas();

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  drawBird();
  drawPipes();

  pipes.forEach(pipe => pipe.x -= pipeSpeed);

  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
    createPipe();
  }

  if (pipes.length && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
    score++;
  }

  // Collision detection
  for (const pipe of pipes) {
    if (
      bird.x + bird.radius > pipe.x &&
      bird.x - bird.radius < pipe.x + pipe.width &&
      (bird.y - bird.radius < pipe.top || bird.y + bird.radius > canvas.height - pipe.bottom)
    ) {
      pauseGame();
      return;
    }
  }

  if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
    pauseGame();
    return;
  }

  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);

  animationId = requestAnimationFrame(update);
}

function jump() {
  if (!gameRunning) return;
  bird.velocity = bird.jumpStrength;
}

function pauseGame() {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  showQuestion();
}

function showQuestion() {
  if (questionsAsked >= maxQuestions) {
    showGameOver();
    return;
  }

  questionModal.classList.remove('hidden');
  questionForm.innerHTML = '';

  const currentQ = questions[questionIndex];
  const questionText = document.createElement('p');
  questionText.textContent = currentQ.question;
  questionText.className = 'mb-4 font-semibold';
  questionForm.appendChild(questionText);

  currentQ.options.forEach((opt, idx) => {
    const optionId = `option${idx}`;

    const label = document.createElement('label');
    label.htmlFor = optionId;
    label.className = 'flex items-center gap-2 cursor-pointer select-none';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.id = optionId;
    input.value = idx;
    input.className = 'mr-3 accent-accent w-6 h-6 rounded-full cursor-pointer';

    label.appendChild(input);
    label.appendChild(document.createTextNode(opt));

    questionForm.appendChild(label);
  });
}

submitAnswersBtn.addEventListener('click', () => {
  const selectedInput = questionForm.querySelector('input[name="answer"]:checked');
  if (!selectedInput) {
    alert('Please select an answer.');
    return;
  }
  const selected = selectedInput.value;

  const correct = questions[questionIndex].answer == selected;
  if (correct) correctAnswers++;
  questionsAsked++;
  questionIndex = (questionIndex + 1) % questions.length;

  questionModal.classList.add('hidden');

  if (correctAnswers >= 2) {
    resumeGame();
  } else if (questionsAsked >= maxQuestions) {
    showGameOver();
  } else {
    showQuestion();
  }
});

quitBtn.addEventListener('click', () => {
  location.href = 'index.html';
});

quitFailBtn.addEventListener('click', () => {
  location.href = 'index.html';
});

restartBtn.addEventListener('click', () => {
  gameOverModal.classList.add('hidden');
  resetGame();
  startCountdown();
});

function resumeGame() {
  gameRunning = true;
  update();
}

function showGameOver() {
  gameOverModal.classList.remove('hidden');
  finalScoreText.textContent = `Your final score: ${score}`;
  questionModal.classList.add('hidden');
}

function startCountdown() {
  countdown.classList.remove('hidden');
  let count = 3;
  countdown.textContent = count;
  const interval = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(interval);
      countdown.classList.add('hidden');
      startGame();
    } else {
      countdown.textContent = count;
    }
  }, 1000);
}

function startGame() {
  resetGame();
  gameRunning = true;
  update();
}

startGameBtn.addEventListener('click', () => {
  document.getElementById('instructionSection').classList.add('hidden');
  canvas.classList.remove('hidden');
  startCountdown();
});

window.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    jump();
  }
});

canvas.addEventListener('click', jump);
