import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { ShareModalProvider } from '@/components/share/ShareModalContext';

import "@mantine/carousel/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import Routes from "./components/routes";
import UpdateModal from "./components/update/modal";
import { PostHogProvider} from 'posthog-js/react'

const theme = createTheme({
    /** Put your mantine theme override here */
});

const options = {
  api_host: window.envVars.posthogHost,
  capture_pageview: false, // Handled manually in routes.tsx
  autocapture: !window.envVars.isDev,
}


function App() {
    const [init, setInit] = useState(false);

    // This should be run only once per application lifetime
    useEffect(() => {
        if (init) return;
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    return (
        <PostHogProvider apiKey={window.envVars.posthogAPIKey}
              options={options}>
            <MantineProvider theme={theme} defaultColorScheme="dark">
                <HashRouter>
                    <ShareModalProvider>
                        <UpdateModal />
                        <Notifications />
                        {init ? <Routes /> : <></>}
                    </ShareModalProvider>
                </HashRouter>
            </MantineProvider>
        </PostHogProvider>
    );
}

export default App;
