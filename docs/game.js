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
    isReady: false,
    imagesLoaded: 0,
    totalImages: 0,
    tracks: [],
    opponents: [],
    powerups: [],
    currentTrack: null,
    currentOpponent: null,
    battleState: null,
    minigameState: null
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
    },
    powerups: {
        'nitro': new Image(),
        'repair': new Image(),
        'shield': new Image()
    }
};

// Count total images for loading
Object.values(assets).forEach(category => {
    gameState.totalImages += Object.keys(category).length;
});

// Asset loading handler
function handleAssetLoad() {
    gameState.imagesLoaded++;
    if (gameState.imagesLoaded === gameState.totalImages) {
        gameState.isReady = true;
        document.getElementById('menu').style.display = 'block';
    }
}

// Load all assets
Object.values(assets).forEach(category => {
    Object.entries(category).forEach(([key, asset]) => {
        asset.onload = handleAssetLoad;
        asset.onerror = () => {
            console.error(`Failed to load asset: ${key}`);
            // Use fallback SVG for failed images
            asset.src = `data:image/svg+xml;base64,${getFallbackSVG(key)}`;
        };
        asset.src = `./assets/${key}.png`;
    });
});

// Fallback SVG generator
function getFallbackSVG(type) {
    const svgs = {
        'lada-classic': 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDgwIDUwIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iNTAiIGZpbGw9IiM2NjY2NjYiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzQ0NDQ0NCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iNDUiIHI9IjUiIGZpbGw9IiMyMjIyMjIiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSI1IiBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+',
        'lada-niva': 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDgwIDYwIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iNjAiIGZpbGw9IiM2NjY2NjYiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzQ0NDQ0NCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iNTUiIHI9IjUiIGZpbGw9IiMyMjIyMjIiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjU1IiByPSI1IiBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+',
        'coin': 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDMwIDMwIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxNSIgZmlsbD0iI2ZmZGMwMCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjEyIiBmaWxsPSIjZmZmZjAwIi8+PC9zdmc+',
        'part': 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDMwIDMwIj48cmVjdCB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiM4ODg4ODgiLz48cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiM2NjY2NjYiLz48L3N2Zz4='
    };
    return svgs[type] || svgs['lada-classic'];
}

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
    updateUI();
}

function startBattle() {
    if (gameState.fuel < 20) {
        alert('Not enough fuel for battle!');
        return;
    }
    gameState.fuel -= 20;
    generateOpponent();
    updateUI();
}

function startMinigame() {
    gameState.minigameState = {
        type: 'repair',
        progress: 0,
        target: 100,
        parts: []
    };
    generateMinigameParts();
    updateUI();
}

function generateTrack() {
    gameState.tracks = [];
    const trackTypes = ['city', 'rally', 'circuit'];
    gameState.currentTrack = trackTypes[Math.floor(Math.random() * trackTypes.length)];
    
    // Generate track segments
    for (let i = 0; i < 5; i++) {
        gameState.tracks.push({
            type: gameState.currentTrack,
            x: canvas.width + (i * 800),
            obstacles: generateObstacles(),
            powerups: generatePowerups()
        });
    }
}

function generateObstacles() {
    const obstacles = [];
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
        obstacles.push({
            x: Math.random() * 700,
            y: canvas.height - 100,
            type: Math.random() < 0.5 ? 'cone' : 'barrier'
        });
    }
    return obstacles;
}

function generatePowerups() {
    const powerups = [];
    if (Math.random() < 0.3) {
        powerups.push({
            x: Math.random() * 700,
            y: canvas.height - 150,
            type: ['nitro', 'repair', 'shield'][Math.floor(Math.random() * 3)]
        });
    }
    return powerups;
}

function generateOpponent() {
    const models = Object.keys(assets.cars);
    const model = models[Math.floor(Math.random() * models.length)];
    gameState.currentOpponent = {
        model,
        position: { x: canvas.width - 100, y: canvas.height - 100 },
        stats: {
            speed: Math.random() * 3 + 4,
            handling: Math.random() * 3 + 4,
            durability: Math.random() * 3 + 4
        }
    };
}

function generateMinigameParts() {
    gameState.minigameState.parts = [];
    for (let i = 0; i < 5; i++) {
        gameState.minigameState.parts.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            type: ['engine', 'wheel', 'body', 'electronics'][Math.floor(Math.random() * 4)]
        });
    }
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

    // Update UI
    updateUI();
}

function updateRacePhysics() {
    // Apply velocity
    gameState.car.position.x += gameState.car.velocity.x;
    gameState.car.position.y += gameState.car.velocity.y;

    // Keep car within bounds
    gameState.car.position.x = Math.max(0, Math.min(canvas.width - 80, gameState.car.position.x));
    gameState.car.position.y = Math.max(0, Math.min(canvas.height - 50, gameState.car.position.y));

    // Update track segments
    gameState.tracks = gameState.tracks.filter(track => {
        track.x -= gameState.car.stats.speed;
        return track.x > -800;
    });

    // Generate new track segments
    if (gameState.tracks.length < 5) {
        const lastTrack = gameState.tracks[gameState.tracks.length - 1];
        gameState.tracks.push({
            type: gameState.currentTrack,
            x: lastTrack.x + 800,
            obstacles: generateObstacles(),
            powerups: generatePowerups()
        });
    }
}

function updateBattleState() {
    if (!gameState.currentOpponent) return;

    // Update opponent position
    gameState.currentOpponent.position.x -= gameState.currentOpponent.stats.speed;
    
    // Check for battle end
    if (gameState.currentOpponent.position.x < -100) {
        gameOver('Battle Won!');
    }
}

function updateMinigameState() {
    if (!gameState.minigameState) return;

    // Update minigame progress
    gameState.minigameState.progress = Math.min(
        gameState.minigameState.target,
        gameState.minigameState.progress + 0.1
    );

    // Check for minigame completion
    if (gameState.minigameState.progress >= gameState.minigameState.target) {
        gameOver('Minigame Complete!');
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

function drawTrack() {
    // Draw track segments
    gameState.tracks.forEach(track => {
        ctx.drawImage(assets.tracks[track.type], track.x, 0, 800, canvas.height);
        
        // Draw obstacles
        track.obstacles.forEach(obstacle => {
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(
                track.x + obstacle.x,
                obstacle.y,
                40,
                40
            );
        });

        // Draw powerups
        track.powerups.forEach(powerup => {
            ctx.drawImage(
                assets.powerups[powerup.type],
                track.x + powerup.x,
                powerup.y,
                30,
                30
            );
        });
    });
}

function drawArena() {
    // Draw arena background
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw opponent
    if (gameState.currentOpponent) {
        ctx.drawImage(
            assets.cars[gameState.currentOpponent.model],
            gameState.currentOpponent.position.x,
            gameState.currentOpponent.position.y,
            80,
            50
        );
    }
}

function drawMinigame() {
    // Draw minigame background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw parts
    if (gameState.minigameState) {
        gameState.minigameState.parts.forEach(part => {
            ctx.fillStyle = '#666';
            ctx.fillRect(part.x, part.y, 40, 40);
        });
    }
}

function drawCar() {
    ctx.drawImage(
        assets.cars[gameState.car.model],
        gameState.car.position.x,
        gameState.car.position.y,
        80,
        50
    );
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

function updateUI() {
    document.getElementById('fuel').textContent = `${Math.round(gameState.fuel)}%`;
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('parts').textContent = gameState.parts;
    document.getElementById('speed').textContent = gameState.car.stats.speed;
    document.getElementById('handling').textContent = gameState.car.stats.handling;
    document.getElementById('durability').textContent = gameState.car.stats.durability;
    document.getElementById('special').textContent = gameState.car.stats.special;
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
            <p>Speed: <span id="speed">${gameState.car.stats.speed}</span></p>
            <p>Handling: <span id="handling">${gameState.car.stats.handling}</span></p>
            <p>Durability: <span id="durability">${gameState.car.stats.durability}</span></p>
            <p>Special: <span id="special">${gameState.car.stats.special}</span></p>
        </div>
        <button class="button" onclick="startGame('race')">Start Race</button>
        <button class="button secondary" onclick="startGame('battle')">Start Battle</button>
        <button class="button accent" onclick="startGame('minigame')">Play Minigame</button>
        <button class="button" onclick="showUpgrades()">Upgrade Car</button>
    `;
}

function showUpgrades() {
    document.getElementById('menu').innerHTML = `
        <h1>Car Upgrades</h1>
        <div class="car-stats">
            <p>Speed: <span id="speed">${gameState.car.stats.speed}</span></p>
            <p>Handling: <span id="handling">${gameState.car.stats.handling}</span></p>
            <p>Durability: <span id="durability">${gameState.car.stats.durability}</span></p>
            <p>Special: <span id="special">${gameState.car.stats.special}</span></p>
        </div>
        <button class="button" onclick="upgradeStat('speed')">Upgrade Speed (${gameState.coins >= 100 ? '100 coins' : 'Not enough coins'})</button>
        <button class="button" onclick="upgradeStat('handling')">Upgrade Handling (${gameState.coins >= 100 ? '100 coins' : 'Not enough coins'})</button>
        <button class="button" onclick="upgradeStat('durability')">Upgrade Durability (${gameState.coins >= 100 ? '100 coins' : 'Not enough coins'})</button>
        <button class="button" onclick="upgradeStat('special')">Upgrade Special (${gameState.coins >= 200 ? '200 coins' : 'Not enough coins'})</button>
        <button class="button" onclick="showGarage()">Back to Garage</button>
    `;
}

function upgradeStat(stat) {
    const costs = {
        speed: 100,
        handling: 100,
        durability: 100,
        special: 200
    };

    if (gameState.coins >= costs[stat]) {
        gameState.coins -= costs[stat];
        gameState.car.stats[stat]++;
        showUpgrades();
    }
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

// Touch controls
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const specialBtn = document.getElementById('special-button');

leftBtn.addEventListener('touchstart', () => {
    gameState.car.velocity.x = -gameState.car.stats.speed;
});

rightBtn.addEventListener('touchstart', () => {
    gameState.car.velocity.x = gameState.car.stats.speed;
});

upBtn.addEventListener('touchstart', () => {
    gameState.car.velocity.y = -gameState.car.stats.speed;
});

downBtn.addEventListener('touchstart', () => {
    gameState.car.velocity.y = gameState.car.stats.speed;
});

specialBtn.addEventListener('touchstart', () => {
    if (gameState.car.stats.special > 0) {
        activateSpecial();
    }
});

[leftBtn, rightBtn, upBtn, downBtn].forEach(btn => {
    btn.addEventListener('touchend', () => {
        if (btn === leftBtn || btn === rightBtn) {
            gameState.car.velocity.x = 0;
        } else {
            gameState.car.velocity.y = 0;
        }
    });
});

function activateSpecial() {
    gameState.car.stats.special--;
    switch(gameState.currentMode) {
        case 'race':
            gameState.car.stats.speed *= 2;
            setTimeout(() => {
                gameState.car.stats.speed /= 2;
            }, 5000);
            break;
        case 'battle':
            if (gameState.currentOpponent) {
                gameState.currentOpponent.stats.durability -= 2;
            }
            break;
        case 'minigame':
            gameState.minigameState.progress += 20;
            break;
    }
}

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