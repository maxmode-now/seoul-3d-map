# 🏙️ Seoul 3D — Interactive 3D Map of Seoul

An **API-key-free** interactive 3D map of Seoul, built with MapLibre GL JS and OpenFreeMap.
It extrudes OSM building heights into a 3D cityscape with cinematic landmark tours and day/night modes.

![Seoul 3D](docs/screenshot.png)

## ✨ Features

- **3D building rendering** — fill-extrusion driven by OSM `render_height`, with a height-based color ramp (Lotte World Tower rises to its real 555 m)
- **Landmark tour** — one-click cinematic fly-to with info cards for 7 landmarks: Lotte World Tower, N Seoul Tower, 63 Building, Gyeongbokgung Palace, DDP, the National Assembly, and more
- **Camera modes** — free view / orbit (auto-rotate) / top-down
- **Day / night modes** — switches between the liberty (day) and dark (night) styles; at night, high-rises glow amber
- **Zero-dependency deploy** — no API keys, no backend; the static build goes straight to GitHub Pages

## 🛠️ Tech Stack

| Role | Choice |
|---|---|
| Map rendering | [MapLibre GL JS](https://maplibre.org) (WebGL, open source) |
| Vector tiles | [OpenFreeMap](https://openfreemap.org) — no sign-up, no keys, no usage limits |
| Map data | © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors |
| Build | Vite + vanilla JS (no framework) |

## 🚀 Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/
```

## 📦 Deploying to GitHub Pages

1. Push this repo to GitHub
2. In the repo, set **Settings → Pages → Source** to **GitHub Actions**
3. Every push to `main` triggers the [deploy.yml](.github/workflows/deploy.yml) workflow to build and deploy automatically

## 📁 Project Structure

```
├── index.html            # UI layout (side panel, info card)
├── src/
│   ├── main.js           # Map init, 3D layer, camera modes, theme switching
│   ├── landmarks.js      # Landmark data (coordinates, camera angles, descriptions)
│   └── style.css         # Dark navy + amber theme
└── .github/workflows/    # GitHub Pages auto-deploy
```

## 📝 About the Data

Building heights come from OpenStreetMap contributor data. Major landmarks and the downtown core have accurate heights, while some buildings lack height data and render at a default height. Want to improve Seoul's building data? Consider [contributing to OpenStreetMap](https://www.openstreetmap.org).

---

Built with [Claude Code](https://claude.com/claude-code) (Claude Fable 5)
