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
    const [needsDiskAccess, setNeedsDiskAccess] = useState(false);
    const [backupOptions, setBackupOptions] = useState<Backup[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
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
    }, [needsDiskAccess]);

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

    if (needsDiskAccess) {
        return (
            <div>
                Make sure full disk access in enabled!
                <Button onClick={() => setNeedsDiskAccess(false)}>
                    Try again
                </Button>
            </div>
        );
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
