import { Button, Center, Text, Timeline } from "@mantine/core";
import {
    IconDeviceImac,
    IconDeviceMobile,
    IconShieldLock,
    IconTerminal2,
    IconTopologyStar3,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import "./splash.css";

function Splash() {
    const navigate = useNavigate();

    return (
        <Center>
            <div className="container">
                <div className="page-left">
                    <h1>Textualize</h1>
                    <Text size="sm">Select a data source to get started</Text>
                    <div className="button-container">
                        <Button variant="white" onClick={() => navigate("mac")}>
                            <IconDeviceImac />
                            Mac Messages
                        </Button>
                        <Button
                            variant="white"
                            onClick={() => navigate("backup")}
                        >
                            <IconDeviceMobile />
                            iPhone Backup
                        </Button>
                    </div>
                </div>
                <div className="page-right">
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

                        <Timeline.Item
                            title="Powered by AI"
                            bullet={<IconTopologyStar3 size={12} />}
                        >
                            <Text c="dimmed" size="sm">
                                We have integrated the latest LLM technology so
                                that you can query your data with the power of
                                AI. All processing is done locally to guarantee
                                your data is secure
                            </Text>
                        </Timeline.Item>
                    </Timeline>
                </div>
            </div>
        </Center>
    );
}

export default Splash;
