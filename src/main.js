import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import { CITIES, DEFAULT_CITY } from './cities.js';

const STYLES = {
  day: 'https://tiles.openfreemap.org/styles/liberty',
  night: 'https://tiles.openfreemap.org/styles/dark',
};

// Height (m) → color. Day: light blue-gray fading to amber on high-rises.
// Night: dark navy rising to glowing amber.
const BUILDING_PAINT = {
  day: [
    'interpolate', ['linear'], ['get', 'render_height'],
    0, '#dfe6ee',
    60, '#b9c7d9',
    150, '#8fa3bd',
    300, '#e8a94b',
    550, '#f5b942',
  ],
  night: [
    'interpolate', ['linear'], ['get', 'render_height'],
    0, '#1c2740',
    60, '#2c3b5e',
    150, '#4a5a85',
    300, '#d98e2b',
    550, '#ffb845',
  ],
};

const params = new URLSearchParams(window.location.search);
let cityId = CITIES[params.get('city')] ? params.get('city') : DEFAULT_CITY;
let theme = 'day';
let cameraMode = 'free';
let orbitFrame = null;
let markers = [];

const map = new maplibregl.Map({
  container: 'map',
  style: STYLES.day,
  ...CITIES[cityId].view,
  maxPitch: 75,
  canvasContextAttributes: { antialias: true },
});
map.addControl(
  new maplibregl.NavigationControl({ visualizePitch: true }),
  'top-right'
);

// Exposed globally for debugging
window.__map = map;

// ---------------------------------------------------------------- 3D buildings

function addBuildingLayer() {
  const style = map.getStyle();

  // Hide the style's built-in 3D building layers; we replace them with our own
  for (const layer of style.layers) {
    if (layer.type === 'fill-extrusion') {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  }

  const sourceName = Object.keys(style.sources).find(
    (k) => style.sources[k].type === 'vector'
  );
  if (!sourceName) return;

  // Insert above every fill/line layer (roads, bridges) but below the trailing
  // block of symbol layers, so nothing draws over building walls while labels
  // stay visible
  let labelLayerId;
  for (let i = style.layers.length - 1; i >= 0; i--) {
    if (style.layers[i].type !== 'symbol') {
      labelLayerId = style.layers[i + 1]?.id;
      break;
    }
  }

  map.addLayer(
    {
      id: 'seoul-3d-buildings',
      type: 'fill-extrusion',
      source: sourceName,
      'source-layer': 'building',
      minzoom: 13,
      filter: ['!=', ['get', 'hide_3d'], true],
      paint: {
        'fill-extrusion-color': BUILDING_PAINT[theme],
        'fill-extrusion-height': [
          'interpolate', ['linear'], ['zoom'],
          13, 0,
          14.5, ['coalesce', ['get', 'render_height'], 8],
        ],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        // Fully opaque — translucent extrusions let roads show through the walls
        'fill-extrusion-opacity': 1,
      },
    },
    labelLayerId
  );
}

// Force English-only labels: rewrite every name-based symbol layer to prefer
// the Latin name. Layers labeled by other fields (road refs, house numbers)
// are left untouched.
function applyEnglishLabels() {
  const LATIN_NAME = [
    'coalesce',
    ['get', 'name:latin'],
    ['get', 'name_en'],
    ['get', 'name'],
  ];
  for (const layer of map.getStyle().layers) {
    if (layer.type !== 'symbol') continue;
    const field = layer.layout?.['text-field'];
    if (!field || !JSON.stringify(field).includes('name')) continue;
    map.setLayoutProperty(layer.id, 'text-field', LATIN_NAME);
  }
}

// Fires on initial load and after every setStyle
map.on('style.load', () => {
  addBuildingLayer();
  applyEnglishLabels();
});

// ---------------------------------------------------------------- Landmarks

const listEl = document.getElementById('landmark-list');
const cardEl = document.getElementById('info-card');
const cardTitle = document.getElementById('card-title');
const cardChips = document.getElementById('card-chips');
const cardDesc = document.getElementById('card-desc');

function showCard(lm) {
  cardTitle.textContent = lm.name;
  cardChips.innerHTML = lm.chips
    .map((c) => `<span class="chip">${c}</span>`)
    .join('');
  cardDesc.textContent = lm.desc;
  cardEl.classList.remove('hidden');
}

function hideCard() {
  cardEl.classList.add('hidden');
  setActiveLandmark(null);
}

document.getElementById('card-close').addEventListener('click', hideCard);

function setActiveLandmark(id) {
  for (const li of listEl.children) {
    li.classList.toggle('active', li.dataset.id === id);
  }
}

function flyToLandmark(lm) {
  stopOrbit();
  setCameraMode('free');
  map.flyTo({
    center: lm.coords,
    ...lm.camera,
    speed: 0.9,
    curve: 1.5,
    essential: true,
  });
  showCard(lm);
  setActiveLandmark(lm.id);
}

function renderLandmarks(city) {
  listEl.innerHTML = '';
  for (const marker of markers) marker.remove();
  markers = [];

  for (const lm of city.landmarks) {
    const li = document.createElement('li');
    li.dataset.id = lm.id;
    li.innerHTML = `<span class="dot"></span>${lm.name}`;
    li.addEventListener('click', () => flyToLandmark(lm));
    listEl.appendChild(li);

    const markerEl = document.createElement('div');
    markerEl.className = 'lm-marker';
    markerEl.title = lm.name;
    markerEl.addEventListener('click', () => flyToLandmark(lm));
    markers.push(
      new maplibregl.Marker({ element: markerEl, anchor: 'center' })
        .setLngLat(lm.coords)
        .addTo(map)
    );
  }
}

// ---------------------------------------------------------------- City switching

const brandEl = document.getElementById('brand');
const taglineEl = document.getElementById('tagline');
const cityButtons = document.querySelectorAll('#city-controls button');

function setCity(id, { fly = true } = {}) {
  cityId = id;
  const city = CITIES[id];

  cityButtons.forEach((b) => b.classList.toggle('active', b.dataset.city === id));
  brandEl.innerHTML = `${city.label}<span class="accent">3D</span>`;
  taglineEl.textContent = city.tagline;
  document.title = `${city.name} 3D — Interactive 3D City Map`;

  // Shareable deep link (?city=nyc); default city keeps a clean URL
  const url = new URL(window.location);
  if (id === DEFAULT_CITY) url.searchParams.delete('city');
  else url.searchParams.set('city', id);
  history.replaceState(null, '', url);

  renderLandmarks(city);
  hideCard();
  stopOrbit();
  setCameraMode('free');
  if (fly) map.flyTo({ ...city.view, maxDuration: 6000, essential: true });
}

cityButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.city !== cityId) setCity(btn.dataset.city);
  });
});

setCity(cityId, { fly: false });

// ---------------------------------------------------------------- Camera modes

const cameraButtons = document.querySelectorAll('#camera-controls button');

function setCameraMode(mode) {
  cameraMode = mode;
  cameraButtons.forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
}

function startOrbit() {
  stopOrbit();
  let last = performance.now();
  const spin = (now) => {
    const dt = now - last;
    last = now;
    map.setBearing(map.getBearing() + dt * 0.004); // ~4°/s — one full turn in ~90 s
    orbitFrame = requestAnimationFrame(spin);
  };
  orbitFrame = requestAnimationFrame(spin);
}

function stopOrbit() {
  if (orbitFrame) {
    cancelAnimationFrame(orbitFrame);
    orbitFrame = null;
  }
}

cameraButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    setCameraMode(mode);
    if (mode === 'orbit') {
      if (map.getPitch() < 30) map.easeTo({ pitch: 60, duration: 800 });
      startOrbit();
    } else if (mode === 'top') {
      stopOrbit();
      map.easeTo({ pitch: 0, bearing: 0, duration: 900 });
    } else {
      stopOrbit();
    }
  });
});

// Leave orbit mode as soon as the user interacts directly
for (const ev of ['mousedown', 'touchstart', 'wheel']) {
  map.getCanvas().addEventListener(ev, () => {
    if (cameraMode === 'orbit') {
      stopOrbit();
      setCameraMode('free');
    }
  }, { passive: true });
}

// ---------------------------------------------------------------- Day / night

const themeButtons = document.querySelectorAll('#theme-controls button');

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const next = btn.dataset.theme;
    if (next === theme) return;
    theme = next;
    themeButtons.forEach((b) => b.classList.toggle('active', b.dataset.theme === theme));
    document.body.classList.toggle('night', theme === 'night');
    // setStyle drops custom layers; the style.load handler re-adds them
    map.setStyle(STYLES[theme]);
  });
});
