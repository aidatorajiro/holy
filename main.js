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
  if (env.NODE_ENV === 'development') {
    // for development, add opt+cmt+i, cmd+r, cmd+q as "local" shortcut
    // never reload, because reloading causes serious child_process issues
    const menu = Menu.buildFromTemplate([
      {
        label: 'Electron',
        submenu: [{
          role: 'DevTool',
          accelerator: 'Alt+CommandOrControl+I',
          click: function () {
            win.webContents.openDevTools()
          }
        }, {
          role: 'Quit',
          accelerator: 'CommandOrControl+q',
          click: quitApp
        }, {
          role: 'Quit',
          accelerator: 'CommandOrControl+r',
          click: quitApp
        }]
      }
    ])
    Menu.setApplicationMenu(menu)
  } else {
    // for production, add cmd+r, cmd+q as "global" shortcut
    // never reload, because reloading causes serious child_process issues
    const menu = Menu.buildFromTemplate([])
    Menu.setApplicationMenu(menu)
    globalShortcut.register('CmdOrCtrl+r', quitApp);
    globalShortcut.register('CmdOrCtrl+q', quitApp);
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