import { AppShell, Burger, Breadcrumbs } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './navbar';
import Group from '@/components/group/group'
import Settings from '@/components/settings/settings'
import Summary from '@/components/summary/summary'
import Wizard from '@/components/wizard/wizard'
import { Routes, Route } from "react-router-dom";
import axios from 'axios';

function Shell() {
    const [opened, { toggle }] = useDisclosure();
    const [stage, setStage] = useState(0);

     useEffect(() => {
         axios.get('http://127.0.0.1:5000/state')
             .then((response) => {
                 setStage(response.data.state);
             })
             .catch((error) => {console.log('error', error)})
             .finally(function () {
                 console.log('completed');
             });
     }, []);

    return (
        <AppShell
            navbar={{width: 300,
                    breakpoint: 'sm',
                    collapsed: { mobile: !opened } }}
            padding="md" >


            <AppShell.Navbar>
                <Navbar/>
            </AppShell.Navbar>

            <AppShell.Main>
                <Routes>
                    <Route path="/" element={<Summary />} />
                    <Route path="/summary" element={<Summary />} />
                    <Route path="/contacts" element={<h2>Contacts</h2>} />
                    <Route path="/groups" element={<Group />} />
                    <Route path="/ai" element={<Wizard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<p>404</p>} />
                </Routes>
            </AppShell.Main>
        </AppShell>
    );
}

export default Shell
