import { AppShell, Burger, Breadcrumbs } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './navbar';
import Group from '@/components/group/group'
import Settings from '@/components/settings/settings'
import Summary from '@/components/summary/summary'
import Wizard from '@/components/wizard/wizard'
import { HashRouter, Routes, Route } from "react-router-dom";

function Shell() {
    const [opened, { toggle }] = useDisclosure();

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
                <Breadcrumbs children='replace > this > component'></Breadcrumbs>
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
