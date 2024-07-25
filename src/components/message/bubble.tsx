import { Paper } from "@mantine/core";

import classes from "./bubble.module.css";

export default function Bubble({ message = "", isSent = false }) {
    return (
        <Paper
            className={isSent ? classes.bubble_sent : classes.bubble_received}
            shadow="xs"
            p="xs"
        >
            {message}
        </Paper>
    );
}
