import { Capacitor } from '@capacitor/core';

const isNative = () => Capacitor.isNativePlatform();

/**
 * Initialize all native UI plugins on app start
 */
export async function initNativeUI() {
  if (!isNative()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn('StatusBar init error:', err);
  }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (err) {
    console.warn('SplashScreen hide error:', err);
  }

  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.setProperty('--keyboard-height', '0px');
      document.body.classList.remove('keyboard-open');
    });
  } catch (err) {
    console.warn('Keyboard init error:', err);
  }
}

/**
 * Set status bar for dark theme
 */
export async function setDarkStatusBar() {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0A0A0A' });
  } catch {}
}

/**
 * Set status bar for light theme  
 */
export async function setLightStatusBar() {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
  } catch {}
}
