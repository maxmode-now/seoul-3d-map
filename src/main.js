import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import { LANDMARKS, INITIAL_VIEW } from './landmarks.js';

const STYLES = {
  day: 'https://tiles.openfreemap.org/styles/liberty',
  night: 'https://tiles.openfreemap.org/styles/dark',
};

// 높이(m) → 색. 낮: 밝은 회청색에서 고층부 앰버, 밤: 어두운 네이비에서 발광 앰버.
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

let theme = 'day';
let cameraMode = 'free';
let orbitFrame = null;

const map = new maplibregl.Map({
  container: 'map',
  style: STYLES.day,
  ...INITIAL_VIEW,
  maxPitch: 75,
  canvasContextAttributes: { antialias: true },
});
map.addControl(
  new maplibregl.NavigationControl({ visualizePitch: true }),
  'top-right'
);

// 디버깅/검증용 전역 노출
window.__map = map;

// ---------------------------------------------------------------- 3D 건물

function addBuildingLayer() {
  const style = map.getStyle();

  // 스타일에 내장된 기존 3D 건물 레이어는 숨기고 커스텀 레이어로 대체
  for (const layer of style.layers) {
    if (layer.type === 'fill-extrusion') {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  }

  const sourceName = Object.keys(style.sources).find(
    (k) => style.sources[k].type === 'vector'
  );
  if (!sourceName) return;

  // 라벨 아래에 삽입해 지명이 건물에 가려지지 않게 함
  const labelLayerId = style.layers.find(
    (l) => l.type === 'symbol' && l.layout?.['text-field']
  )?.id;

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
        'fill-extrusion-opacity': theme === 'night' ? 0.95 : 0.85,
      },
    },
    labelLayerId
  );
}

// 초기 로드와 setStyle 이후 모두 발화
map.on('style.load', addBuildingLayer);

// ---------------------------------------------------------------- 랜드마크

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

document.getElementById('card-close').addEventListener('click', () => {
  cardEl.classList.add('hidden');
  setActiveLandmark(null);
});

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

for (const lm of LANDMARKS) {
  const li = document.createElement('li');
  li.dataset.id = lm.id;
  li.innerHTML = `<span class="dot"></span>${lm.name}`;
  li.addEventListener('click', () => flyToLandmark(lm));
  listEl.appendChild(li);

  const markerEl = document.createElement('div');
  markerEl.className = 'lm-marker';
  markerEl.title = lm.name;
  markerEl.addEventListener('click', () => flyToLandmark(lm));
  new maplibregl.Marker({ element: markerEl, anchor: 'center' })
    .setLngLat(lm.coords)
    .addTo(map);
}

// ---------------------------------------------------------------- 카메라 모드

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
    map.setBearing(map.getBearing() + dt * 0.004); // 약 15초에 한 바퀴의 1/4 느낌으로 잔잔하게
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

// 사용자가 직접 조작하면 궤도 모드 해제
for (const ev of ['mousedown', 'touchstart', 'wheel']) {
  map.getCanvas().addEventListener(ev, () => {
    if (cameraMode === 'orbit') {
      stopOrbit();
      setCameraMode('free');
    }
  }, { passive: true });
}

// ---------------------------------------------------------------- 낮/밤 토글

const themeButtons = document.querySelectorAll('#theme-controls button');

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const next = btn.dataset.theme;
    if (next === theme) return;
    theme = next;
    themeButtons.forEach((b) => b.classList.toggle('active', b.dataset.theme === theme));
    document.body.classList.toggle('night', theme === 'night');
    // setStyle은 커스텀 레이어를 날리므로 style.load 핸들러가 재추가한다
    map.setStyle(STYLES[theme]);
  });
});
