import React, { useEffect } from 'react'
import { CESIUM_ION_ACCESS_TOKEN } from '../util/constants'
import * as Cesium from 'cesium'

import 'cesium/Build/Cesium/Widgets/widgets.css';
import './cesium.css'

// Extend the Window interface to include CESIUM_BASE_URL
declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

window.CESIUM_BASE_URL = '/static/Cesium/';

Cesium.Ion.defaultAccessToken = CESIUM_ION_ACCESS_TOKEN;

const CesiumComponent: React.FC = () => {  
  useEffect(() => {
    let viewer: Cesium.Viewer | undefined;

    const initCesium = async () => {
      viewer ??= new Cesium.Viewer('cesium-container', {
        terrain: Cesium.Terrain.fromWorldTerrain(),
      });

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-15.0),
        }
      });

      const buildingTileset = await Cesium.createOsmBuildingsAsync();
      const { primitives } = viewer.scene;

      primitives.add(buildingTileset);
    };

    initCesium();

    return () => {
      viewer?.destroy();
    };
  }, [])

  return (
    <div id="cesium-container">
    </div>
  )
}

export default CesiumComponent
