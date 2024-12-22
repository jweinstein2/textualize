import { Button, Center, Text, Timeline } from "@mantine/core";
import {
    IconDeviceImac,
    IconDeviceMobile,
    IconShieldLock,
    IconTerminal2,
    IconTopologyStar3,
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
                <div className={styles.pageLeft}>
                    <h1>Textual Activity</h1>
                    <Text size="sm">Select a data source to get started</Text>
                    <div className={styles.buttonContainer}>
                        <Button
                            variant="white"
                            onClick={() => checkDiskAccessAndNavigate("mac")}
                        >
                            <IconDeviceImac />
                            Mac Messages
                        </Button>
                        <Button
                            variant="white"
                            onClick={() => checkDiskAccessAndNavigate("backup")}
                        >
                            <IconDeviceMobile />
                            iPhone
                        </Button>
                    </div>
                </div>
                <div className={styles.pageRight}>
                    <Timeline bulletSize={24} lineWidth={2}>
                        <Timeline.Item
                            bullet={<IconShieldLock size={12} />}
                            title="Privacy"
                        >
                            <Text c="dimmed" size="sm">
                                Your privacy always comes first. We understand
                                your text messages are extremely sensitive and
                                personal. That is why your data never leaves the
                                device without your permission. All processing
                                is done locally.
                            </Text>
                        </Timeline.Item>

                        <Timeline.Item
                            bullet={<IconTerminal2 size={12} />}
                            title="Open Source"
                        >
                            <Text c="dimmed" size="sm">
                                All the code is open source for transparency.
                                Take a look at the repository and leave a
                                comment, or a pull request!
                            </Text>
                        </Timeline.Item>
                    </Timeline>
                </div>
            </div>
        </Center>
    );
}

export default Splash;
