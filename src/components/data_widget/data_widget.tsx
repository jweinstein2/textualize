import { Paper, Text } from "@mantine/core";
import React, { ReactNode } from "react";

interface DataWidgetProps {
    title: string;
    children?: ReactNode;
}

function DataWidget(props: DataWidgetProps) {
    return (
        <Paper shadow="md" style={{ padding: 8 }}>
            <Text>{props.title}</Text>
            {props.children}
        </Paper>
    );
}

export default DataWidget;
