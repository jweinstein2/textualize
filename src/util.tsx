import { notifications } from "@mantine/notifications";

export function showError(title: string, message: string) {
    notifications.show({
        color: "red",
        title,
        message,
    });
}

export function groupName(members: string[], name: string) {
    if (name != null && name.length != 0) return name;
    return members.join(", ");
}
