// Game state
let gameState = {
    isRunning: false,
    score: 0,
    isJumping: false,
    jumpVelocity: 0,
    gravity: 0.8,
    jumpForce: -15,
    groundY: 0,
    obstacles: [],
    lastObstacleTime: 0,
    obstacleInterval: 2000,
    gameSpeed: 5
};

// Game objects
const dino = {
    x: 50,
    y: 0,
    width: 40,
    height: 60,
    color: '#333'
};

const obstacle = {
    width: 20,
    height: 40,
    color: '#666'
};

// Initialize game
function initGame() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set ground position
    gameState.groundY = canvas.height - 100;
    dino.y = gameState.groundY - dino.height;
    
    // Reset game state
    gameState.score = 0;
    gameState.obstacles = [];
    gameState.lastObstacleTime = Date.now();
    gameState.isRunning = true;
    
    // Start game loop
    gameLoop();
}

// Game loop
function gameLoop() {
    if (!gameState.isRunning) return;
    
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game state
    updateGame();
    
    // Draw game objects
    drawGame(ctx);
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Update game state
function updateGame() {
    // Update dino position
    if (gameState.isJumping) {
        dino.y += gameState.jumpVelocity;
        gameState.jumpVelocity += gameState.gravity;
        
        // Check if landed
        if (dino.y >= gameState.groundY - dino.height) {
            dino.y = gameState.groundY - dino.height;
            gameState.isJumping = false;
            gameState.jumpVelocity = 0;
        }
    }
    
    // Generate obstacles
    const currentTime = Date.now();
    if (currentTime - gameState.lastObstacleTime > gameState.obstacleInterval) {
        gameState.obstacles.push({
            x: canvas.width,
            y: gameState.groundY - obstacle.height,
            width: obstacle.width,
            height: obstacle.height
        });
        gameState.lastObstacleTime = currentTime;
    }
    
    // Update obstacles
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obs = gameState.obstacles[i];
        obs.x -= gameState.gameSpeed;
        
        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
            gameState.obstacles.splice(i, 1);
            gameState.score++;
            updatePersonalBest();
        }
        
        // Check collision
        if (checkCollision(dino, obs)) {
            gameOver();
        }
    }
    
    // Increase game speed
    gameState.gameSpeed += 0.001;
}

// Draw game objects
function drawGame(ctx) {
    // Draw ground
    ctx.fillStyle = '#999';
    ctx.fillRect(0, gameState.groundY, canvas.width, canvas.height - gameState.groundY);
    
    // Draw dino
    ctx.fillStyle = dino.color;
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    
    // Draw obstacles
    ctx.fillStyle = obstacle.color;
    gameState.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
    
    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 10, 30);
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Handle jump
function jump() {
    if (!gameState.isJumping) {
        gameState.isJumping = true;
        gameState.jumpVelocity = gameState.jumpForce;
    }
}

// Game over
function gameOver() {
    gameState.isRunning = false;
    updatePersonalBest();
    showToast('Game Over! Score: ' + gameState.score);
}

// Update personal best score
function updatePersonalBest() {
    const currentBest = parseInt(localStorage.getItem('personalBest') || '0');
    if (gameState.score > currentBest) {
        localStorage.setItem('personalBest', gameState.score);
        document.getElementById('personal-best').textContent = gameState.score;
    }
}

// Event listeners
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (!gameState.isRunning) {
            initGame();
        } else {
            jump();
        }
    }
});

// Touch events for mobile
document.addEventListener('touchstart', (event) => {
    event.preventDefault();
    if (!gameState.isRunning) {
        initGame();
    } else {
        jump();
    }
});

// Initialize game when start button is clicked
function startGame() {
    initGame();
} 