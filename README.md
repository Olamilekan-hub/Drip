

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/stebin1998/drip-v1.git
cd drip-v1
```

2. Install dependencies
```bash
cd frontend
npm install
```

3. Set up Firebase configuration
   - Copy `frontend/src/firebase/config.example.js` to `frontend/src/firebase/config.js`
   - Replace the Firebase configuration values with your own from the Firebase Console
   - Get your Firebase credentials from: https://console.firebase.google.com

4. Start the development server
```bash
npm start
```

The application will be available at http://localhost:3000

## Firebase Setup
1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password and Google Sign-in
3. Create a Firestore database
4. Copy your Firebase configuration from Project Settings
5. Replace the values in `config.js` with your Firebase credentials

## Available Scripts
- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production 
