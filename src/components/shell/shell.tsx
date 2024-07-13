import { Center, AppShell, Burger, Breadcrumbs, Loader } from '@mantine/core';
import { useEffect, useState } from 'react';
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
import NotFound from '@/components/notfound/notfound'
import { Routes, Route } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { showError } from '@/util'

function Shell() {
    const [opened, { toggle }] = useDisclosure()
    const [loading, setLoading] = useState(true)
    const [retries, setRetries] = useState(5)

    const navigate = useNavigate();

    // In production the server takes non-trivial time to spin up
    // Retry 5 times at a 1 second interval.
    //
    // TODO(jaredweinstein): Use axios-retry to clean this up
     useEffect(() => {
         axios.get('http://127.0.0.1:4242/source')
             .then((response) => {
                 if (response.data.source == null) {
                     setLoading(false)
                     navigate('/onboarding')
                 } else {
                     checkProcessed()
                 }
             })
             .catch(() => {
                 if (retries === 0) {
                     showError("Critical error", "Server failed to load");
                 }
                 setTimeout(() => setRetries(retries - 1), 1000)
             })
     }, [retries])

    function checkProcessed() {
         axios.get('http://127.0.0.1:4242/process')
             .then((response) => {
                 if (response.data.error) {
                     showError("Fatal error while processing messages", response.data.error)
                 }
                 setLoading(false)
                 const status = response.data.status
                 if (status === "unstarted" || status === "in_progress") {
                     navigate('/loading')
                 }
             })
    }

    if (loading) {
        return <Center><Loader color="blue" /></Center>;
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
                            <Route path="*" element={<NotFound/>} />
                        </Routes>
                    </AppShell.Main>
                </AppShell>

            } />

        </Routes>
    );
}

export default Shell
