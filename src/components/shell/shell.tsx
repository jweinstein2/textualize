import { AppShell, Burger, Breadcrumbs } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './navbar';
import Group from '@/components/group/group'
import Settings from '@/components/settings/settings'
import Summary from '@/components/summary/summary'
import Wizard from '@/components/wizard/wizard'
import Onboarding from '@/components/onboarding'
import { Routes, Route } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function Shell() {
    const [opened, { toggle }] = useDisclosure();
    const [stage, setStage] = useState(0);

    const navigate = useNavigate();

     useEffect(() => {
         axios.get('http://127.0.0.1:5000/source')
             .then((response) => {
                 if (response.data.source == null) {
                     navigate('/onboarding')
                 }
             })
     }, []);

    return (
        <Routes>
            <Route path="/onboarding" element={<Onboarding/>} />
            <Route path="/*" element={
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

            } />

        </Routes>
    );
}

export default Shell
