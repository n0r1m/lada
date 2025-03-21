// Game state
let gameState = {
    isPlaying: false,
    score: 0,
    coinCount: 0,
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
    theme: 'light',
    lastObstacleTime: 0,
    obstacleInterval: 2000,
    collectedCoins: new Set() // Track collected coins to prevent double counting
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
    gameState.coinCount = 0;
    gameState.obstacles = [];
    gameState.coins = [];
    gameState.gameSpeed = 5;
    gameState.lastObstacleTime = 0;
    gameState.collectedCoins.clear(); // Clear collected coins set
    document.getElementById('menu').style.display = 'none';
    document.getElementById('coins').textContent = `Coins: ${gameState.coinCount}`;
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

    // Generate obstacles with timing
    const currentTime = Date.now();
    if (currentTime - gameState.lastObstacleTime > gameState.obstacleInterval) {
        gameState.obstacles.push({
            x: canvas.width,
            y: gameState.groundY - 40,
            width: 40,
            height: 40
        });
        gameState.lastObstacleTime = currentTime;
    }

    // Generate coins with reduced frequency
    if (Math.random() < 0.005) {
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

    // Increase game speed more gradually
    if (gameState.score % 1000 === 0) {
        gameState.gameSpeed += 0.3;
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
    // Check obstacle collisions with more precise hitbox
    for (let obstacle of gameState.obstacles) {
        // Create a smaller hitbox for the car
        const carHitbox = {
            x: gameState.carX + 20, // Offset from left
            y: gameState.carY - 30, // Offset from bottom
            width: 40, // Smaller width
            height: 30 // Smaller height
        };

        // Create a smaller hitbox for the obstacle
        const obstacleHitbox = {
            x: obstacle.x + 5,
            y: obstacle.y + 5,
            width: obstacle.width - 10,
            height: obstacle.height - 10
        };

        if (carHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
            carHitbox.x + carHitbox.width > obstacleHitbox.x &&
            carHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
            carHitbox.y + carHitbox.height > obstacleHitbox.y) {
            gameOver();
        }
    }

    // Check coin collisions with more precise hitbox
    for (let coin of gameState.coins) {
        // Create a smaller hitbox for the car
        const carHitbox = {
            x: gameState.carX + 20,
            y: gameState.carY - 30,
            width: 40,
            height: 30
        };

        // Create a smaller hitbox for the coin
        const coinHitbox = {
            x: coin.x + 5,
            y: coin.y + 5,
            width: coin.width - 10,
            height: coin.height - 10
        };

        // Check if coin hasn't been collected yet
        if (!gameState.collectedCoins.has(coin) &&
            carHitbox.x < coinHitbox.x + coinHitbox.width &&
            carHitbox.x + carHitbox.width > coinHitbox.x &&
            carHitbox.y < coinHitbox.y + coinHitbox.height &&
            carHitbox.y + carHitbox.height > coinHitbox.y) {
            
            gameState.coinCount++;
            gameState.collectedCoins.add(coin);
            document.getElementById('coins').textContent = `Coins: ${gameState.coinCount}`;
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

// Improved touch controls
const jumpButton = document.getElementById('jump-button');
jumpButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

// Initialize Telegram Web App
let tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
    
    // Set initial theme based on Telegram theme
    if (tg.colorScheme === 'dark') {
        gameState.theme = 'dark';
        document.body.setAttribute('data-theme', 'dark');
    }
} 