import demo from "@/assets/first.mov";
import { AspectRatio, Button, Container, List, Text } from "@mantine/core";

import styles from "./diskAccess.module.css";

function DiskAccess() {
    function openSystemPreferences() {
        window.ipcRenderer.invoke("openSystemPreferences");
    }

    return (
        <div className={styles.container}>
            <Container className={styles.left}>
                <h2>Enable Disk Access</h2>
                <Text className="description">
                    Textual Activity reads your message data from a backup
                    stored on your computer. We need permission to access this
                    data. <br />
                    <br />
                </Text>
                <List>
                    <List.Item>Open System Preferences</List.Item>
                    <List.Item>
                        Under Full Disk Access, grant Textual Activity access.{" "}
                    </List.Item>
                    <List.Item>Quit and restart the app.</List.Item>
                </List>
                <Button
                    className={styles.openPreferencesButton}
                    onClick={openSystemPreferences}
                >
                    Open System Preferences
                </Button>
            </Container>
            <AspectRatio ratio={1434 / 944} className={styles.right}>
                <video src={demo} loop preload="auto" autoPlay playsInline />
            </AspectRatio>
        </div>
    );
}

export default DiskAccess;
