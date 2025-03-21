const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Serve static files from the docs directory
app.use(express.static('docs'));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle user authentication
    socket.on('authenticate', async (data) => {
        try {
            const { telegramId, username } = data;
            const result = await pool.query(
                'INSERT INTO users (telegram_id, username) VALUES ($1, $2) ON CONFLICT (telegram_id) DO UPDATE SET username = $2 RETURNING *',
                [telegramId, username]
            );
            socket.user = result.rows[0];
            socket.emit('authenticated', { success: true, user: result.rows[0] });
        } catch (error) {
            console.error('Authentication error:', error);
            socket.emit('authenticated', { success: false, error: 'Authentication failed' });
        }
    });

    // Handle game state updates
    socket.on('updateGameState', async (data) => {
        try {
            const { userId, gameState } = data;
            await pool.query(
                'UPDATE user_progress SET game_state = $1 WHERE user_id = $2',
                [gameState, userId]
            );
            socket.emit('gameStateUpdated', { success: true });
        } catch (error) {
            console.error('Game state update error:', error);
            socket.emit('gameStateUpdated', { success: false, error: 'Update failed' });
        }
    });

    // Handle PvP battle requests
    socket.on('requestBattle', (data) => {
        const { userId, opponentId } = data;
        io.to(opponentId).emit('battleRequest', { from: userId });
    });

    // Handle battle responses
    socket.on('battleResponse', (data) => {
        const { userId, opponentId, accepted } = data;
        io.to(opponentId).emit('battleResponse', { from: userId, accepted });
    });

    // Handle battle updates
    socket.on('battleUpdate', (data) => {
        const { battleId, update } = data;
        io.to(battleId).emit('battleUpdate', update);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// API endpoints
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT username, score FROM users ORDER BY score DESC LIMIT 10'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

app.get('/api/user/:telegramId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [req.params.telegramId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Initialize database tables
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                telegram_id BIGINT UNIQUE NOT NULL,
                username TEXT,
                score INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_progress (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                game_state JSONB,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS battles (
                id SERIAL PRIMARY KEY,
                player1_id INTEGER REFERENCES users(id),
                player2_id INTEGER REFERENCES users(id),
                winner_id INTEGER REFERENCES users(id),
                battle_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Start server
const PORT = process.env.PORT || 3000;
initializeDatabase().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}); 