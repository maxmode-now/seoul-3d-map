import { defineConfig } from 'vite';

export default defineConfig({
  // 상대 경로 빌드 — GitHub Pages 프로젝트 사이트(/repo-name/ 하위 경로)에서도 동작
  base: './',
});
