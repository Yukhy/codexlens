'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('observer', {
  getSnapshot: () => ipcRenderer.invoke('observer:getSnapshot'),
  openPath: (targetPath) => ipcRenderer.invoke('observer:openPath', targetPath),
  showItemInFolder: (targetPath) => ipcRenderer.invoke('observer:showItemInFolder', targetPath),
  openLatestRelease: () => ipcRenderer.invoke('observer:openLatestRelease'),
  openExternal: (url) => ipcRenderer.invoke('observer:openExternal', url),
  getAppInfo: () => ipcRenderer.invoke('observer:getAppInfo'),
  getLoginItemSettings: () => ipcRenderer.invoke('observer:getLoginItemSettings'),
  setLoginItem: (enabled) => ipcRenderer.invoke('observer:setLoginItem', enabled),
  checkForUpdates: () => ipcRenderer.invoke('observer:checkForUpdates'),
  onShowSettings: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = () => callback();
    ipcRenderer.on('observer:show-settings', listener);
    return () => ipcRenderer.removeListener('observer:show-settings', listener);
  }
});
