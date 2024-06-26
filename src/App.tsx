import { useState } from 'react'
import UpdateElectron from '@/components/update'
import Onboarding from '@/components/onboarding'
import { Provider } from 'react-redux'
import '@mantine/core/styles.css';
import './App.css'
import { createTheme, MantineProvider } from '@mantine/core';
import store from './store/store'

const theme = createTheme({
  /** Put your mantine theme override here */
});

function App() {
    return (
        <Provider store={store}>
            <MantineProvider theme={theme}>
                <Onboarding/>
                {/* <UpdateElectron /> */}
            </MantineProvider>
        </Provider>
    )
}

export default App
