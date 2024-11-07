const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load your p5.js index.html file
  win.loadFile('index.html');

  // Register 'Esc' key to exit fullscreen mode
  globalShortcut.register('Esc', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
