import { Grid, Paper, Text } from "@mantine/core";
import React, { ReactNode } from "react";

import classes from "./card.module.css";

interface CardProps {
    title: string;
    span: number;
    children?: ReactNode;
    height?: number;
}

function Card(props: CardProps) {
    return (
        <Grid.Col span={props.span}>
            <Paper
                shadow="md"
                style={{ padding: 8, height: props.height ?? 320 }}
                className={classes.container}
            >
                <div>
                    <Text>{props.title}</Text>
                </div>
                <div className={classes.child}>{props.children}</div>
            </Paper>
        </Grid.Col>
    );
}

export default Card;
