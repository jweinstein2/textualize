import { notifications } from "@mantine/notifications";

export function showError(title: string, message: string) {
    notifications.show({
        color: "red",
        title,
        message,
    });
}

export function idPath(id: string) {
    if (Number(id) < 100000 && Number(id) > 0) {
        return `/groups/${id}`;
    } else {
        return `/contacts/${id}`;
    }
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
            return timerFormat(value);
            break;
    }
}

// From ChatGPT
function timerFormat(seconds: number): string {
    if (seconds < 60) {
        if (seconds < 1) return "Instant ⚡️";
        const s = Math.floor(seconds);
        return `${s} second${s === 1 ? "" : "s"}`;
    }

    const minutes = Math.floor(seconds / 60);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const remainingMinutes = minutes % 60;

    const result = [];
    if (days > 0) result.push(`${days}d`);
    if (hours > 0) result.push(`${hours}h`);
    if (remainingMinutes > 0) result.push(`${remainingMinutes}m`);

    return result.length > 0 ? result.join(" ") : "0m";
}

function humanFormat(num: number): string {
    let magnitude = 0;
    while (Math.abs(num) >= 1000) {
        magnitude += 1;
        num /= 1000.0;
    }
    return `${Math.floor(num)}${["", "K", "M", "B"][magnitude]}`;
}
