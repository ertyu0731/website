// game-play.js

// Tracks questions data
const questionsData = {
  leadership: [
    {
      question: "Your team is struggling to meet a deadline. What should you do?",
      options: [
        "Encourage the team and redistribute tasks",
        "Blame a team member publicly",
        "Ignore the problem and hope it resolves",
      ],
      answer: 0,
    },
    {
      question: "How do you handle conflict between team members?",
      options: [
        "Listen and mediate a fair solution",
        "Take sides with your favorite",
        "Avoid intervening",
      ],
      answer: 0,
    },
    {
      question: "What is a good leadership quality?",
      options: [
        "Being empathetic and supportive",
        "Always being strict and demanding",
        "Doing everything yourself without asking",
      ],
      answer: 0,
    },
  ],
  cyber: [
    {
      question: "What does 'phishing' mean?",
      options: [
        "Tricking users to reveal personal info",
        "Fishing in a river",
        "A type of programming language",
      ],
      answer: 0,
    },
    {
      question: "Which password is strongest?",
      options: [
        "Password123",
        "S3cure!P@55w0rd",
        "123456",
      ],
      answer: 1,
    },
    {
      question: "What should you do if you suspect malware?",
      options: [
        "Run antivirus and update software",
        "Ignore it",
        "Share it on social media",
      ],
      answer: 0,
    },
  ],
  cs: [
    {
      question: "What does 'HTML' stand for?",
      options: [
        "HyperText Markup Language",
        "HighText Machine Language",
        "Hyperlink and Text Markup Language",
      ],
      answer: 0,
    },
    {
      question: "Which language is used for iOS development?",
      options: [
        "Swift",
        "Python",
        "JavaScript",
      ],
      answer: 0,
    },
    {
      question: "What is a loop in programming?",
      options: [
        "Repeating a block of code",
        "A type of function",
        "A variable name",
      ],
      answer: 0,
    },
  ],
};

let selectedTrack = null;
let currentQuestionIndex = 0;
let correctCount = 0;
let failModal = document.getElementById("failModal");
let questionText = document.getElementById("questionText");
let questionForm = document.getElementById("questionForm");
let submitAnswersBtn = document.getElementById("submitAnswersBtn");
let quitBtn = document.getElementById("quitBtn");
let countdown = document.getElementById("countdown");
let gameCanvas = document.getElementById("gameCanvas");
let categoryModal = document.getElementById("categoryModal");
let instructionSection = document.getElementById("instructionSection");
let startGameBtn = document.getElementById("startGameBtn");

let ctx = gameCanvas.getContext("2d");

let gameState = {
  isPlaying: false,
  score: 0,
  birdY: 250,
  birdVelocity: 0,
  gravity: 0.5,
  jumpStrength: -10,
  pipes: [],
  pipeWidth: 50,
  pipeGap: 150,
  frameCount: 0,
  crashed: false,
};

// Listen for track buttons click
document.querySelectorAll(".track-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedTrack = btn.getAttribute("data-track");
    categoryModal.style.display = "none";
    instructionSection.classList.remove("hidden");
  });
});

// Start Game button
startGameBtn.addEventListener("click", () => {
  instructionSection.classList.add("hidden");
  startCountdown(() => {
    startGame();
  });
});

// Countdown before game start
function startCountdown(callback) {
  countdown.textContent = "3";
  countdown.classList.remove("hidden");
  let count = 3;
  let interval = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(interval);
      countdown.classList.add("hidden");
      callback();
    } else {
      countdown.textContent = count;
    }
  }, 1000);
}

// Game loop variables
let animationFrameId;
let keys = {};

// Event listeners for controls
window.addEventListener("keydown", e => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    keys.jump = true;
  }
});
window.addEventListener("keyup", e => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    keys.jump = false;
  }
});

// Start game logic
function startGame() {
  // Reset game state if new start or restart
  if (!gameState.isPlaying) {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.birdY = 250;
    gameState.birdVelocity = 0;
    gameState.pipes = [];
    gameState.frameCount = 0;
    gameState.crashed = false;
    spawnInitialPipes();
  }
  gameCanvas.classList.remove("hidden");
  gameLoop();
}

// Spawn pipes at start
function spawnInitialPipes() {
  gameState.pipes = [];
  for (let i = 0; i < 3; i++) {
    spawnPipe(400 + i * 200);
  }
}

function spawnPipe(x) {
  let topHeight = Math.floor(Math.random() * 200) + 50;
  gameState.pipes.push({ x, topHeight });
}

// Game loop
function gameLoop() {
  update();
  draw();
  if (!gameState.crashed) {
    animationFrameId = requestAnimationFrame(gameLoop);
  } else {
    // Stop game, show quiz
    gameState.isPlaying = false;
    showFailQuiz();
  }
}

// Update game state
function update() {
  gameState.frameCount++;
  // Bird gravity & jump
  if (keys.jump) {
    gameState.birdVelocity = gameState.jumpStrength;
  }
  gameState.birdVelocity += gameState.gravity;
  gameState.birdY += gameState.birdVelocity;

  // Floor and ceiling collision
  if (gameState.birdY > 600 - 40) {
    gameState.birdY = 600 - 40;
    gameState.crashed = true;
  }
  if (gameState.birdY < 0) {
    gameState.birdY = 0;
    gameState.birdVelocity = 0;
  }

  // Pipes movement
  for (let pipe of gameState.pipes) {
    pipe.x -= 2;
  }
  // Remove offscreen pipes and add new ones
  if (gameState.pipes.length > 0 && gameState.pipes[0].x < -gameState.pipeWidth) {
    gameState.pipes.shift();
    let lastPipeX = gameState.pipes[gameState.pipes.length - 1].x;
    spawnPipe(lastPipeX + 200);
    gameState.score++;
  }

  // Collision detection with pipes
  for (let pipe of gameState.pipes) {
    // Bird's rectangle
    let birdRect = { x: 50, y: gameState.birdY, width: 40, height: 30 };
    // Top pipe rect
    let topPipeRect = { x: pipe.x, y: 0, width: gameState.pipeWidth, height: pipe.topHeight };
    // Bottom pipe rect
    let bottomPipeRect = {
      x: pipe.x,
      y: pipe.topHeight + gameState.pipeGap,
      width: gameState.pipeWidth,
      height: 600 - pipe.topHeight - gameState.pipeGap,
    };

    if (rectIntersect(birdRect, topPipeRect) || rectIntersect(birdRect, bottomPipeRect)) {
      gameState.crashed = true;
    }
  }
}

// Rectangles intersection helper
function rectIntersect(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

// Draw game state
function draw() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw background sky
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw pipes
  ctx.fillStyle = "#2563eb";
  for (let pipe of gameState.pipes) {
    // Top pipe
    ctx.fillRect(pipe.x, 0, gameState.pipeWidth, pipe.topHeight);
    // Bottom pipe
    ctx.fillRect(pipe.x, pipe.topHeight + gameState.pipeGap, gameState.pipeWidth, 600 - pipe.topHeight - gameState.pipeGap);
  }

  // Draw bird (simple circle)
  ctx.fillStyle = "#facc15"; // Yellow
  ctx.beginPath();
  ctx.ellipse(50 + 20, gameState.birdY + 15, 20, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw score
  ctx.fillStyle = "#2563eb";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + gameState.score, 10, 30);
}

// Show quiz modal after fail
function showFailQuiz() {
  failModal.style.display = "flex";
  currentQuestionIndex = 0;
  correctCount = 0;
  loadQuestion();
}

// Load current question
function loadQuestion() {
  let questionObj = questionsData[selectedTrack][currentQuestionIndex];
  questionText.textContent = questionObj.question;
  questionForm.innerHTML = "";

  questionObj.options.forEach((opt, i) => {
    let id = `opt-${i}`;
    let label = document.createElement("label");
    label.className = "block";

    let input = document.createElement("input");
    input.type = "radio";
    input.name = "option";
    input.value = i;
    input.id = id;
    input.className = "mr-2";

    label.appendChild(input);
    label.appendChild(document.createTextNode(opt));
    questionForm.appendChild(label);
  });
}

// Submit quiz answers
submitAnswersBtn.addEventListener("click", () => {
  let selected = questionForm.querySelector("input[name=option]:checked");
  if (!selected) {
    alert("Please select an answer.");
    return;
  }
  let selectedAnswer = parseInt(selected.value);
  let correctAnswer = questionsData[selectedTrack][currentQuestionIndex].answer;

  if (selectedAnswer === correctAnswer) {
    correctCount++;
  }
  currentQuestionIndex++;

  if (currentQuestionIndex < questionsData[selectedTrack].length) {
    loadQuestion();
  } else {
    // Quiz finished, evaluate
    const percentCorrect = (correctCount / questionsData[selectedTrack].length) * 100;
    if (percentCorrect >= 50) {
      // Continue game
      alert(`Great! You scored ${percentCorrect}%. Continue playing.`);
      failModal.style.display = "none";
      continueGame();
    } else {
      // Restart game
      alert(`You scored ${percentCorrect}%. Game will restart.`);
      failModal.style.display = "none";
      restartGame();
    }
  }
});

// Give up button - quit to menu
quitBtn.addEventListener("click", () => {
  failModal.style.display = "none";
  resetToMenu();
});

// Continue game from fail spot (push bird a bit forward and reset crashed flag)
function continueGame() {
  gameState.crashed = false;
  gameState.birdVelocity = 0;

  // Find the first pipe that is ahead of the bird (x > bird x)
  let birdX = 50; // bird fixed horizontal position
  let nextPipe = gameState.pipes.find(pipe => pipe.x + gameState.pipeWidth > birdX);

  if (nextPipe) {
    // Calculate vertical center of gap
    let gapCenterY = nextPipe.topHeight + gameState.pipeGap / 2;

    // Position bird vertically in the middle of pipe gap
    gameState.birdY = gapCenterY - 15; // bird height approx 30, center it

    // Push the pipe right by 50 pixels so player has space to react
    nextPipe.x += 50;
  } else {
    // If no pipe ahead, just keep bird where it was but make sure birdY is within screen
    gameState.birdY = Math.min(Math.max(gameState.birdY, 20), 580);
  }

  gameState.isPlaying = true;
  gameLoop();
}

// Restart game from scratch
function restartGame() {
  gameState.isPlaying = false;
  gameCanvas.classList.add("hidden");
  categoryModal.style.display = "flex";
  instructionSection.classList.add("hidden");
}

// Reset everything and show category modal
function resetToMenu() {
  gameState.isPlaying = false;
  gameCanvas.classList.add("hidden");
  categoryModal.style.display = "flex";
  instructionSection.classList.add("hidden");
}

// Initial setup: show category modal, hide others
window.onload = () => {
  categoryModal.style.display = "flex";
  instructionSection.classList.add("hidden");
  gameCanvas.classList.add("hidden");
  failModal.style.display = "none";
};
