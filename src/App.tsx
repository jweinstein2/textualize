import { useState } from 'react'
import UpdateElectron from '@/components/update'
import { Provider } from 'react-redux'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from '@mantine/core'
import store from './store/store'
import Shell from './components/shell/shell'
import { BrowserRouter } from 'react-router-dom'
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  /** Put your mantine theme override here */
});


function App() {
    return (
        <Provider store={store}>
            <MantineProvider theme={theme}>
                <BrowserRouter>
                    <Notifications/>
                    <Shell/>
                </BrowserRouter>
            </MantineProvider>
        </Provider>
    )
}

export default App
