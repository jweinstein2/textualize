import { showError } from "@/util";
import { IconArrowLeft } from "@tabler/icons-react";
import {
    Button,
    Center,
    Group,
    Loader,
    Radio,
    Stack,
    Text,
    Timeline,
} from "@mantine/core";
import {
    IconShieldLock,
    IconTerminal2,
    IconTopologyStar3,
} from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./backup.css";

export type Backup = {
    path: string;
    name: string;
    size: number; // TODO: not populated
    lastMessage: Date; // TODO: Not populated
};

function Onboarding() {
    const [backupPath, setBackupPath] = useState<string | undefined>(undefined);
    const [backupOptions, setBackupOptions] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    function listBackups() {
        setLoading(true);
        window.ipcRenderer
            .invoke("listBackups")
            .then((backups) => {
                setBackupOptions(backups);
                setLoading(false);
            })
            .catch((error) => {
                if (
                    error.toString().includes("EPERM: operation not permitted")
                ) {
                    showError(
                        "Unexpected error loading backups",
                        "Fix by enabling full disk access in settings",
                    );
                } else {
                    showError("Unexpected error loading backups", "");
                }
            });
    }

    useEffect(listBackups, []);

    function analyze() {
        if (!backupPath) {
            showError("Invalid backup", "Select a backup source and try again");
        }

        const type = "backup";
        axios
            .post("http://127.0.0.1:4242/process", { type, source: backupPath })
            .catch(() =>
                showError("Fatal Error", "Unable to begin processing data"),
            );
        navigate("/onboarding/loading");
    }

    function renderBackupCards() {
        return backupOptions.map((backup) => (
            <Radio.Card
                className="onboardingCard"
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

    function renderBackupOptions() {
        if (backupOptions.length === 0) {
            return (
                <>
                    <Text color="red">
                        No existing backups found.
                        <br />
                        <br />
                    </Text>

                    <Timeline bulletSize={24} lineWidth={2}>
                        <Timeline.Item
                            bullet={<IconShieldLock size={12} />}
                            title="Connect iOS Device"
                        >
                            <Text c="dimmed" size="sm">
                                Connect an iOS device to your computer using a
                                lighting cable.
                            </Text>
                        </Timeline.Item>

                        <Timeline.Item
                            bullet={<IconTerminal2 size={12} />}
                            title="Create an unencrypted backup"
                        >
                            <Text c="dimmed" size="sm">
                                Select your device in the left most menu in the
                                finder. Select &ldquo;Create an unencrypted
                                backup&rdquo;.
                            </Text>
                        </Timeline.Item>

                        <Timeline.Item
                            title="Refresh"
                            bullet={<IconTopologyStar3 size={12} />}
                        >
                            <Text c="dimmed" size="sm">
                                Once the backup has completed, refresh this page
                                and select the desired backup version.
                            </Text>
                        </Timeline.Item>
                    </Timeline>

                    <Button className="onboardingNext" onClick={listBackups}>
                        Refresh
                    </Button>
                </>
            );
        }

        return (
            <>
                <Radio.Group
                    value={backupPath}
                    onChange={setBackupPath}
                    label="What backup would you like to use?"
                >
                    <Stack pt="md" gap="xs">
                        {renderBackupCards()}
                    </Stack>
                </Radio.Group>
                <Button
                    disabled={backupPath == null}
                    className="onboardingNext"
                    onClick={analyze}
                >
                    Analyze!
                </Button>
            </>
        );
    }

    return (
        <div className="onboardingContainer">
            <div className="onboardingContents">
                <Button
                    onClick={() => navigate(-1)}
                    variant="light"
                >
                    <IconArrowLeft />
                </Button>
                <h2>Load data from an iPhone Backup</h2>
                {loading ? (
                    <Center>
                        <Loader color="blue" />
                    </Center>
                ) : (
                    renderBackupOptions()
                )}
            </div>
        </div>
    );
}

export default Onboarding;
