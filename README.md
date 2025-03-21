# LADA Mini App

A Telegram Mini App featuring a LADA car game and referral system.

## Features

- Navigation bar with channel link and feature buttons
- Referral system with progress tracking
- Clickable LADA car model for coin collection
- Dinosaur mini-game with personal best tracking
- Mobile-friendly design

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lada-mini-app.git
cd lada-mini-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

## Deployment

This app is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

1. Push your changes to the main branch:
```bash
git add .
git commit -m "Update app"
git push origin main
```

2. The GitHub Actions workflow will automatically:
   - Build the app
   - Deploy it to GitHub Pages
   - Provide a URL where the app is accessible

### GitHub Pages Setup

1. Go to your repository settings
2. Navigate to "Pages" section
3. Under "Source", select "GitHub Actions"
4. The app will be deployed automatically when changes are pushed to main

## Telegram Mini App Setup

1. Create a new bot using [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Set up the Mini App:
   - Use the GitHub Pages URL as your Mini App URL
   - Configure the bot settings in BotFather

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 