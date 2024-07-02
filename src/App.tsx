import { useState } from 'react'
import UpdateElectron from '@/components/update'
import { Provider } from 'react-redux'
import '@mantine/core/styles.css'
import { createTheme, MantineProvider } from '@mantine/core'
import store from './store/store'
import Root from './Root'


const theme = createTheme({
  /** Put your mantine theme override here */
});


function App() {
    return (
        <Provider store={store}>
            <MantineProvider theme={theme}>
                <Root/>
            </MantineProvider>
        </Provider>
    )
}

export default App
