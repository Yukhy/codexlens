'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'docs', 'assets');
const rendererPath = path.join(root, 'src', 'renderer', 'index.html');
const preloadPath = path.join(__dirname, 'screenshot-preload.js');

app.on('window-all-closed', () => {
  // Keep Electron alive while this script captures multiple windows in sequence.
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForSelector(window, selector) {
  await window.webContents.executeJavaScript(`
    new Promise((resolve) => {
      const check = () => {
        if (document.querySelector(${JSON.stringify(selector)})) resolve(true);
        else setTimeout(check, 50);
      };
      check();
    })
  `);
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 540,
    height: 690,
    show: false,
    frame: false,
    resizable: false,
    backgroundColor: '#eef2f6',
    paintWhenInitiallyHidden: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  await window.loadFile(rendererPath);
  await waitForSelector(window, '.run-card');
  await sleep(250);
  return window;
}

async function capture(name, setup) {
  const window = await createWindow();
  try {
    if (setup) {
      await setup(window);
      await sleep(250);
    }
    const image = await window.webContents.capturePage();
    const filePath = path.join(outputDir, name);
    await fs.writeFile(filePath, image.toPNG());
    console.log(filePath);
  } finally {
    window.destroy();
  }
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await app.whenReady();
  app.dock?.hide();

  await capture('codexlens-overview.png');
  await capture('codexlens-settings.png', async (window) => {
    await window.webContents.executeJavaScript("document.getElementById('settings').click()");
    await waitForSelector(window, '.settings-view:not(.hidden)');
  });

  app.quit();
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  app.exit(1);
});
