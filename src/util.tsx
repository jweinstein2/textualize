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
