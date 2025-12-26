# 🎮 Till New Year

> **새해까지 살아남아라!** 12월 26일부터 31일까지, 쏟아지는 총알을 피해 새해를 맞이하는 클래식 탄막 게임

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Canvas](https://img.shields.io/badge/Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)

---

## 🎯 게임 소개

**Till New Year**는 클래식 아케이드 스타일의 탄막 회피 게임입니다.

연말의 마지막 6일, 하늘에서 쏟아지는 다양한 패턴의 총알들을 피해 새해를 맞이하세요!

```
🗓️ STAGE 1: 12월 26일  →  🗓️ STAGE 2: 12월 27일  →  ...  →  🎆 FINAL: 12월 31일
```

### ✨ 특징

- 🎨 **아름다운 레트로 그래픽** - 네온 스타일의 UI와 깔끔한 SVG 스프라이트
- 📱 **모바일 지원** - 터치 컨트롤로 어디서나 플레이
- 🎯 **6개의 스테이지** - 매일 높아지는 난이도
- 💥 **다양한 총알 패턴** - Random, Aimed, Wave, Burst, Spiral
- 🏆 **하이스코어 시스템** - 최고 기록에 도전하세요!

---

## 🕹️ 조작법

### ⌨️ 키보드
| 키 | 동작 |
|:---:|:---:|
| `←` `→` | 좌우 이동 |
| `A` `D` | 좌우 이동 |
| `ESC` | 일시정지 |

### 📱 모바일
| 버튼 | 동작 |
|:---:|:---:|
| `◀` | 왼쪽 이동 |
| `▶` | 오른쪽 이동 |

---

## 🎮 게임 플레이

### 스테이지 구성

| Stage | 날짜 | 난이도 | 총알 패턴 |
|:---:|:---:|:---:|:---:|
| 1 | 12월 26일 | ⭐ | Random |
| 2 | 12월 27일 | ⭐⭐ | Random, Aimed |
| 3 | 12월 28일 | ⭐⭐⭐ | Random, Aimed, Wave |
| 4 | 12월 29일 | ⭐⭐⭐⭐ | Random, Aimed, Wave, Burst |
| 5 | 12월 30일 | ⭐⭐⭐⭐⭐ | All Patterns |
| 6 | 12월 31일 | 💀 FINAL | All Patterns (Boss) |

### 점수 시스템

- ⏱️ **생존 보너스**: 매 초당 10점
- 🎉 **스테이지 클리어**: 스테이지 × 1,000점
- 🎆 **게임 클리어**: Happy New Year! 🎊

---

## 🛠️ 기술 스택

```
Frontend:  React 19 + TypeScript
Build:     Vite 5
Rendering: HTML5 Canvas API
Styling:   CSS3 (Glassmorphism, Neon Effects)
```

### 프로젝트 구조

```
till-new-year/
├── public/
│   ├── player.svg          # 플레이어 우주선
│   └── monsters/           # 몬스터 스프라이트 (예정)
├── src/
│   ├── components/
│   │   ├── GameCanvas.tsx  # 메인 게임 컴포넌트
│   │   └── GameCanvas.css  # 스타일링
│   └── game/
│       ├── GameEngine.ts   # 게임 엔진 (루프, 상태관리)
│       ├── Player.ts       # 플레이어 클래스
│       ├── Bullet.ts       # 총알 & 스포너 클래스
│       └── types.ts        # 타입 정의 & 설정
└── ...
```

---

## 🚀 시작하기

### 설치

```bash
# 레포지토리 클론
git clone https://github.com/YOUR_USERNAME/till-new-year.git

# 디렉토리 이동
cd till-new-year

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

---

## 🗺️ 로드맵

- [x] 기본 게임 플레이 (총알 피하기)
- [x] 6개 스테이지 시스템
- [x] 모바일 컨트롤
- [ ] 몬스터 시스템 (총알 발사 주체)
- [ ] 플레이어 공격 기능
- [ ] 보스 몬스터 (스테이지 90%에서 등장)
- [ ] 아이템 & 업그레이드 시스템
- [ ] 사운드 & BGM

---

## 📜 라이선스

MIT License © 2024

---

<div align="center">

### 🎆 Happy New Year! 🎆

*새해까지 살아남을 수 있을까요?*

**[▶️ 지금 플레이하기](https://till-new-year.vercel.app)**

</div>
