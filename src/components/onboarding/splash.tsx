import { Button, Center, Text} from "@mantine/core";
import {
    IconDeviceImac,
    IconDeviceMobile,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import styles from "./splash.module.css";

function Splash() {
    const navigate = useNavigate();

    function checkDiskAccessAndNavigate(navigationPath: string) {
        window.ipcRenderer.invoke("hasDiskAccess").then((isEnabled) => {
            if (isEnabled) {
                navigate(navigationPath);
            } else {
                navigate("/disk_access");
            }
        });
    }

    return (
            <Center>
                <div className={styles.container}>
                <h1>Textual Activity</h1>
                <Text size="sm">Select a data source to get started</Text>
                <div className={styles.buttonContainer}>
                    <Button
                        onClick={() => checkDiskAccessAndNavigate("mac")}
                    >
                            <IconDeviceImac className={styles.icon}/>
                            Mac Messages
                    </Button>
                    <Button
                        onClick={() => checkDiskAccessAndNavigate("backup")}
                    >
                            <IconDeviceMobile className={styles.icon}/>
                            iPhone
                    </Button>
                </div>
                </div>
                <Text c="dimmed" size="sm" className={styles.warning}>
                    We understand the importance of ensuring your data remains private. All data is processed locally on your device and our code is completely open source. Take a look and leave 
                    a pull request.
                </Text>
            </Center>
    );
}

export default Splash;
