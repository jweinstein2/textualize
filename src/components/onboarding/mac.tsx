import { showError } from "@/util";
import { Button, Group, Radio, Stack, Text } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./backup.css";

function Mac() {
    const navigate = useNavigate();

    const [backupPath, setBackupPath] = useState<string | undefined>(undefined);

    function analyze() {
        axios
            .post("http://127.0.0.1:4242/process", { type: "mac" })
            .catch(() =>
                showError("Fatal Error", "Unable to begin processing data"),
            );
        navigate("/loading");
    }

    return (
        <div className="onboardingContainer">
            <div className="onboardingContents">
                <h2>Load data from Messages</h2>

                <Radio.Group
                    value={backupPath}
                    onChange={setBackupPath}
                    label="What backup would you like to use?"
                >
                    <Stack pt="md" gap="xs">
                        <Radio.Card
                            className="onboardingCard"
                            radius="md"
                            value="messages"
                            key="messages"
                        >
                            <Group wrap="nowrap" align="flex-start">
                                <Radio.Indicator />
                                <div>
                                    <Text className="onboardingLabel">
                                        Messages Database
                                    </Text>
                                </div>
                            </Group>
                        </Radio.Card>
                    </Stack>
                </Radio.Group>
                <Button
                    disabled={backupPath == null}
                    className="onboardingNext"
                    onClick={analyze}
                >
                    Analyze!
                </Button>
            </div>
        </div>
    );
}

export default Mac;
