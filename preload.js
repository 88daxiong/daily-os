const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dailyOS', {
  // Data
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // Theme
  getTheme: () => ipcRenderer.invoke('get-theme'),
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme-changed', (_, theme) => callback(theme));
  },

  // Date
  getToday: () => ipcRenderer.invoke('get-today'),

  // Export / Import
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: (jsonStr) => ipcRenderer.invoke('import-data', jsonStr),

  // Archives
  listArchives: () => ipcRenderer.invoke('list-archives'),

  // Badge
  updateBadge: () => ipcRenderer.send('update-badge')
});
