# Lada Combat - Telegram Mini App

A fun and engaging Telegram Mini App featuring Lada cars in exciting battles and races. Experience the thrill of driving various Lada models, from classics to modern versions, in this action-packed game.

## Features

### Game Modes
- **Racing Mode**: Compete in exciting races across different tracks
- **Battle Mode**: Engage in PvP battles with other players
- **Minigames**: 
  - Repair Garage: Fix and upgrade your Lada
  - Parts Collection: Gather spare parts for upgrades
  - Delivery Missions: Complete delivery tasks for rewards

### Car Features
- Multiple Lada models:
  - Classic Lada
  - Lada Niva
  - Lada Kalina
  - Lada Priora
  - Secret Lada Electron (Easter egg!)
- Upgradeable stats:
  - Speed
  - Handling
  - Durability
  - Special abilities

### Social Features
- Referral system with unique rewards
- Global leaderboard
- PvP battles
- Achievement system
- Daily challenges

## Technical Stack

- Frontend:
  - HTML5 Canvas
  - JavaScript
  - Phaser.js for game engine
  - React for UI components

- Backend:
  - Node.js
  - Express
  - Socket.IO for real-time features
  - PostgreSQL for data storage

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/your-username/lada-combat.git
cd lada-combat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=your_postgresql_connection_string
PORT=3000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Deployment

1. Create a new repository on GitHub
2. Push your code to the repository
3. Set up a PostgreSQL database
4. Configure environment variables on your hosting platform
5. Deploy the application

## Telegram Bot Setup

1. Create a new bot through @BotFather
2. Get your bot token
3. Configure the bot's menu with the following commands:
   - /start - Start the game
   - /help - Show help information
   - /leaderboard - View global leaderboard
   - /profile - View your profile
   - /referral - Get your referral link

4. Set the webhook URL to your deployed application:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_APP_URL>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Lada car models and assets
- Telegram Mini App platform
- Open source game engines and libraries 