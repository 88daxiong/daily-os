const { app, BrowserWindow, globalShortcut, ipcMain, nativeTheme, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// ── Paths ──────────────────────────────────────────────────
const DATA_DIR = path.join(app.getPath('appData'), 'DailyOS');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const ARCHIVE_DIR = path.join(DATA_DIR, 'archive');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// ── Default Data ───────────────────────────────────────────
function defaultData() {
  return {
    tags: [
      { id: 't1', name: '健康', color: '#859900' },
      { id: 't2', name: '职业', color: '#268bd2' },
      { id: 't3', name: '生活', color: '#cb4b16' },
      { id: 't4', name: '临时待办', color: '#6c71c4' }
    ],
    templates: [
      { id: 'tpl01', title: '晨间运动', sub: '拉伸或慢跑，唤醒身体（30 min）', time: '07:00', tagId: 't1', defaultShow: true },
      { id: 'tpl02', title: '专注工作', sub: '深度工作时段，关闭通知（90 min）', time: '09:00', tagId: 't2', defaultShow: true },
      { id: 'tpl03', title: '阅读学习', sub: '技术文章或书籍，记录关键笔记（30 min）', time: '10:30', tagId: 't2', defaultShow: true },
      { id: 'tpl04', title: '午餐休息', sub: '健康饮食，适量即可', time: '12:00', tagId: 't1', defaultShow: true },
      { id: 'tpl05', title: '午间小憩', sub: '20-30 分钟恢复精力', time: '12:40', tagId: 't1', defaultShow: true },
      { id: 'tpl06', title: '下午专注', sub: '第二段深度工作（120 min）', time: '14:00', tagId: 't2', defaultShow: true },
      { id: 'tpl07', title: '复盘总结', sub: '整理今日产出，规划明天（15 min）', time: '17:30', tagId: 't2', defaultShow: true },
      { id: 'tpl08', title: '晚间放松', sub: '散步、音乐或陪伴家人', time: '19:30', tagId: 't3', defaultShow: true },
      { id: 'tpl09', title: '睡前准备', sub: '放下手机，准时入睡', time: '22:30', tagId: 't1', defaultShow: true }
    ],
    days: {},
    drafts: []
  };
}

function defaultSettings() {
  return {
    username: 'User',
    globalShortcut: 'Alt+Space',
    launchAtLogin: false,
    themeMode: 'system', // system | light | dark
    windowBounds: { width: 1100, height: 750 }
  };
}

// ── File I/O ───────────────────────────────────────────────
function readJSON(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Failed to read ${filePath}:`, e);
  }
  return fallback();
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Archive ────────────────────────────────────────────────
function archiveLastMonth(data) {
  const now = new Date();
  // Only run on the 1st of the month
  if (now.getDate() !== 1) return data;

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prefix = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  const archivePath = path.join(ARCHIVE_DIR, `${prefix}.json`);

  if (fs.existsSync(archivePath)) return data; // already archived

  const toArchive = {};
  const remaining = {};

  for (const [dateStr, dayData] of Object.entries(data.days || {})) {
    if (dateStr.startsWith(prefix)) {
      toArchive[dateStr] = dayData;
    } else {
      remaining[dateStr] = dayData;
    }
  }

  if (Object.keys(toArchive).length > 0) {
    writeJSON(archivePath, { month: prefix, days: toArchive });
    data.days = remaining;
  }

  return data;
}

// ── Window ─────────────────────────────────────────────────
let mainWindow = null;
let settings = null;
let data = null;

function createWindow() {
  const bounds = settings.windowBounds || { width: 1100, height: 750 };

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 800,
    minHeight: 550,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('close', (e) => {
    // Save window bounds before anything
    const wb = mainWindow.getBounds();
    settings.windowBounds = wb;
    writeJSON(SETTINGS_FILE, settings);

    // Cmd+W hides instead of closing
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  updateDockBadge();
}

function toggleWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function updateDockBadge() {
  if (process.platform !== 'darwin') return;
  const today = new Date().toISOString().split('T')[0];
  const dayData = data.days?.[today];
  if (!dayData?.tasks) {
    app.dock.setBadge('');
    return;
  }
  const undone = dayData.tasks.filter(t => !t.done).length;
  app.dock.setBadge(undone > 0 ? String(undone) : '');
}

// ── IPC Handlers ───────────────────────────────────────────
function setupIPC() {
  ipcMain.handle('get-data', () => data);
  ipcMain.handle('get-settings', () => settings);
  ipcMain.handle('get-theme', () => nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  ipcMain.handle('get-today', () => new Date().toISOString().split('T')[0]);

  ipcMain.handle('save-data', (_, newData) => {
    try {
      data = newData;
      writeJSON(DATA_FILE, data);
      updateDockBadge();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('save-settings', (_, newSettings) => {
    try {
      settings = newSettings;
      writeJSON(SETTINGS_FILE, settings);
      // Update launch-at-login — only call if enabled
      if (settings.launchAtLogin) {
        try { app.setLoginItemSettings({ openAtLogin: true }); } catch(e) { /* ignore */ }
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('export-data', () => {
    return JSON.stringify(data, null, 2);
  });

  ipcMain.handle('import-data', (_, jsonStr) => {
    try {
      const imported = JSON.parse(jsonStr);
      data = imported;
      writeJSON(DATA_FILE, data);
      updateDockBadge();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('list-archives', () => {
    try {
      return fs.readdirSync(ARCHIVE_DIR).filter(f => f.endsWith('.json'));
    } catch (e) {
      return [];
    }
  });

  // Listen for badge update requests from renderer
  ipcMain.on('update-badge', () => {
    updateDockBadge();
  });

  // Theme change notification
  nativeTheme.on('updated', () => {
    if (mainWindow) {
      mainWindow.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
    }
  });
}

// ── App Lifecycle ──────────────────────────────────────────
app.whenReady().then(() => {
  ensureDirs();
  data = readJSON(DATA_FILE, defaultData);
  settings = readJSON(SETTINGS_FILE, defaultSettings);

  // Auto-archive
  data = archiveLastMonth(data);
  writeJSON(DATA_FILE, data);

  setupIPC();
  createWindow();

  // Global shortcut
  const shortcutKey = settings.globalShortcut || 'Alt+Space';
  try {
    globalShortcut.register(shortcutKey, toggleWindow);
  } catch (e) {
    console.error('Failed to register global shortcut:', e);
  }

  // Login item — only set if user explicitly enabled it
  if (settings.launchAtLogin) {
    try { app.setLoginItemSettings({ openAtLogin: true }); } catch(e) { /* ignore */ }
  }

  app.on('activate', () => {
    if (!mainWindow) createWindow();
    else mainWindow.show();
  });
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
