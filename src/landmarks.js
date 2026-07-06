// 서울 주요 랜드마크 — 좌표는 [경도, 위도]
// camera: flyTo 시 사용할 시점 (bearing은 랜드마크가 잘 보이는 각도로 개별 튜닝)
export const LANDMARKS = [
  {
    id: 'lotte-tower',
    name: '롯데월드타워',
    coords: [127.1025, 37.5126],
    camera: { zoom: 15.6, pitch: 65, bearing: -40 },
    chips: ['555m', '123층', '2017년'],
    desc: '대한민국에서 가장 높은 건물이자 세계 6위권 마천루. 잠실 스카이라인의 중심.',
  },
  {
    id: 'namsan-tower',
    name: 'N서울타워',
    coords: [126.9883, 37.5512],
    camera: { zoom: 14.8, pitch: 68, bearing: 25 },
    chips: ['236m', '남산 262m', '1980년 개장'],
    desc: '남산 정상에 자리한 서울의 상징. 타워와 산 높이를 합치면 해발 약 480m에서 서울 전역을 조망한다.',
  },
  {
    id: 'sixty-three',
    name: '63빌딩',
    coords: [126.9401, 37.5198],
    camera: { zoom: 15.4, pitch: 62, bearing: -25 },
    chips: ['249.6m', '63층', '1985년'],
    desc: '한강변 여의도의 골드 랜드마크. 준공 당시 아시아에서 가장 높은 빌딩이었다.',
  },
  {
    id: 'gyeongbokgung',
    name: '경복궁',
    coords: [126.977, 37.5788],
    camera: { zoom: 15.8, pitch: 55, bearing: 0 },
    chips: ['조선 법궁', '1395년 창건'],
    desc: '조선 왕조의 정궁. 북악산을 등지고 광화문 광장과 도심 스카이라인을 마주한다.',
  },
  {
    id: 'ddp',
    name: '동대문디자인플라자',
    coords: [127.0095, 37.5665],
    camera: { zoom: 16.2, pitch: 58, bearing: 60 },
    chips: ['자하 하디드', '2014년'],
    desc: '비정형 곡면 외관의 네오퓨처리즘 건축. 세계 최대 규모의 3차원 비정형 건축물 중 하나.',
  },
  {
    id: 'assembly',
    name: '국회의사당',
    coords: [126.914, 37.5319],
    camera: { zoom: 15.6, pitch: 60, bearing: -10 },
    chips: ['여의도', '1975년'],
    desc: '여의도 서쪽 끝의 대한민국 입법부. 돔 지붕과 한강 배경이 어우러진다.',
  },
  {
    id: 'city-hall',
    name: '서울시청 · 광화문 일대',
    coords: [126.978, 37.5665],
    camera: { zoom: 15.4, pitch: 60, bearing: -17 },
    chips: ['도심 한복판'],
    desc: '덕수궁, 시청, 청계천, 광화문으로 이어지는 서울 도심의 심장부.',
  },
];

// 초기 카메라: 시청 상공 비스듬한 시점
export const INITIAL_VIEW = {
  center: [126.978, 37.5665],
  zoom: 15.2,
  pitch: 60,
  bearing: -17,
};
