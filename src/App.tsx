import "@mantine/charts/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import React from "react";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";

import Shell from "./components/shell/shell";
import store from "./store/store";

const theme = createTheme({
    /** Put your mantine theme override here */
});

function App() {
    return (
        <Provider store={store}>
            <MantineProvider theme={theme}>
                <HashRouter>
                    <Notifications />
                    <Shell />
                </HashRouter>
            </MantineProvider>
        </Provider>
    );
}

export default App;
