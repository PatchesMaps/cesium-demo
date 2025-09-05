import React, { useEffect, useState } from 'react'
import { CESIUM_ION_ACCESS_TOKEN } from '../util/constants'
import * as Cesium from 'cesium'

import 'cesium/Build/Cesium/Widgets/widgets.css';
import './cesium.css'

// Flight data interface based on OpenSky API
interface FlightState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

interface OpenSkyResponse {
  time: number;
  states: (string | number | boolean | null)[][];
}

// Extend the Window interface to include CESIUM_BASE_URL
declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

window.CESIUM_BASE_URL = '/static/Cesium/';

Cesium.Ion.defaultAccessToken = CESIUM_ION_ACCESS_TOKEN;

// Function to parse OpenSky API response into FlightState objects
const parseFlightData = (data: OpenSkyResponse): FlightState[] => {
  return data.states?.map(state => ({
    icao24: state[0] as string,
    callsign: state[1] as string | null,
    origin_country: state[2] as string,
    time_position: state[3] as number | null,
    last_contact: state[4] as number,
    longitude: state[5] as number | null,
    latitude: state[6] as number | null,
    baro_altitude: state[7] as number | null,
    on_ground: state[8] as boolean,
    velocity: state[9] as number | null,
    true_track: state[10] as number | null,
    vertical_rate: state[11] as number | null,
    sensors: state[12] as number[] | null,
    geo_altitude: state[13] as number | null,
    squawk: state[14] as string | null,
    spi: state[15] as boolean,
    position_source: state[16] as number,
  })) || [];
};

// Function to fetch flight data from OpenSky API
const fetchFlightData = async (): Promise<FlightState[]> => {
  try {
    const response = await fetch('https://opensky-network.org/api/states/all'); // opensky rate limits which restricts our ability to further narrow our request

    if (!response.ok) {
      console.warn(`Failed to fetch flight data from OpenSky API. \nHTTP Error: ${response.status} \nUsing static fallback data...`);

      const fallbackRes = await fetch('/flightData.json');
      if (!fallbackRes.ok) throw new Error(`Failed to fetch fallback flight data. HTTP Error: ${fallbackRes.status}`);

      const fallbackData = await fallbackRes.json();
      return parseFlightData(fallbackData);
    }

    const data: OpenSkyResponse = await response.json();
    return parseFlightData(data);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    return [];
  }
};

// Function to create a simple aircraft icon canvas using Unicode airplane
const createAircraftIcon = (rotation: number = 0): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create canvas context');

  canvas.width = 24;
  canvas.height = 24;

  // Clear canvas with transparent background
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Save context and translate to center
  context.save();
  context.translate(12, 12);
  context.rotate(rotation);

  // Set text properties for the airplane Unicode character
  context.font = '16px Arial';
  context.fillStyle = '#FFD700'; // Gold color
  context.strokeStyle = '#000000';
  context.lineWidth = 1;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Draw the airplane Unicode character ✈
  context.fillText('\u2708', 0, 0);
  context.strokeText('\u2708', 0, 0);

  context.restore();

  return canvas;
};

// Function to create aircraft entities in Cesium
const createAircraftEntities = (viewer: Cesium.Viewer, flightData: FlightState[]) => {
  // Clear existing aircraft entities
  viewer.entities.removeAll();

  flightData.forEach(flight => {
    if (flight.longitude !== null && flight.latitude !== null && !flight.on_ground) {
      const altitude = flight.geo_altitude || flight.baro_altitude || 10000;

      // Convert units to imperial
      const velocityKnots = flight.velocity ? (flight.velocity * 1.944).toFixed(0) : 'N/A'; // m/s to knots
      const altitudeFeet = (altitude * 3.28084).toFixed(0); // meters to feet

      // Create aircraft entity
      const aircraftIcon = createAircraftIcon(flight.true_track ? Cesium.Math.toRadians(flight.true_track) : 0);

      viewer.entities.add({
        id: flight.icao24,
        name: flight.callsign?.trim() || flight.icao24,
        position: Cesium.Cartesian3.fromDegrees(
          flight.longitude,
          flight.latitude,
          altitude
        ),
        billboard: {
          image: aircraftIcon,
          scale: 1.0,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        },
        label: {
          text: flight.callsign?.trim() || flight.icao24,
          font: '12pt monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 32),
          fillColor: Cesium.Color.YELLOW,
          outlineColor: Cesium.Color.BLACK,
          scale: 0.8,
        },
        description: `
          <div style="font-family: Arial, sans-serif;">
            <h3 style="margin-top: 0; color: #48b1ff;">${flight.callsign?.trim() || flight.icao24}</h3>
            <table class="flight-info-table" style="width: 100%; position: relative; display: table; z-index: 99999; color: black;" >
              <tr><td><strong>Country:</strong></td><td>${flight.origin_country}</td></tr>
              <tr><td><strong>ICAO24:</strong></td><td>${flight.icao24}</td></tr>
              <tr><td><strong>Altitude:</strong></td><td>${altitudeFeet} ft (${altitude.toFixed(0)} m)</td></tr>
              <tr><td><strong>Speed:</strong></td><td>${velocityKnots} kts (${flight.velocity?.toFixed(1) || 'N/A'} m/s)</td></tr>
              <tr><td><strong>Heading:</strong></td><td>${flight.true_track?.toFixed(1) || 'N/A'}°</td></tr>
              <tr><td><strong>Vertical Rate:</strong></td><td>${flight.vertical_rate?.toFixed(1) || 'N/A'} m/s</td></tr>
              <tr><td><strong>Squawk:</strong></td><td>${flight.squawk || 'N/A'}</td></tr>
            </table>
          </div>
        `,
      });
    }
  });
};

const CesiumComponent: React.FC = () => {
  const [flightCount, setFlightCount] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let viewer: Cesium.Viewer | undefined;
    let intervalId: NodeJS.Timeout;

    const initCesium = async () => {
      viewer ??= new Cesium.Viewer('cesium-container', {
        terrain: Cesium.Terrain.fromWorldTerrain(),
      });

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-73.9926, 40.6272, 3000),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-15.0),
        }
      });

      const googlePhotoRealistic = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
      const manhattan = await Cesium.Cesium3DTileset.fromIonAssetId(3691029);
      const datasets = [googlePhotoRealistic, manhattan];
      const { primitives } = viewer.scene;

      datasets.forEach(dataset => {
        primitives.add(dataset);
      });

      // Fetch and display initial flight data
      const initialFlightData = await fetchFlightData();
      createAircraftEntities(viewer, initialFlightData);
      setFlightCount(initialFlightData.filter(f => !f.on_ground && f.longitude !== null && f.latitude !== null).length);
      setLastUpdate(new Date().toLocaleTimeString());
      setIsLoading(false);

      // Set up periodic updates every 5 minutes
      intervalId = setInterval(async () => {
        try {
          const updatedFlightData = await fetchFlightData();
          createAircraftEntities(viewer!, updatedFlightData);
          setFlightCount(updatedFlightData.filter(f => !f.on_ground && f.longitude !== null && f.latitude !== null).length);
          setLastUpdate(new Date().toLocaleTimeString());
          console.info(`Updated flight data: ${updatedFlightData.length} total aircraft, ${updatedFlightData.filter(f => !f.on_ground).length} airborne`);
        } catch (error) {
          console.error('Error updating flight data:', error);
        }
      }, 300_000);
    };

    initCesium();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      viewer?.destroy();
    };
  }, [])

  return (
    <div id="cesium-container">
      <div className="flight-info" style={{
      }}>
        <h3 className="flight-info-title">
          Live Flight Tracking
        </h3>
        <div>Aircraft visible: {flightCount}</div>
        <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
          {isLoading ? 'Loading flight data...' : `Last updated: ${lastUpdate}`}
        </div>
        <p className="flight-info-text">
          Updates every 5 minutes
        </p>
        <div className="flight-info-text flight-info-source">
          Data from OpenSky Network
        </div>
      </div>
    </div>
  )
}

export default CesiumComponent
