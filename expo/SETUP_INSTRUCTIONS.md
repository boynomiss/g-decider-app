# G-Decider App Setup Instructions

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
The app requires a backend server running on port 3000 for tRPC API calls.

```bash
npm run start-backend
```

This will start the Hono server with tRPC endpoints at `http://localhost:3000/api/trpc`

### 3. Start the Expo App
In a new terminal:

```bash
npm start
```

Or use the combined command to start both backend and frontend:
```bash
npm run dev
```

## Development

### Backend Server
- **Port**: 3000
- **Framework**: Hono with tRPC
- **Health Check**: `http://localhost:3000/`
- **tRPC Endpoint**: `http://localhost:3000/api/trpc`

### Frontend
- **Framework**: React Native with Expo
- **Router**: Expo Router
- **State Management**: Zustand
- **API Client**: tRPC

## Troubleshooting

### "No base url found" Error
This error occurs when the backend server isn't running. Make sure to:
1. Start the backend server first: `npm run start-backend`
2. Verify it's running on port 3000: `curl http://localhost:3000/`

### Missing Default Export Error
This was caused by problematic component validation logic and has been fixed in `_layout.tsx`.

## Environment Variables
The app will automatically use `http://localhost:3000` for development. For production, set:
- `EXPO_PUBLIC_RORK_API_BASE_URL`: Your production API URL
