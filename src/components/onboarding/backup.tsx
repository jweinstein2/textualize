import { showError } from "@/util";
import { Button, Group, Radio, Stack, Text } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./backup.css";

export type Backup = {
    path: string;
    name: string;
    size: number; // TODO: This is not populated
};

function Onboarding() {
    const [backupPath, setBackupPath] = useState<string | undefined>(undefined);
    const [backupOptions, setBackupOptions] = useState<Backup[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        window.ipcRenderer
            .invoke("listBackups")
            .then(setBackupOptions)
            .catch((error) => {
                if (
                    error.toString().includes("EPERM: operation not permitted")
                ) {
                    showError(
                        "Unexpected error loading backups",
                        "Fix by enabling full disk access in settings"
                    );
                } else {
                    showError("Unexpected error loading backups", "");
                }
            });
    }, []);

    function analyze() {
        if (!backupPath) {
            showError("Invalid backup", "Select a backup source and try again");
        }

        const type = "backup";
        axios
            .post("http://127.0.0.1:4242/process", { type, source: backupPath })
            .catch(() =>
                showError("Fatal Error", "Unable to begin processing data")
            );
        navigate("/loading");
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
                    className="next"
                    onClick={analyze}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export default Onboarding;
