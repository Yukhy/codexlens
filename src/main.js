'use strict';

const path = require('node:path');
const { app, BrowserWindow, ipcMain, nativeImage, shell, Tray, Menu } = require('electron');

const { getSnapshot } = require('./observer');
const { compareVersions, normalizeVersion } = require('./update/version');

const APP_NAME = 'CodexLens';
const TRAY_GUID = 'bfe88412-57a8-4122-b4dd-e66cc9d62c9c';
const LATEST_RELEASE_URL = 'https://github.com/Yukhy/codexlens/releases/latest';
const LATEST_RELEASE_API_URL = 'https://api.github.com/repos/Yukhy/codexlens/releases/latest';

let tray = null;
let window = null;

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
}

function createTrayImage() {
  const image = nativeImage.createFromPath(path.join(__dirname, 'assets', 'codexlensTemplate.png'));
  if (image.isEmpty()) {
    throw new Error('Failed to load CodexLens tray icon.');
  }
  image.setTemplateImage(true);
  return image;
}

function createWindow() {
  window = new BrowserWindow({
    width: 540,
    height: 690,
    show: false,
    frame: false,
    resizable: false,
    movable: true,
    fullscreenable: false,
    skipTaskbar: true,
    backgroundColor: '#f7f4ed',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  window.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) window.hide();
  });
}

function positionWindow() {
  if (!tray || !window) return;
  const trayBounds = tray.getBounds();
  const windowBounds = window.getBounds();
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 6);
  window.setPosition(Math.max(8, x), Math.max(8, y), false);
}

function toggleWindow() {
  if (!window) return;
  if (window.isVisible()) {
    window.hide();
    return;
  }
  positionWindow();
  window.show();
  window.focus();
}

function showSettingsWindow() {
  if (!window) return;
  positionWindow();
  window.show();
  window.focus();
  if (window.webContents.isLoading()) {
    window.webContents.once('did-finish-load', () => {
      window.webContents.send('observer:show-settings');
    });
    return;
  }
  window.webContents.send('observer:show-settings');
}

function createTray() {
  tray = new Tray(createTrayImage(), TRAY_GUID);
  if (process.platform === 'darwin') {
    tray.setTitle('');
  }
  tray.setToolTip(APP_NAME);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: `Show ${APP_NAME}`, click: toggleWindow },
    { label: 'Check for Updates...', click: showSettingsWindow },
    { type: 'separator' },
    { role: 'quit' }
  ]));
  tray.on('click', toggleWindow);
}

async function checkForUpdates() {
  const currentVersion = app.getVersion();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(LATEST_RELEASE_API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'CodexLens'
      },
      signal: controller.signal
    });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}`, currentVersion };
    }

    const release = await response.json();
    const latestVersion = normalizeVersion(release?.tag_name);
    if (!release || typeof release !== 'object' || latestVersion === '0.0.0') {
      return { ok: false, error: 'Invalid release response', currentVersion };
    }

    const releaseUrl = typeof release.html_url === 'string' && release.html_url
      ? release.html_url
      : LATEST_RELEASE_URL;

    return {
      ok: true,
      currentVersion,
      latestVersion,
      updateAvailable: compareVersions(latestVersion, currentVersion) > 0,
      releaseUrl
    };
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Request timed out' : 'Update check failed';
    return { ok: false, error: message, currentVersion };
  } finally {
    clearTimeout(timeout);
  }
}

ipcMain.handle('observer:getSnapshot', async () => getSnapshot());

ipcMain.handle('observer:openPath', async (_event, targetPath) => {
  if (!targetPath || typeof targetPath !== 'string') return { ok: false, error: 'Invalid path' };
  const error = await shell.openPath(targetPath);
  return error ? { ok: false, error } : { ok: true };
});

ipcMain.handle('observer:showItemInFolder', async (_event, targetPath) => {
  if (!targetPath || typeof targetPath !== 'string') return { ok: false, error: 'Invalid path' };
  shell.showItemInFolder(targetPath);
  return { ok: true };
});

ipcMain.handle('observer:openLatestRelease', async () => {
  await shell.openExternal(LATEST_RELEASE_URL);
  return { ok: true };
});

ipcMain.handle('observer:openExternal', async (_event, url) => {
  if (typeof url !== 'string' || !url.startsWith('https://github.com/')) {
    return { ok: false, error: 'Invalid URL' };
  }
  await shell.openExternal(url);
  return { ok: true };
});

ipcMain.handle('observer:getAppInfo', async () => ({ version: app.getVersion() }));

ipcMain.handle('observer:checkForUpdates', async () => checkForUpdates());

app.whenReady().then(() => {
  app.setName(APP_NAME);
  app.dock?.hide();
  createWindow();
  createTray();
});

app.on('second-instance', () => {
  if (!window) return;
  positionWindow();
  window.show();
  window.focus();
});

app.on('window-all-closed', () => {
  // Keep the tray app alive even when its popover window is hidden/closed.
});
