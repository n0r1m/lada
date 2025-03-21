// Game state
let gameState = {
    isPlaying: false,
    score: 0,
    coins: 0,
    highScore: 0,
    isJumping: false,
    jumpVelocity: 0,
    gravity: 0.8,
    jumpForce: -15,
    groundY: 0,
    carX: 100,
    carY: 0,
    obstacles: [],
    coins: [],
    gameSpeed: 5,
    theme: 'light'
};

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Load images
const carImage = new Image();
carImage.src = './assets/lada.png';

const coneImage = new Image();
coneImage.src = './assets/cone.png';

const coinImage = new Image();
coinImage.src = './assets/coin.png';

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.groundY = canvas.height - 100;
    gameState.carY = gameState.groundY;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game functions
function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.coins = 0;
    gameState.obstacles = [];
    gameState.coins = [];
    gameState.gameSpeed = 5;
    document.getElementById('menu').style.display = 'none';
    gameLoop();
}

function gameLoop() {
    if (!gameState.isPlaying) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, gameState.groundY, canvas.width, canvas.height - gameState.groundY);

    // Update car position
    if (gameState.isJumping) {
        gameState.carY += gameState.jumpVelocity;
        gameState.jumpVelocity += gameState.gravity;

        if (gameState.carY >= gameState.groundY) {
            gameState.carY = gameState.groundY;
            gameState.isJumping = false;
        }
    }

    // Draw car
    ctx.drawImage(carImage, gameState.carX, gameState.carY - 50, 80, 50);

    // Generate obstacles
    if (Math.random() < 0.02) {
        gameState.obstacles.push({
            x: canvas.width,
            y: gameState.groundY - 40,
            width: 40,
            height: 40
        });
    }

    // Generate coins
    if (Math.random() < 0.01) {
        gameState.coins.push({
            x: canvas.width,
            y: gameState.groundY - 100,
            width: 30,
            height: 30
        });
    }

    // Update and draw obstacles
    gameState.obstacles = gameState.obstacles.filter(obstacle => {
        obstacle.x -= gameState.gameSpeed;
        ctx.drawImage(coneImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        return obstacle.x > -obstacle.width;
    });

    // Update and draw coins
    gameState.coins = gameState.coins.filter(coin => {
        coin.x -= gameState.gameSpeed;
        ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
        return coin.x > -coin.width;
    });

    // Check collisions
    checkCollisions();

    // Update score
    gameState.score++;
    document.getElementById('score').textContent = `Score: ${Math.floor(gameState.score / 10)}`;

    // Increase game speed
    if (gameState.score % 500 === 0) {
        gameState.gameSpeed += 0.5;
    }

    requestAnimationFrame(gameLoop);
}

function jump() {
    if (!gameState.isJumping) {
        gameState.isJumping = true;
        gameState.jumpVelocity = gameState.jumpForce;
    }
}

function checkCollisions() {
    // Check obstacle collisions
    for (let obstacle of gameState.obstacles) {
        if (gameState.carX < obstacle.x + obstacle.width &&
            gameState.carX + 80 > obstacle.x &&
            gameState.carY < obstacle.y + obstacle.height &&
            gameState.carY + 50 > obstacle.y) {
            gameOver();
        }
    }

    // Check coin collisions
    for (let coin of gameState.coins) {
        if (gameState.carX < coin.x + coin.width &&
            gameState.carX + 80 > coin.x &&
            gameState.carY < coin.y + coin.height &&
            gameState.carY + 50 > coin.y) {
            gameState.coins++;
            document.getElementById('coins').textContent = `Coins: ${gameState.coins}`;
        }
    }
}

function gameOver() {
    gameState.isPlaying = false;
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
    }
    document.getElementById('menu').style.display = 'block';
    document.getElementById('menu').innerHTML = `
        <h1>Game Over!</h1>
        <p>Score: ${Math.floor(gameState.score / 10)}</p>
        <p>High Score: ${Math.floor(gameState.highScore / 10)}</p>
        <button class="button" onclick="startGame()">Play Again</button>
        <button class="button" onclick="showReferral()">Referral</button>
    `;
}

function toggleTheme() {
    gameState.theme = gameState.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', gameState.theme);
}

function showReferral() {
    const tg = window.Telegram.WebApp;
    if (tg) {
        const referralLink = `https://t.me/share/url?url=https://t.me/${tg.initDataUnsafe.user.username}`;
        window.open(referralLink, '_blank');
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
});

document.addEventListener('touchstart', () => {
    jump();
});

// Initialize Telegram Web App
let tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
} 