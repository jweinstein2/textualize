import { showError } from "@/util";
import { Stepper } from "@mantine/core";
import { Button, Group, Radio, Stack, Text } from "@mantine/core";
import {
    IconMailOpened,
    IconShieldCheck,
    IconUserCheck,
} from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./onboarding.css";

export type Backup = {
    path: string;
    name: string;
    size: number; // TODO: This is not populated
};

function Onboarding() {
    const [activeStep, setActiveStep] = useState(0);
    const [source, setSource] = useState<string | undefined>(undefined);
    const [backupPath, setBackupPath] = useState<string | undefined>(undefined);
    const [needsDiskAccess, setNeedsDiskAccess] = useState(false);
    const [backupOptions, setBackupOptions] = useState<Backup[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (source == null) {
            return;
        }
        window.ipcRenderer
            .invoke("listBackups")
            .then(setBackupOptions)
            .catch((error) => {
                // TODO: Better way to check EPERM errors
                if (
                    error.toString().includes("EPERM: operation not permitted")
                ) {
                    setNeedsDiskAccess(true);
                } else {
                    showError("Unexpected error loading backups", "Try again");
                }
            });
    }, [source, needsDiskAccess]);

    function nextStep() {
        setActiveStep((current) => (current < 3 ? current + 1 : current));
    }

    function analyze() {
        if (!backupPath) {
            showError("Invalid backup", "Select a backup source and try again");
        }
        axios
            .post("http://127.0.0.1:4242/source", { source: backupPath })
            .then(() => navigate("/loading"))
            .catch(() =>
                showError(
                    "Invalid data source",
                    "Select another backup and try again"
                )
            );
    }

    const data = [
        {
            name: "iPhone Backup ⭐️",
            description: "Messages stored on your iPhone",
            disabled: false,
        },
        {
            name: "Mac Messages",
            description: "Messages stored on your computer",
            disabled: false,
        },
        { name: "WhatsApp", description: "coming soon...", disabled: true },
        { name: "Messenger", description: "coming soon...", disabled: true },
    ];

    function renderSourceCards() {
        return data.map((item) => (
            <Radio.Card
                className="card"
                radius="md"
                value={item.name}
                key={item.name}
            >
                <Group wrap="nowrap" align="flex-start">
                    <Radio.Indicator />
                    <div>
                        <Text className="label">{item.name}</Text>
                        <Text className="description">{item.description}</Text>
                    </div>
                </Group>
            </Radio.Card>
        ));
    }

    function renderBackupCards() {
        return backupOptions.map((backup) => (
            <Radio.Card
                className="card"
                radius="md"
                value={backup.path}
                key={backup.path}
            >
                <Group wrap="nowrap" align="flex-start">
                    <Radio.Indicator />
                    <div>
                        <Text className="label">{backup.name}</Text>
                    </div>
                </Group>
            </Radio.Card>
        ));
    }

    return (
        <div className="wrapper">
            <div className="body">
                <Stepper
                    active={activeStep}
                    onStepClick={setActiveStep}
                    allowNextStepsSelect={false}
                >
                    <Stepper.Step icon={<IconUserCheck />}>
                        <Radio.Group
                            value={source}
                            onChange={setSource}
                            label="Pick a message data source"
                            description="What messages do you want to analyze?"
                        >
                            <Stack pt="md" gap="xs">
                                {renderSourceCards()}
                            </Stack>
                        </Radio.Group>
                        <Button
                            disabled={source == null}
                            className="next"
                            onClick={nextStep}
                        >
                            Next
                        </Button>
                    </Stepper.Step>
                    <Stepper.Step icon={<IconMailOpened />}>
                        Create an unencrypted iPhone backup This is required to
                        parse message data on your Mac.
                        <Button className="next" onClick={nextStep}>
                            Next
                        </Button>
                    </Stepper.Step>
                    <Stepper.Step icon={<IconMailOpened />}>
                        {needsDiskAccess ? (
                            <div>
                                Make sure full disk access in enabled!
                                <Button
                                    onClick={() => setNeedsDiskAccess(false)}
                                >
                                    Try again
                                </Button>
                            </div>
                        ) : (
                            <Radio.Group
                                value={backupPath}
                                onChange={setBackupPath}
                                label="What backup would you like to use?"
                            >
                                <Stack pt="md" gap="xs">
                                    {renderBackupCards()}
                                </Stack>
                            </Radio.Group>
                        )}
                        <Button
                            disabled={backupPath == null}
                            className="next"
                            onClick={nextStep}
                        >
                            Next
                        </Button>
                    </Stepper.Step>
                    <Stepper.Step icon={<IconShieldCheck />}>
                        We understand your data is important and private.
                        That&apos;s why your messages never leave your device.{" "}
                        <Button className="analyze" onClick={analyze}>
                            Analyze
                        </Button>{" "}
                    </Stepper.Step>
                </Stepper>
            </div>
        </div>
    );
}

export default Onboarding;
