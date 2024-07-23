import { Text, Paper } from '@mantine/core';
import classes from './bubble.module.css';

interface BubbleProps {
    message: string;
    isSent: boolean;
}

const defaultProps: BubbleProps = {
    message: "",
    isSent: false,
}

export default function Bubble(props: BubbleProps = defaultProps) {
    return (
        <Paper className={props.isSent ? classes.bubble_sent : classes.bubble_received}
               shadow="xs" p="xs">
            {props.message}
        </Paper>
    )
}
