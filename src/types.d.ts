export {};

declare global {
    interface Window {
        envVars: {
            posthogAPIKey: string;
            posthogHost: string;
            isDev: boolean;
        };
    }
}
