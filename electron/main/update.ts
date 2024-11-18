import { app, ipcMain } from "electron";
import type {
    ProgressInfo,
    UpdateDownloadedEvent,
    UpdateInfo,
} from "electron-updater";
import { createRequire } from "node:module";

const { autoUpdater } = createRequire(import.meta.url)("electron-updater");

export function update(win: Electron.BrowserWindow) {
    // When set to false, the update download will be triggered through the API
    autoUpdater.autoDownload = false;
    autoUpdater.disableWebInstaller = false;
    autoUpdater.allowDowngrade = false;

    // start check
    autoUpdater.on("checking-for-update", function () {});

    // update available
    autoUpdater.on("update-available", (arg: UpdateInfo) => {
        win.webContents.send("update-available", {
            update: true,
            version: app.getVersion(),
            newVersion: arg?.version,
        });
    });

    // update not available
    // eslint-disable-next-line
    autoUpdater.on("update-not-available", (arg: UpdateInfo) => {
        // TODO
    });

    // Start downloading and feedback on progress
    ipcMain.handle("start-download", (event: Electron.IpcMainInvokeEvent) => {
        startDownload(
            (error, progressInfo) => {
                if (error) {
                    // feedback download error message
                    event.sender.send("update-error", {
                        message: error.message,
                        error,
                    });
                } else {
                    // feedback update progress message
                    event.sender.send("download-progress", progressInfo);
                }
            },
            () => {
                // feedback update downloaded message
                event.sender.send("update-downloaded");
            }
        );
    });

    // Install now
    ipcMain.handle("quit-and-install", () => {
        autoUpdater.quitAndInstall(false, true);
    });

    ipcMain.handle("get-version", app.getVersion);
}

export function checkForUpdate() {
        if (!app.isPackaged) {
            console.warn("Skipping update check for dev build");
        }

        try {
            autoUpdater.checkForUpdatesAndNotify();
        } catch (error) {
            console.error(error);
        }
}

function startDownload(
    callback: (error: Error | null, info: ProgressInfo | null) => void,
    complete: (event: UpdateDownloadedEvent) => void
) {
    autoUpdater.on("download-progress", (info: ProgressInfo) =>
        callback(null, info)
    );
    autoUpdater.on("error", (error: Error) => callback(error, null));
    autoUpdater.on("update-downloaded", complete);
    autoUpdater.downloadUpdate();
}
