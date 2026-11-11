import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kr.co.rebuilders.foodtracker',
  appName: '리빌더스',
  webDir: 'www',
  android: {
    // 개발 중 맥 미니 브리지(http)에 연결하기 위함. 출시 전 https 서버로 바꾸면 끔.
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'never',
  },
  plugins: {
    // 키보드가 올라올 때 웹뷰 크기를 iOS가 늦게(애니메이션 뒤) 바꾸면 입력창이 늦게 따라옴.
    // 크기 조절은 keyboard.js 가 keyboardWillShow 높이로 키보드와 같은 시간에 직접 함.
    Keyboard: {
      resize: 'none',
    },
  },
};

export default config;
