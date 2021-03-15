const { app, BrowserWindow, globalShortcut, Menu } = require('electron')

const path = require("path")
const { env } = require('process')

//if (process.env.NODE_ENV == 'development') {
//  require('electron-reloader')(module)
//}

// disable all "local" shortcuts
const menu = Menu.buildFromTemplate([])
Menu.setApplicationMenu(menu)

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'preload.js')
    }
  })

  let quit = function() {
    win.close();
    app.quit();
  }

  // add cmd+r, cmd+q, alt+cmd+i as "global" shortcut
  globalShortcut.register('CmdOrCtrl+r', quit);

  globalShortcut.register('CmdOrCtrl+q', quit);

  if (env.NODE_ENV === 'development') {
    globalShortcut.register('Alt+CommandOrControl+I', function () {
      win.webContents.openDevTools()
    });
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
  //if (BrowserWindow.getAllWindows().length === 0) {
  //  createWindow()
  //}
})