# 🏙️ Seoul 3D — 서울 3D 인터랙티브 맵

MapLibre GL JS + OpenFreeMap으로 만든 **API 키 없는** 서울 3D 인터랙티브 맵.
OSM 건물 높이 데이터를 3D로 압출해 서울 도심을 렌더링하고, 랜드마크 시네마틱 투어와 낮/밤 모드를 제공합니다.

<!-- 스크린샷: 로컬에서 실행 후 캡처해 docs/screenshot.png 로 저장하세요 -->
<!-- ![Seoul 3D](docs/screenshot.png) -->

## ✨ 기능

- **3D 건물 렌더링** — OSM `render_height` 기반 fill-extrusion, 높이에 따른 색 그라데이션 (롯데월드타워 555m 실측 반영)
- **랜드마크 투어** — 롯데월드타워 · N서울타워 · 63빌딩 · 경복궁 · DDP · 국회의사당 등 7곳을 클릭 한 번으로 시네마틱 fly-to + 정보 카드
- **카메라 모드** — 자유 시점 / 궤도(자동 회전) / 탑다운 전환
- **낮 / 밤 모드** — 주간(liberty) ↔ 야간(dark) 스타일 전환, 밤에는 고층부가 앰버색으로 발광
- **제로 의존 배포** — API 키·백엔드 없음. 정적 빌드 그대로 GitHub Pages에 올라감

## 🛠️ 기술 스택

| 역할 | 선택 |
|---|---|
| 지도 렌더링 | [MapLibre GL JS](https://maplibre.org) (WebGL, 오픈소스) |
| 벡터 타일 | [OpenFreeMap](https://openfreemap.org) — 가입/키/사용량 제한 없음 |
| 지도 데이터 | © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors |
| 빌드 | Vite + 바닐라 JS (프레임워크 없음) |

## 🚀 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 에 정적 빌드
```

## 📦 GitHub Pages 배포

1. 이 리포를 GitHub에 푸시
2. 리포 **Settings → Pages → Source**를 **GitHub Actions**로 설정
3. `main` 브랜치에 푸시하면 [deploy.yml](.github/workflows/deploy.yml) 워크플로가 자동 빌드·배포

## 📁 구조

```
├── index.html            # UI 레이아웃 (패널, 정보 카드)
├── src/
│   ├── main.js           # 맵 초기화, 3D 레이어, 카메라, 테마 전환
│   ├── landmarks.js      # 랜드마크 데이터 (좌표, 카메라 앵글, 설명)
│   └── style.css         # 다크 네이비 + 앰버 테마
└── .github/workflows/    # GitHub Pages 자동 배포
```

## 📝 데이터에 관하여

건물 높이는 OpenStreetMap 기여 데이터를 사용합니다. 주요 랜드마크와 도심부는 정확한 높이가 반영되어 있지만, 일부 건물은 높이 정보가 없어 기본값으로 렌더링됩니다. 서울 건물 데이터 개선에 기여하고 싶다면 [OpenStreetMap 편집](https://www.openstreetmap.org)에 참여해 보세요.

---

Built with [Claude Code](https://claude.com/claude-code) (Claude Fable 5)
