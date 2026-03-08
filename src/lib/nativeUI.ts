import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

const isNative = () => Capacitor.isNativePlatform();

/**
 * Initialize all native UI plugins on app start
 */
export async function initNativeUI() {
  if (!isNative()) return;

  try {
    // Status bar — dark content on light background
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn('StatusBar init error:', err);
  }

  try {
    // Hide splash screen after app is ready
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (err) {
    console.warn('SplashScreen hide error:', err);
  }

  try {
    // Keyboard — scroll content up when keyboard opens
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
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
  } catch {}
}
