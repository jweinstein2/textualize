const electron = require('electron')
const app = electron.app
const isDev = require('electron-is-dev')
const BrowserWindow = electron.BrowserWindow
const { dialog } = electron

const path = require('path')
const url = require('url')

/*************************************************************
 * py process
 *************************************************************/
const PY_DIST_FOLDER = 'api'
const PY_FOLDER = 'backend'
const PY_MODULE = 'api' // without .py suffix
const PY_PORT = 4242

let pyProc = null
let pyPort = null

const getScriptPath = () => {
    if (isDev) {
        return path.join(__dirname, '..', PY_FOLDER, PY_MODULE + '.py')
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

/************************************************************
ZeroRPC
************************************************************/
//window.zerorpcClient.connect("tcp://127.0.0.1:4242")
//
//window.zerorpcClient.invoke("echo", "server ready", (error, res) => {
//  if(error || res !== 'server ready') {
//    console.error(error)
//  } else {
//    console.log("server is ready")
//  }
//})
/************************************************************
 window management
************************************************************/
let mainWindow
const { ipcMain } = electron
ipcMain.on('async-file-select', (event, arg) => {
    console.log(arg) // prints "ping"

    dialog.showOpenDialog(mainWindow, {
        buttonLabel: "Select",
        properties: ['openFile', 'openDirectory']
    }).then(result => {
        console.log(result.canceled)
        console.log(result.filePaths)
        event.reply('async-file-reply', result)
    }).catch(err => {
        console.log(err)
        event.reply('async-file-reply', err)
    })
})

//ipcMain.on('async-server-call', (event, arg) => {
//    console.log(arg)
//
//    window.zerorpcClient.invoke("calc", formula.value, (error, res) => {
//        if(error) {
//            console.error(error)
//        } else {
//            result.textContent = res
//        }
//    })
//})

function createWindow() {
    mainWindow = new BrowserWindow({
        show: false,
        title: "Textualize",
        webPreferences: {
            nodeIntegration: true, // SECURITY RISK: used to access ipcRenderer
            preload: path.join(__dirname, 'preload.js')
        },
    })
    mainWindow.maximize()
    mainWindow.show()

    mainWindow.loadURL(
        process.env.ELECTRON_START_URL ||
        url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        })
    )

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
