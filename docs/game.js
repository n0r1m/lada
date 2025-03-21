// Game state
let gameState = {
    isPlaying: false,
    score: 0,
    fuel: 100,
    maxFuel: 100,
    car: {
        model: 'lada-classic',
        stats: {
            speed: 5,
            handling: 5,
            durability: 5,
            special: 0
        },
        upgrades: [],
        position: { x: 100, y: 0 },
        velocity: { x: 0, y: 0 }
    },
    currentMode: 'garage', // garage, race, battle, minigame
    lastFuelUpdate: Date.now(),
    fuelRegenRate: 1, // fuel points per minute
    coins: 0,
    parts: 0,
    achievements: new Set(),
    isReady: false
};

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Load game assets
const assets = {
    cars: {
        'lada-classic': new Image(),
        'lada-niva': new Image(),
        'lada-kalina': new Image(),
        'lada-priora': new Image(),
        'lada-electron': new Image() // Easter egg car
    },
    tracks: {
        'city': new Image(),
        'rally': new Image(),
        'circuit': new Image()
    },
    ui: {
        'fuel-gauge': new Image(),
        'speedometer': new Image(),
        'coin': new Image(),
        'part': new Image()
    }
};

// Asset loading handler
function handleAssetLoad() {
    gameState.imagesLoaded++;
    if (gameState.imagesLoaded === Object.keys(assets).length) {
        gameState.isReady = true;
        document.getElementById('menu').style.display = 'block';
    }
}

// Load all assets
Object.values(assets).forEach(category => {
    Object.values(category).forEach(asset => {
        asset.onload = handleAssetLoad;
    });
});

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game functions
function startGame(mode) {
    if (!gameState.isReady) {
        alert('Please wait for all assets to load');
        return;
    }
    
    gameState.currentMode = mode;
    gameState.isPlaying = true;
    
    switch(mode) {
        case 'race':
            startRace();
            break;
        case 'battle':
            startBattle();
            break;
        case 'minigame':
            startMinigame();
            break;
    }
    
    document.getElementById('menu').style.display = 'none';
    gameLoop();
}

function startRace() {
    gameState.score = 0;
    gameState.car.position = { x: 100, y: canvas.height - 100 };
    gameState.car.velocity = { x: 0, y: 0 };
    generateTrack();
}

function startBattle() {
    if (gameState.fuel < 20) {
        alert('Not enough fuel for battle!');
        return;
    }
    gameState.fuel -= 20;
    generateOpponent();
}

function startMinigame() {
    // Initialize minigame state
    gameState.minigameState = {
        type: 'repair',
        progress: 0,
        target: 100
    };
}

function gameLoop() {
    if (!gameState.isPlaying) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game state
    updateGameState();

    // Draw game elements
    drawGame();

    // Check for game over conditions
    checkGameOver();

    requestAnimationFrame(gameLoop);
}

function updateGameState() {
    // Update fuel
    const now = Date.now();
    const timeDiff = (now - gameState.lastFuelUpdate) / 60000; // Convert to minutes
    gameState.fuel = Math.min(
        gameState.maxFuel,
        gameState.fuel + (gameState.fuelRegenRate * timeDiff)
    );
    gameState.lastFuelUpdate = now;

    // Update car position based on current mode
    switch(gameState.currentMode) {
        case 'race':
            updateRacePhysics();
            break;
        case 'battle':
            updateBattleState();
            break;
        case 'minigame':
            updateMinigameState();
            break;
    }
}

function drawGame() {
    // Draw background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw track/arena based on mode
    switch(gameState.currentMode) {
        case 'race':
            drawTrack();
            break;
        case 'battle':
            drawArena();
            break;
        case 'minigame':
            drawMinigame();
            break;
    }

    // Draw car
    drawCar();

    // Draw UI elements
    drawUI();
}

function drawUI() {
    // Draw fuel gauge
    ctx.fillStyle = '#fff';
    ctx.fillRect(10, 10, 200, 20);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(10, 10, (gameState.fuel / gameState.maxFuel) * 200, 20);

    // Draw score/coins
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 10, 40);
    ctx.fillText(`Coins: ${gameState.coins}`, 10, 60);
    ctx.fillText(`Parts: ${gameState.parts}`, 10, 80);
}

function checkGameOver() {
    switch(gameState.currentMode) {
        case 'race':
            if (gameState.car.position.x < 0) {
                gameOver('Race Over!');
            }
            break;
        case 'battle':
            if (gameState.car.stats.durability <= 0) {
                gameOver('Battle Lost!');
            }
            break;
        case 'minigame':
            if (gameState.minigameState.progress >= gameState.minigameState.target) {
                gameOver('Minigame Complete!');
            }
            break;
    }
}

function gameOver(message) {
    gameState.isPlaying = false;
    document.getElementById('menu').style.display = 'block';
    document.getElementById('menu').innerHTML = `
        <h1>${message}</h1>
        <p>Score: ${gameState.score}</p>
        <p>Coins Earned: ${gameState.coins}</p>
        <button class="button" onclick="startGame('${gameState.currentMode}')">Play Again</button>
        <button class="button" onclick="showGarage()">Go to Garage</button>
    `;
}

function showGarage() {
    gameState.currentMode = 'garage';
    document.getElementById('menu').style.display = 'block';
    document.getElementById('menu').innerHTML = `
        <h1>Lada Garage</h1>
        <div class="car-stats">
            <p>Speed: ${gameState.car.stats.speed}</p>
            <p>Handling: ${gameState.car.stats.handling}</p>
            <p>Durability: ${gameState.car.stats.durability}</p>
            <p>Special: ${gameState.car.stats.special}</p>
        </div>
        <button class="button" onclick="startGame('race')">Start Race</button>
        <button class="button" onclick="startGame('battle')">Start Battle</button>
        <button class="button" onclick="startGame('minigame')">Play Minigame</button>
        <button class="button" onclick="showUpgrades()">Upgrade Car</button>
    `;
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying) return;
    
    switch(e.code) {
        case 'ArrowLeft':
            gameState.car.velocity.x = -gameState.car.stats.speed;
            break;
        case 'ArrowRight':
            gameState.car.velocity.x = gameState.car.stats.speed;
            break;
        case 'ArrowUp':
            gameState.car.velocity.y = -gameState.car.stats.speed;
            break;
        case 'ArrowDown':
            gameState.car.velocity.y = gameState.car.stats.speed;
            break;
        case 'Space':
            if (gameState.car.stats.special > 0) {
                activateSpecial();
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
            gameState.car.velocity.x = 0;
            break;
        case 'ArrowUp':
        case 'ArrowDown':
            gameState.car.velocity.y = 0;
            break;
    }
});

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