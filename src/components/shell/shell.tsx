import { AppShell, Burger, Breadcrumbs } from '@mantine/core';
import { useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './navbar';
import GroupList from '@/components/group_list/group_list'
import Group from '@/components/group/group'
import ContactList from '@/components/contact_list/contact_list'
import Contact from '@/components/contact/contact'
import Settings from '@/components/settings/settings'
import Summary from '@/components/summary/summary'
import Wizard from '@/components/wizard/wizard'
import Onboarding from '@/components/onboarding'
import Loading from '@/components/onboarding/loading'
import { Routes, Route } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { showError } from '@/util'

function Shell() {
    const [opened, { toggle }] = useDisclosure();

    const navigate = useNavigate();

     useEffect(() => {
         axios.get('http://127.0.0.1:5000/source')
             .then((response) => {
                 if (response.data.source == null) {
                     navigate('/onboarding')
                 } else {
                     checkProcessed()
                 }
             })
             .catch(() => showError("Something has gone horribly wrong", "File a bug!"))
     }, []);

    function checkProcessed() {
         axios.get('http://127.0.0.1:5000/process')
             .then((response) => {
                 if (response.data.error) {
                     showError("Fatal error while rocessing messages", response.data.error)
                 }
                 const status = response.data.status
                 if (status === "unstarted" || status === "in_progress") {
                     navigate('/loading')
                 }
             })
    }

    return (
        <Routes>
            <Route path="/onboarding" element={<Onboarding/>} />
            <Route path="/loading" element={<Loading/>} />
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
                            <Route path="/contacts" element={<ContactList />} />
                            <Route path="/contacts/:number" element={<Contact />} />
                            <Route path="/groups" element={<GroupList />} />
                            <Route path="/groups/:id" element={<Group />} />
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
