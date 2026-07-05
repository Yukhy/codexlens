'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('observer', {
  getSnapshot: () => ipcRenderer.invoke('observer:getSnapshot'),
  getAppInfo: () => ipcRenderer.invoke('observer:getAppInfo'),
  checkForUpdates: () => ipcRenderer.invoke('observer:checkForUpdates'),
  openPath: (targetPath) => ipcRenderer.invoke('observer:openPath', targetPath),
  showItemInFolder: (targetPath) => ipcRenderer.invoke('observer:showItemInFolder', targetPath),
  openLatestRelease: (targetUrl) => ipcRenderer.invoke('observer:openLatestRelease', targetUrl)
});
