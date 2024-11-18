import { Text, Button, Progress, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ProgressInfo } from "electron-updater";
import { useCallback, useEffect, useState } from "react";

import classes from "./modal.module.css";

function UpdateModal() {
    const [opened, { open, close }] = useDisclosure(false);
    const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>();
    const [error, setError] = useState<ErrorType>();
    const [versionInfo, setVersionInfo] = useState<VersionInfo>();

    const onUpdateAvailable = useCallback(
        (_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
            setVersionInfo(arg1);
            setError(undefined);
            open();
        },
        []
    );

    const onUpdateError = useCallback(
        (_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
            setError(arg1);
        },
        []
    );

    const onDownloadProgress = useCallback(
        (_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
            setProgressInfo(arg1);
        },
        []
    );

    const onUpdateDownloaded = useCallback(
        // eslint-disable-next-line
        (_event: Electron.IpcRendererEvent, ...args: any[]) => {
            setProgressInfo({ percent: 100 });
        },
        []
    );

    function installUpdate() {
        window.ipcRenderer.invoke("start-download");
    }


    function quitAndInstall() {
        window.ipcRenderer.invoke("quit-and-install");
    }

    useEffect(() => {
        // Get version information and whether to update
        window.ipcRenderer.on("update-available", onUpdateAvailable);
        window.ipcRenderer.on("update-error", onUpdateError);
        window.ipcRenderer.on("download-progress", onDownloadProgress);
        window.ipcRenderer.on("update-downloaded", onUpdateDownloaded);

        return () => {
            window.ipcRenderer.off("update-available", onUpdateAvailable);
            window.ipcRenderer.off("update-error", onUpdateError);
            window.ipcRenderer.off("download-progress", onDownloadProgress);
            window.ipcRenderer.off("update-downloaded", onUpdateDownloaded);
        };
    }, []);

    if (!opened) {
        return <></>;
    }

    function modalContents() {
        if (error) {
            return (
                <>
                    <Text size="xs" c="dimmed" className={classes.error}>{error.message}</Text>
                    <div className={classes.buttonContainer}>
                        <Button onClick={close}>Dismiss</Button>
                    </div>
                </>
            );
        }

        if (progressInfo?.percent === 100) {
            return (<>
                <Progress value={progressInfo?.percent} />
                <div className={classes.buttonContainer}>
                    <Button onClick={quitAndInstall}>Restart</Button>
                </div>
            </>);
        }

        if (progressInfo?.percent != null) {
            return (
                <>
                    <Progress value={progressInfo?.percent} />
                    <div className={classes.buttonContainer}>
                        <Button disabled onClick={close} variant="light">Dismiss</Button>
                        <Button disabled onClick={installUpdate}> Install now</Button>
                    </div>
                </>
            )
        }

        return (
            <>
            <h3>Update Available</h3>
                {versionInfo && <div>
                    <Text>Current Version: v{versionInfo?.version}</Text>
                    <Text>Latest Version: v{versionInfo?.newVersion}</Text>
                </div>
                }
                <div className={classes.buttonContainer}>
                    <Button onClick={close} variant="light">Dismiss</Button>
                    <Button onClick={installUpdate}> Install now</Button>
                </div>
            </>)
    }

    return (
        <Modal
            className={classes.modal}
            opened
            withCloseButton={false}
            closeOnClickOutside={false}
            onClose={close}
            size="sm">
            {modalContents()}
        </Modal>
    );
}

export default UpdateModal;
