import Contact from "@/components/contact/contact";
import ContactList from "@/components/contact_list/contact_list";
import Group from "@/components/group/group";
import GroupList from "@/components/group_list/group_list";
import NotFound from "@/components/notfound/notfound";
import Settings from "@/components/settings/settings";
import Summary from "@/components/summary/summary";
import Wizard from "@/components/wizard/wizard";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Route, Routes } from "react-router-dom";

import Navbar from "./navbar";

function Shell() {
    const [opened] = useDisclosure();

    return (
        <AppShell
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Navbar>
                <Navbar />
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
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AppShell.Main>
        </AppShell>
    );
}

export default Shell;
