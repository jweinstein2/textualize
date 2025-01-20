import { Progress } from "@mantine/core";
import { Button, Center } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./loading.css";

const STATIC_MESSAGES = [
    "Processing messages locally for your privacy. Your data never leaves your device.",
    "Checking how many times you've been left on read...",
    "Figuring out who has been ghosting the group chat...",
    "Crunching the numbers on why your ex isn't texting back...",
];

const UPDATE_INTERVAL_MS = 500;
const MESSAGE_INTERVAL_MS = 5000;

// TODO: Method for generating messages is hacky and could use some cleanup.
function Loading() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [allMessages, setAllMessages] = useState(STATIC_MESSAGES);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(undefined);

    const navigate = useNavigate();

    useEffect(checkProcess, []);
    useEffect(fetchQuickStats, [progress]);
    useEffect(updateMessage, [messageIndex]);

    function updateMessage() {
        const newIndex = (messageIndex + 1) % allMessages.length;
        setTimeout(() => setMessageIndex(newIndex), MESSAGE_INTERVAL_MS);
    }

    function fetchQuickStats() {
        // Hacky check if we've finished processing dbs but haven't called quick stats yet.
        if (progress < 5 || allMessages.length !== STATIC_MESSAGES.length) {
            return;
        }
        axios
            .get("http://127.0.0.1:4242/quick_stats")
            .then((response) => {
                const additionalMessages = response.data;
                const newMessages = STATIC_MESSAGES.concat(additionalMessages);
                setAllMessages(newMessages);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function checkProcess() {
        axios.get("http://127.0.0.1:4242/process").then((response) => {
            if (response.data.error) {
                setError(response.data.error);
                return;
            }
            const status = response.data.status;
            const percent = response.data.percent;
            if (status === "in_progress") {
                setProgress(percent);
                setTimeout(() => checkProcess(), UPDATE_INTERVAL_MS);
            } else {
                setProgress(percent);
            }
        });
    }

    if (error) {
        return (
            <Center>
                <p>Processing Failed</p>
                <p>{error}</p>
            </Center>
        );
    }

    if (progress === 100) {
        return (
            <div className="wrapper">
                <div className="body">
                    <Center>
                        <Button onClick={() => navigate("/")}>EXPLORE</Button>
                    </Center>
            </div>
        </div>
        );
    }

    return (
        <div className="wrapper">
            <div className="body">
                <Progress value={progress} />
                <Center>
                    <p>{allMessages[messageIndex]}</p>
                </Center>
            </div>
        </div>
    );
}

export default Loading;
