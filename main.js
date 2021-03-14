const { app, BrowserWindow } = require('electron')

const path = require("path")

//if (process.env.NODE_ENV == 'development') {
//  require('electron-reloader')(module)
//}

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
//      preload: path.join(app.getAppPath(), 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})