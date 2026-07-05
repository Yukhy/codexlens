'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('observer', {
  getSnapshot: () => ipcRenderer.invoke('observer:getSnapshot'),
  openPath: (targetPath) => ipcRenderer.invoke('observer:openPath', targetPath),
  showItemInFolder: (targetPath) => ipcRenderer.invoke('observer:showItemInFolder', targetPath)
});
