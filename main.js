const electron = require('electron')
const app = electron.app
const isDev = require('electron-is-dev')
const BrowserWindow = electron.BrowserWindow
const path = require('path')


/*************************************************************
 * py process
 *************************************************************/

const PY_DIST_FOLDER = 'dist'
const PY_FOLDER = 'backend'
const PY_MODULE = 'api' // without .py suffix
const PY_PORT = 4242

let pyProc = null
let pyPort = null

const getScriptPath = () => {
    if (isDev) {
        return path.join(__dirname, PY_FOLDER, PY_MODULE + '.py')
    }
    if (process.platform === 'win32') {
        return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE, PY_MODULE + '.exe')
    }
    return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE)
}

const selectPort = () => {
    return PY_PORT
}

const createPyProc = () => {
    let script = getScriptPath()
    let port = '' + selectPort()

    console.log('script:' + script)

    if (!isDev) {
        console.log('packaged')
        pyProc = require('child_process').execFile(script, [port], (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
            console.print(stdout);
            console.print(stderr);
        });
    } else {
        console.log('dev')
        pyProc = require('child_process').spawn('python', [script, port])
    }

    if (pyProc != null) {
        //console.log(pyProc)
        console.log('child process success on port ' + port)
    }
}

const exitPyProc = () => {
    pyProc.kill()
    pyProc = null
    pyPort = null
}

app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)


/*************************************************************
 * window management
 *************************************************************/

let mainWindow = null

const createWindow = () => {
    mainWindow = new BrowserWindow({width: 800, height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }})
    mainWindow.loadURL(require('url').format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})
