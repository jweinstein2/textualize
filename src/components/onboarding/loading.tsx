import { showError } from "@/util";
import { Progress } from "@mantine/core";
import { Button, Center } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./loading.css";

const STATIC_MESSAGES = [
    "Built with your privacy in mind: your messages never leave your device",
    "The average person sends half a million messages each year",
    "Who have you forgotten to text back?",
];

// Please excuse this terrible code.
// TODO: switch to redux approach or dedup checkProcess calls
function Loading() {
    const [message] = useState(STATIC_MESSAGES[0]);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(undefined);

    const navigate = useNavigate();

    function startProcessing() {
        axios
            .post("http://127.0.0.1:4242/process")
            .then(() => setTimeout(() => checkProcess(), 500))
            .catch(() =>
                showError("Fatal Error", "Unable to begin processing data"),
            );
    }

    function checkProcess() {
        axios.get("http://127.0.0.1:4242/process").then((response) => {
            if (response.data.error) {
                setError(response.data.error);
                return;
            }
            const status = response.data.status;
            const percent = response.data.percent;
            if (status === "unstarted") {
                startProcessing();
            } else if (status === "in_progress") {
                setProgress(percent);
                setTimeout(() => checkProcess(), 500);
            } else {
                setProgress(percent);
            }
        });
    }

    useEffect(checkProcess);

    if (error) {
        return (
            <Center>
                <p>Processing Failed</p>
                <Button>Try Again</Button>
            </Center>
        );
    }

    if (progress === 100) {
        return (
            <Center>
                <Button onClick={() => navigate("/")}>EXPLORE</Button>
            </Center>
        );
    }

    return (
        <div className="wrapper">
            <div className="body">
                <Progress value={progress} />
                <Center>
                    <p>{message}</p>
                </Center>
            </div>
        </div>
    );
}

export default Loading;
