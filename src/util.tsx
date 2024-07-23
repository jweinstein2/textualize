import { notifications } from "@mantine/notifications";

export function showError(title: string, message: string) {
    notifications.show({
        color: "red",
        title,
        message,
    });
}
