# Cesium Flight Tracker Demo

A real-time flight tracking application built with React, TypeScript, and Cesium.js that displays live aircraft data from the OpenSky Network API on a 3D globe.

## Features

- **Real-time Flight Tracking**: Displays live aircraft positions from the OpenSky Network API
- **3D Visualization**: Interactive 3D globe powered by Cesium.js with photorealistic terrain
- **Aircraft Information**: Detailed flight information including callsign, altitude, speed, heading, and more
- **Auto-refresh**: Updates flight data every 5 minutes automatically
- **Fallback Data**: Uses static flight data when the OpenSky API is unavailable
- **Responsive UI**: Flight statistics panel with real-time update indicators

## Tech Stack

- **React 19** with TypeScript
- **Cesium.js** for 3D geospatial visualization
- **Vite** for fast development and building
- **OpenSky Network API** for real-time flight data
- **ESLint** for code quality

## Prerequisites

Before running this project, you'll need:

1. **Cesium Ion Access Token**: 
   - Sign up at [Cesium Ion](https://cesium.com/ion/)
   - Get your access token from the dashboard

2. **Node.js**: Version 18 or higher

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cesium-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your Cesium Ion access token:
   ```bash
   VITE_CESIUM_ION_ACCESS_TOKEN=your_actual_token_here
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages. To deploy:

1. **Set up Repository Secrets**:
   - Go to your GitHub repository settings
   - Navigate to Secrets and Variables > Actions
   - Add a new repository secret: `VITE_CESIUM_ION_ACCESS_TOKEN` with your Cesium Ion token

2. **Enable GitHub Pages**:
   - Go to repository Settings > Pages
   - Set Source to "GitHub Actions"

3. **Deploy**:
   - Push to the `gh-pages` branch
   - The GitHub Action will automatically build and deploy
   - Your site will be available at: `https://yourusername.github.io/cesium-demo/`

### Manual Deployment
You can also deploy manually:
```bash
npm run deploy
```

## Project Structure

```
src/
├── components/
│   ├── cesium.tsx          # Main Cesium component with flight tracking
│   └── cesium.css          # Cesium-specific styles
├── util/
│   └── constants.ts        # Configuration constants
├── App.tsx                 # Main application component
└── main.tsx               # Application entry point
```

## Data Sources

- **Primary**: [OpenSky Network API](https://opensky-network.org/) - Real-time flight data
- **Fallback**: Static flight data for offline/API failure scenarios
- **Terrain**: Cesium Ion photorealistic 3D terrain tiles

## API Rate Limiting

The OpenSky Network API has rate limits. The application:
- Updates every 5 minutes to respect rate limits
- Automatically falls back to cached data if the API is unavailable
- Displays clear indicators when using fallback data

## Browser Support

This application requires a modern browser with WebGL support for Cesium.js visualization.

## License

This project is for demonstration purposes. Please check the licenses of:
- [Cesium.js](https://cesium.com/legal/terms-of-service/)
- [OpenSky Network](https://opensky-network.org/about/data-collection) for data usage terms
