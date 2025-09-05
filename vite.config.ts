import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy';

import react from '@vitejs/plugin-react'

const CESIUM_SOURCE = "node_modules/cesium/Build/Cesium";
const CESIUM_BASE_URL = "static/Cesium/";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/cesium-demo/' : '/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: `${CESIUM_SOURCE}/ThirdParty`, dest: CESIUM_BASE_URL },
        { src: `${CESIUM_SOURCE}/Workers`, dest: CESIUM_BASE_URL },
        { src: `${CESIUM_SOURCE}/Assets`, dest: CESIUM_BASE_URL },
        { src: `${CESIUM_SOURCE}/Widgets`, dest: CESIUM_BASE_URL },
      ],
    }),
  ],
})
