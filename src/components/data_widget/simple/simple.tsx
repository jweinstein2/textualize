import { FormatType, format } from "@/util";
import { Center, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";

import classes from "./simple.module.css";

interface SimpleProps {
    data: {
        value: number;
        label?: string;
        message?: string;
    };
    format?: FormatType;
}

function Simple(props: SimpleProps) {
    const { ref, width, height } = useElementSize();

    const dataString =
        props.format != null
            ? format(props.data.value, props.format)
            : `${props.data.value}`;

    const style = {
        fontSize: `${Math.min(height, width) * 0.4}px`,
        lineHeight: `${Math.min(height, width) * 0.4}px`,
    };

    return (
        <Center ref={ref} h="100%">
            <div className={classes.container}>
                <Text style={style}>{dataString}</Text>
                <Text>{props.data.label}</Text>
            </div>
        </Center>
    );
}

export default Simple;
