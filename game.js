const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PADDLE_MARGIN = 18;
const PADDLE_SPEED = 5;
const AI_SPEED = 4;
const WIN_SCORE = 10;

// Paddle and Ball
let leftPaddle = {
    x: PADDLE_MARGIN,
    y: (canvas.height - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

let rightPaddle = {
    x: canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
    y: (canvas.height - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

let ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    dx: 5 * (Math.random() < 0.5 ? 1 : -1),
    dy: 3 * (Math.random() < 0.5 ? 1 : -1),
    size: BALL_SIZE
};

let scoreLeft = 0;
let scoreRight = 0;

// Mouse controls for left paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;
    // Clamp inside the canvas
    leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
});

// Reset positions after a point
function resetBall(direction = 1) {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.dx = 5 * direction;
    // Randomize angle
    ball.dy = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? 1 : -1);
}

function drawRect(x, y, w, h, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall() {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ball.x + ball.size/2, ball.y + ball.size/2, ball.size/2, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#0ff');
    drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#f00');
    drawBall();
}

function update() {
    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top/bottom)
    if (ball.y < 0) {
        ball.y = 0;
        ball.dy *= -1;
    }
    if (ball.y + ball.size > canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy *= -1;
    }

    // Paddle collision (left)
    if (
        ball.x < leftPaddle.x + leftPaddle.width &&
        ball.x + ball.size > leftPaddle.x &&
        ball.y < leftPaddle.y + leftPaddle.height &&
        ball.y + ball.size > leftPaddle.y
    ) {
        ball.x = leftPaddle.x + leftPaddle.width;
        ball.dx *= -1.1; // Speed up a bit
        // Add some "spin" based on impact
        let impact = (ball.y + ball.size/2) - (leftPaddle.y + leftPaddle.height/2);
        ball.dy += impact * 0.15;
    }

    // Paddle collision (right - AI)
    if (
        ball.x + ball.size > rightPaddle.x &&
        ball.x < rightPaddle.x + rightPaddle.width &&
        ball.y < rightPaddle.y + rightPaddle.height &&
        ball.y + ball.size > rightPaddle.y
    ) {
        ball.x = rightPaddle.x - ball.size;
        ball.dx *= -1.1;
        let impact = (ball.y + ball.size/2) - (rightPaddle.y + rightPaddle.height/2);
        ball.dy += impact * 0.15;
    }

    // Score check
    if (ball.x < 0) {
        scoreRight++;
        updateScore();
        resetBall(1);
    } else if (ball.x + ball.size > canvas.width) {
        scoreLeft++;
        updateScore();
        resetBall(-1);
    }

    // AI movement
    // Move the middle of the paddle towards the ball
    let target = ball.y + ball.size / 2 - rightPaddle.height / 2;
    if (rightPaddle.y < target) {
        rightPaddle.y += AI_SPEED;
    } else if (rightPaddle.y > target) {
        rightPaddle.y -= AI_SPEED;
    }
    // Clamp to canvas
    rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

function updateScore() {
    document.getElementById('score-left').textContent = scoreLeft;
    document.getElementById('score-right').textContent = scoreRight;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
resetBall();
updateScore();
gameLoop();
