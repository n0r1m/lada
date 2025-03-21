# LADA Jump Game - Telegram Mini App

A fun mini game for Telegram where you control a LADA car jumping through obstacles and collecting coins.

## Features

- Jump through obstacles (road cones)
- Collect coins
- Score tracking
- High score system
- Dark/Light theme switching
- Referral system
- Mobile-friendly controls

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (optional):
```
PORT=3000
```

3. Start the development server:
```bash
npm run dev
```

## Deployment

1. Deploy to a hosting service (e.g., Heroku, DigitalOcean, Vercel)
2. Set up your Telegram Bot through [@BotFather](https://t.me/botfather)
3. Configure your bot's menu to include the mini app
4. Update the bot's webhook URL to point to your deployed game

## Development

- The game is built using HTML5 Canvas and JavaScript
- Uses Telegram Web App SDK for integration
- Express.js for serving the game files

## Assets

You'll need to add the following images to the `assets` folder:
- `lada.png` - LADA car sprite
- `cone.png` - Road cone obstacle
- `coin.png` - Coin collectible

## Contributing

Feel free to submit issues and enhancement requests! 