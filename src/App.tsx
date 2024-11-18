import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";

import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import Shell from "./components/shell/shell";
import UpdateModal from "./components/update/modal";
import store from "./store/store";

const theme = createTheme({
    /** Put your mantine theme override here */
});

function App() {
    return (
        <Provider store={store}>
            <MantineProvider theme={theme}>
                <HashRouter>
                    <UpdateModal />
                    <Notifications />
                    <Shell />
                </HashRouter>
            </MantineProvider>
        </Provider>
    );
}

export default App;
