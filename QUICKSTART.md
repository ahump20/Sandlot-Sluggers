# Quick Start Guide

Get up and running with Sandlot Sluggers in just a few minutes!

## 🚀 Installation (5 minutes)

### Prerequisites
Make sure you have these installed:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Install Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahump20/Sandlot-Sluggers.git
   cd Sandlot-Sluggers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

That's it! The Expo development server will start and show you options for running the app.

## 📱 Running the App

### On Your Phone (Easiest!)

1. **Install Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan the QR code** shown in your terminal after running `npm start`

3. **Play!** The app will load on your phone

### On iOS Simulator (Mac Only)

```bash
npm run ios
```

You'll need Xcode installed on your Mac.

### On Android Emulator

```bash
npm run android
```

You'll need Android Studio with an emulator set up.

### On Web Browser (For Testing)

```bash
npm run web
```

Opens in your default browser. Note: Optimized for mobile, so use browser dev tools to simulate mobile view.

## 🎮 How to Play

### Step 1: Choose Your Character
- Browse through 8 unique players
- Tap a character to see their stats
- Each character has different strengths (Power, Speed, Fielding, Pitching)
- Tap "Let's Play!" when you've made your choice

### Step 2: Pick Your Stadium
- Choose from 6 colorful stadiums
- Each has different difficulty and special features
- Easier stadiums are great for beginners!
- Tap "Play Here!" to start

### Step 3: Play Ball!
- **Pitching**: Tap "🎯 Pitch!" to throw the ball
- **Batting**: Watch the ball move across the screen
- **Swing**: Tap "⚡ SWING!" at the right moment
  - Too early or too late = Out
  - Good timing = Single, Double, Triple
  - Perfect timing = Home Run! 🎉
- **Score**: Get more runs than the AI in 9 innings to win!

### Tips for Success
- 🎯 **Timing is Everything**: Wait for the ball to get close before swinging
- 💪 **Use Power Hitters**: High power stat = better chance of home runs
- ⚡ **Speed Matters**: Fast characters can steal bases more easily
- 🏟️ **Match Stadium to Skill**: Start with Easy stadiums to learn the game

## 📊 Tracking Your Progress

- Tap "📊 View Stats" from the main menu
- See your win/loss record
- Check your high scores
- Track career statistics

## 🎨 Game Tips

### Character Selection Guide
- **Slugger Sam** (Power 9) - Best for home runs
- **Speedy Stella** (Speed 10) - Great base running
- **Ace Andy** (Pitching 10) - Best pitcher
- **Golden Glove Gina** (Fielding 10) - Best defense
- **Choose based on your play style!**

### Stadium Difficulty
- **Easy**: Sunny Shores, Rainbow Ranch
- **Medium**: Mountain Peak, Downtown Diamond
- **Hard**: Forest Field, Desert Dugout

## ⚠️ Troubleshooting

### App won't start?
```bash
# Clear cache and restart
npm start --clear
```

### Dependencies issue?
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Port already in use?
The app uses port 8081 by default. Make sure no other Metro bundler is running.

### Need more help?
Open an issue on GitHub with:
- What you tried to do
- What happened instead
- Your device/platform info

## 🎉 You're Ready!

That's everything you need to start playing Sandlot Sluggers! 

Have fun and play ball! ⚾

---

**Need more details?** Check out:
- [README.md](README.md) - Full game documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Technical details
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
