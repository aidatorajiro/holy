const { app, BrowserWindow, globalShortcut, Menu } = require('electron')

const path = require("path")
const { env } = require('process')

//if (process.env.NODE_ENV == 'development') {
//  require('electron-reloader')(module)
//}

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'preload.js')
    }
  })

  let quitApp = function() {
    win.close();
    app.quit();
  }

  // disable all "local" shortcuts
  const menu = Menu.buildFromTemplate([])
  Menu.setApplicationMenu(menu)

  // for development, add opt+cmt+i, cmd+r, cmd+q as "global" shortcut
  // never reload, because reloading causes serious child_process issues
  globalShortcut.register('CmdOrCtrl+r', quitApp);
  globalShortcut.register('CmdOrCtrl+q', quitApp);

  if (env.NODE_ENV === 'development') {
    globalShortcut.register('Alt+CmdOrCtrl+I', function () {
      win.webContents.openDevTools()
    });
    win.webContents.openDevTools()
  }

  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
})