# BitXchain Mobile App

A React Native mobile application for the BitXchain cryptocurrency exchange platform, built with Expo.

## Features

- **User Authentication**: Sign up, sign in, password reset
- **Dashboard**: Real-time cryptocurrency price tracking
- **Wallet Management**: Buy, sell, and transfer Blurt tokens
- **Blog Integration**: Read latest posts from the Blurt blockchain
- **Profile Management**: User settings and account management

## Tech Stack

- **React Native** with Expo
- **React Navigation** for navigation
- **Supabase** for backend services
- **Linear Gradient** for UI styling
- **AsyncStorage** for local data persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Navigate to the mobile app directory:
```bash
cd bitxchain-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Update `src/lib/supabase.js` with your Supabase credentials

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## Project Structure

```
bitxchain-mobile/
├── src/
│   ├── components/          # Reusable components
│   │   ├── StatsScreen.js
│   │   ├── WalletScreen.js
│   │   ├── BlogScreen.js
│   │   └── ProfileScreen.js
│   ├── screens/             # Main screens
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ForgotPasswordScreen.js
│   │   └── ChangePasswordScreen.js
│   └── lib/
│       └── supabase.js      # Supabase configuration
├── App.js                   # Main app component
├── app.json                 # Expo configuration
└── package.json
```

## Key Features

### Authentication
- Email/password authentication via Supabase
- Password reset functionality
- Secure session management

### Dashboard
- Bottom tab navigation
- Real-time Blurt price tracking
- Countdown to testnet launch

### Wallet
- View Blurt and Naira balances
- Buy/sell Blurt tokens
- Transfer functionality
- Transaction history

### Blog
- Fetch posts from Blurt blockchain
- Display with images and metadata
- Open posts in external browser

### Profile
- User information display
- Settings management
- Logout functionality

## API Integration

The app integrates with:
- **Supabase**: User authentication and data storage
- **CoinGecko API**: Cryptocurrency price data
- **Blurt RPC**: Blockchain data and blog posts
- **Custom API**: Trading and transaction endpoints

## Styling

The app uses a dark theme with:
- Primary colors: Gold (#ffcc00), Cyan (#00f0ff)
- Background: Dark grays and blacks
- Linear gradients for buttons and headers
- Consistent spacing and typography

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both platforms
5. Submit a pull request

## License

This project is licensed under the MIT License.