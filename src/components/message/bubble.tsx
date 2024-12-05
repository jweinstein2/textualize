import { Paper, Text } from "@mantine/core";

import classes from "./bubble.module.css";

export default function Bubble({ message = "", isSent = false, size = "md" }) {
    return (
        <Paper
            className={isSent ? classes.bubble_sent : classes.bubble_received}
            shadow="xs"
            p="xs"
        >
            <Text size={size}>{message}</Text>
        </Paper>
    );
}
