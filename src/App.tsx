import { useState } from 'react'
import UpdateElectron from '@/components/update'
import Onboarding from '@/components/onboarding'
import '@mantine/core/styles.css';
import './App.css'
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  /** Put your mantine theme override here */
});

function App() {
    return (
        <MantineProvider theme={theme}>
            <h1>Textualize</h1>
            <Onboarding/>

            <UpdateElectron />
        </MantineProvider>
    )
}

export default App
