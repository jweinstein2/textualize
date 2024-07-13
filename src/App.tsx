import { useState } from 'react'
import UpdateElectron from '@/components/update'
import { Provider } from 'react-redux'
import '@mantine/core/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from '@mantine/core'
import store from './store/store'
import Shell from './components/shell/shell'
import { HashRouter } from 'react-router-dom'
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  /** Put your mantine theme override here */
});


function App() {
    return (
        <Provider store={store}>
            <MantineProvider theme={theme}>
                <HashRouter>
                    <Notifications/>
                    <Shell/>
                </HashRouter>
            </MantineProvider>
        </Provider>
    )
}

export default App
