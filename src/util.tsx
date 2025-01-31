import { notifications } from "@mantine/notifications";

export function showError(title: string, message: string) {
    notifications.show({
        color: "red",
        title,
        message,
    });
}

export function groupName(members?: string[], name?: string) {
    if (name != null && name.length != 0) return name;
    return (members ?? []).join(", ");
}

export function prettyDate(date: Date): string {
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function minMax(values: number[]): [number, number] {
    const max = Math.max(...values);
    const min = Math.min(...values);
    return [min, max];
}

/* Make sure these match python definition */
export enum FormatType {
    MessageCount = "message_count",
    ResponseTime = "response_time",
}

// Theres a better way to do this, but I got stuck.
// https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript
export function toFormatEnum(value: string): FormatType | undefined {
    if (value === "message_count") return FormatType.MessageCount;
    if (value === "response_time") return FormatType.ResponseTime;
    return undefined;
}

export function format(value: number, type: FormatType): string {
    switch (type) {
        case FormatType.MessageCount:
            return humanFormat(value);
            break;
        case FormatType.ResponseTime:
            return `${value}`;
            break;
    }
}

function humanFormat(num: number): string {
    let magnitude = 0;
    while (Math.abs(num) >= 1000) {
        magnitude += 1;
        num /= 1000.0;
    }
    return `${Math.floor(num)}${["", "K", "M", "B"][magnitude]}`;
}
