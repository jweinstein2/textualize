import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './navbar';
import Group from '@/components/group/group'
import Settings from '@/components/settings/settings'
import Summary from '@/components/summary/summary'
import Wizard from '@/components/wizard/wizard'

function Shell() {
    const [opened, { toggle }] = useDisclosure();
    return (
        <AppShell
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md">

            <AppShell.Navbar>
                <Navbar/>
            </AppShell.Navbar>

            <AppShell.Main>
                <Settings/>
            </AppShell.Main>
        </AppShell>
    )
}

export default Shell
