import { BrowserWindow, app, ipcMain, shell } from "electron";
import isDev from "electron-is-dev";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Backup } from "src/components/onboarding/backup";

import { checkForUpdate, update } from "./update";

const require = createRequire(import.meta.url);
const plist = require("simple-plist");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fs = require("fs");
const url = require("url");
const { spawn, ChildProcess } = require("child_process");

/*************************************************************
 * py process
 *************************************************************/
const PY_DIST_FOLDER = "dist-python";
const PY_FOLDER = "backend";
const PY_MODULE = "api"; // without .py suffix
const PY_PORT = 4242;

let pyProc: typeof ChildProcess | undefined;

const getScriptPath = () => {
    if (isDev) {
        return path.join(__dirname, "../..", PY_FOLDER, PY_MODULE + ".py");
    }
    if (process.platform === "win32") {
        return path.join(
            __dirname,
            PY_DIST_FOLDER,
            PY_MODULE,
            PY_MODULE + ".exe"
        );
    }
    return path.join(
        process.resourcesPath,
        PY_DIST_FOLDER,
        PY_MODULE,
        PY_MODULE
    );
};

const createPyProc = () => {
    const script = getScriptPath();

    if (!isDev) {
        pyProc = spawn(script, [PY_PORT]);
    } else {
        const devPath = getScriptPath();
        pyProc = spawn("python3", ["-u", devPath]);
    }

    if (pyProc != null) {
        console.log("child process success on port " + PY_PORT);
        pyProc.stdout.on("data", (data: string) => {
            console.error(`[PY LOG]: ${data}`);
        });
        pyProc.stderr.on("data", (data: string) => {
            console.error(`[PY BACKEND]: ${data}`);
        });
        pyProc.on("close", (code: string) => {
            console.log(`child process exited with code ${code}`);
        });
    }
};

const exitPyProc = () => {
    if (pyProc != null) {
        pyProc.kill();
    }
    pyProc = undefined;
};

app.on("ready", createPyProc);
app.on("will-quit", exitPyProc);

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createWindow() {
    win = new BrowserWindow({
        title: "Main window",
        icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // nodeIntegration: true,

            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            // contextIsolation: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        // #298
        win.loadURL(VITE_DEV_SERVER_URL);
        // Open devTool if the app is not packaged
        //win.webContents.openDevTools()
    } else {
        win.loadFile(indexHtml);
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on("did-finish-load", () => {});

    win.webContents.on("did-fail-load", () => {
        win?.loadURL(
            url.format({
                pathname: path.join(__dirname, "dist/index.html"),
                protocol: "file:",
                slashes: true,
            })
        );
        // REDIRECT TO FIRST WEBPAGE AGAIN
    });

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("https:")) shell.openExternal(url);
        return { action: "deny" };
    });

    // Auto update
    update(win);
    checkForUpdate();
}

async function listBackups(): Promise<Backup[]> {
    const backup_path = "/Library/Application Support/MobileSync/Backup/";
    const home = app.getPath("home");
    const dirPath = path.resolve(home + backup_path);
    const backups = await fs.readdirSync(dirPath);
    const filtered = backups.filter((path: string) => path[0] !== ".");
    return filtered.map((name: string) => backupInfo(dirPath + "/" + name));
}

function backupInfo(fullPath: string): Backup {
    const plistPath = fullPath + "/" + "Info.plist";
    const data = plist.readFileSync(plistPath);
    const name = data["Display Name"];
    return {
        name,
        path: fullPath,
        size: 0, // TODO: Add details
    };
}

app.whenReady().then(() => {
    // Renderer > Main
    ipcMain.handle("listBackups", listBackups);
    createWindow();
});

app.on("window-all-closed", () => {
    win = null;
    app.quit();
});

app.on("second-instance", () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on("activate", () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
    } else {
        childWindow.loadFile(indexHtml, { hash: arg });
    }
});
