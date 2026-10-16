# 리빌더스 (Rebuilders — Food Tracker)

서버·로그인·데이터 수집이 없는 식단 기록 앱입니다. 모든 기록은 사용자 기기 안(IndexedDB)에만 저장됩니다.
같은 코드가 두 가지로 배포됩니다.

- **웹**: GitHub Pages(`CNAME` → rebuilders.co.kr). 저장소 루트가 그대로 사이트입니다.
- **iOS 앱**: Capacitor로 감싼 앱(`ios/`). `npm run build`가 `www/`를 만들고 `npx cap sync ios`가 앱에 복사합니다.

## 구조

| 파일 | 역할 |
| --- | --- |
| `index.html`, `style.css`, `app.js` | 화면과 앱 로직 |
| `storage.js` | `StorageRepository` 인터페이스 + `IndexedDbStorage`(기본), `LocalApiStorage`(개발용). 나중에 SQLite로 바꿀 때는 `registerRepository`/`createRepository` 참고 |
| `backup.js` | JSON 백업 내보내기/가져오기(형식 검증, 버전·날짜 파일명, 공유 시트/다운로드) |
| `notifications.js` | 식사 기록 로컬 알림(앱에서만 동작, 웹에서는 비활성) |
| `app-config.js` | 빌드 대상 플래그. 앱 번들에서는 빌드 스크립트가 `allowLocalMode:false`로 덮어씀 |
| `demo-seed.js` | 샘플 식단(설정 > 내 데이터 > 샘플 식단 불러오기에서 사용자가 확인한 뒤에만 추가) |
| `sw.js`, `manifest.webmanifest`, `assets/icons/` | PWA(웹에서 홈 화면 추가·오프라인). 앱에서는 서비스 워커를 등록하지 않음 |
| `privacy.html` | 개인정보 처리방침 |
| `scripts/build-www.mjs` | 허용 목록 파일만 `www/`로 복사(.git, CNAME, sw.js 등 제외) |
| `capacitor.config.ts`, `ios/` | Capacitor 설정과 iOS 프로젝트(Swift Package Manager 방식, `pod install` 불필요) |

앱 기본 정보(바꾸려면 아래 "확인·결정할 것" 참고): 앱 이름 `리빌더스`, 번들 ID `kr.co.rebuilders.foodtracker`, 버전 1.0(빌드 1), iPhone 전용·세로 고정.

## 이미 반영된 것

- Microsoft Clarity 등 외부 전송/추적 코드 제거(외부 네트워크 요청 0건). App Privacy는 "데이터 수집 안 함"으로 답할 수 있는 구조입니다.
- 첫 실행은 빈 상태. 샘플은 선택 사항.
- 백업/복원, `navigator.storage.persist()` 요청, 로컬 알림 시간 설정, 영양 데이터 출처(USDA FoodData Central) 표시, 개인정보 처리방침 링크.
- 앱 모드에서 텔레그램 데모·AI 메시지 앱 안내·음성 입력 버튼 숨김. `LOCAL_MODE`(로컬 서버 연동)는 `app-config.js`의 `allowLocalMode`가 `true`인 웹 빌드의 `http://localhost`에서만 켜지고, 앱 번들과 네이티브에서는 켜지지 않습니다.

## 맥에서 할 일 (Xcode 필요)

> 필요 환경(Capacitor 8 문서 기준): **Node 22 이상, Xcode 26 이상**, iOS 15+ 배포 대상. 애플 개발자 등록(연 99달러)·결제·앱 제출은 **본인이 직접** 합니다. 이 저장소의 어떤 스크립트도 결제나 제출을 하지 않습니다.

```bash
git clone https://github.com/designpersona/rebuilders-site.git
cd rebuilders-site
git checkout appstore-prep      # 병합 전이라면. 병합 후에는 main
npm install
npm run build                   # www/ 생성
npx cap sync ios                # www → ios/App/App/public + 플러그인 정리
npx cap open ios                # Xcode 열기
```

Xcode에서:

1. 왼쪽에서 `App` 프로젝트 → `TARGETS > App` → **Signing & Capabilities**: Team 선택(유료 개발자 계정 필요), "Automatically manage signing" 켜기.
2. **Bundle Identifier**가 `kr.co.rebuilders.foodtracker`인지 확인(다른 값으로 바꾸려면 `capacitor.config.ts`의 `appId`와 Xcode 값을 같이 수정).
3. **General**: Display Name `리빌더스`, Version `1.0`, Build `1`(업로드할 때마다 Build 숫자를 올려야 함).
4. 상단 기기를 "Any iOS Device (arm64)"로 선택 → 메뉴 **Product > Archive**.
5. Organizer 창에서 **Distribute App > App Store Connect > Upload**.
6. 업로드 전에 실제 아이폰을 연결해 Run으로 먼저 돌려보세요(아래 "확인 못 한 것" 참고).
7. [App Store Connect](https://appstoreconnect.apple.com)에서 새 앱을 만들고(번들 ID 선택), 아래 체크리스트를 채운 뒤 빌드를 선택해 심사에 제출합니다.

웹 코드를 고친 뒤에는 `npm run sync:ios`(= build + cap sync)만 다시 하면 됩니다.

## 제출 체크리스트

- [ ] 애플 개발자 프로그램 가입(본인). 한국 개발자 인증 절차와 무료 앱에도 필요한지 여부는 애플 안내에서 확인
- [ ] 식단 앱이 "규제 분야(헬스케어)"로 보아 법적 주체(사업자) 제출이 필요한지 확인(App Review Guidelines 5.1.1(ix)). 확인 못 한 항목
- [ ] 개인정보 처리방침 URL: `privacy.html`을 배포한 뒤 `https://rebuilders.co.kr/privacy.html`을 App Store Connect에 입력. **`privacy.html`의 `[이메일]`(두 곳)을 실제 연락처로 교체**
- [ ] App Privacy 설문: "데이터를 수집하지 않음". 제출 직전에 앱이 외부로 요청하는 코드가 없는지 다시 확인(`npm run check`)
- [ ] 앱 설명, 키워드, 카테고리(건강 및 피트니스 / 식음료 중 선택), 연령 등급, 지원 URL, 저작권 표기
- [ ] 스크린샷(iPhone 6.9"/6.5" 등 App Store Connect가 요구하는 크기) — 앱은 iPhone 전용으로 설정됨
- [ ] 심사 메모: 로그인·계정 없음, 모든 데이터는 기기 안 저장, 설정 > 내 데이터의 "샘플 식단 불러오기"로 화면을 확인할 수 있음, 알림 권한은 설정에서 켤 때만 요청
- [ ] **이미지·캐릭터·음식 아이콘·로고 권리 확인 (제출 전 사용자 확인 필요)**: `assets/character/*`, `assets/icon/*`, `assets/logo/*`의 제작자와 사용 권리를 이 저장소에서 확인할 수 없습니다. 직접 만들었거나 상업적 사용이 허용된 것인지 확인하세요. 출처가 불분명한 이미지는 교체하세요
- [ ] 앱 아이콘: 현재 `assets/icons/`와 `ios/.../AppIcon-512@2x.png`는 가로 로고를 흰 배경 정사각형에 넣은 임시본입니다. 전용 정사각 아이콘(1024×1024, 투명 없음)으로 교체 권장
- [ ] 영양 데이터: `food-catalog.js`의 내장 식품 26개는 모두 USDA FoodData Central 출처로 표기돼 있고 화면에도 출처가 표시됩니다. 그 외 앱 안의 일부 값은 추정치일 수 있어 문구에 "일부는 추정값"이라고 적었으니, 사실과 맞는지 확인하세요. 의학적 조언이 아니라는 문구가 화면에 있음
- [ ] 화면에 남아 있는 고정 데모 콘텐츠 정리 여부 결정: Foodex > 레시피의 "홈메이드 샐러드" 카드(`demo-salad`), 내 컬렉션의 "데모 제품 저장" 동작
- [ ] "AI 채팅" 명칭: 현재는 서버 AI가 아니라 앱 안의 문장 규칙으로 음식을 찾는 기능입니다. 설명문에서 오해가 없게 표현
- [ ] 첫 심사에서 4.2("웹사이트를 감싼 앱") 지적이 올 수 있음 → 심사 메모에 오프라인 동작, 로컬 알림, 파일 백업/공유 시트 등 앱 기능을 적기

## 확인·결정할 것

- 개인정보 문의 이메일(`privacy.html`의 `[이메일]`)
- 이미지·캐릭터·로고 권리(위 체크리스트)
- 앱 이름과 번들 ID(현재 `리빌더스`, `kr.co.rebuilders.foodtracker`). 번들 ID는 App Store Connect에서 만든 뒤에는 바꿀 수 없음
- 개발자 계정 종류(개인/사업자)와 가입
- 영어 UI: 언어 전환(한국어/English)은 있지만 백업 검증 오류 문구와 개인정보 처리방침은 한국어 위주

## 확인하지 못한 것

이 저장소는 리눅스에서 작업되어 **Xcode 빌드, 실제 아이폰 실행, 알림 발송, iOS 공유 시트 동작은 확인하지 못했습니다.**

- 자동 확인한 것: JS 문법, 외부 네트워크 요청 0건, 백업 내보내기→비우기→가져오기 왕복, 잘못된 파일 거부, 샘플 불러오기 확인창, 알림 설정 UI(Capacitor를 모의한 headless Chrome).
- 맥/아이폰에서 직접 확인할 것: ① 앱 실행·홈 화면 표시 ② 설정 > 식사 기록 알림 켜기 → 권한 팝업 → 지정 시간에 알림 ③ 백업 내보내기 → 공유 시트에서 "파일에 저장"(iCloud Drive) ④ 다른 기기/재설치 후 가져오기 ⑤ 비행기 모드에서 동작 ⑥ 키보드·안전 영역(노치) 표시.
- 번들러가 없어서 `Capacitor.registerPlugin('이름')`으로 네이티브 플러그인(LocalNotifications/Filesystem/Share)을 연결합니다. 실제 기기에서 동작하는지 위 ②③으로 꼭 확인하세요.

## 개발 메모

- 로컬에서 웹 확인: 저장소 루트에서 `python3 -m http.server` 후 `http://localhost:8000/?storage=indexeddb`.
- `npm run check`: JS 문법 + 외부 전송/추적 코드 점검.
- 웹 배포 파일을 바꾸면 `sw.js`의 `CACHE_VERSION`을 올려 주세요.
- 저장 형태가 바뀌면 `storage.js`의 마이그레이션과 `backup.js`의 `VERSION`을 함께 올립니다.
