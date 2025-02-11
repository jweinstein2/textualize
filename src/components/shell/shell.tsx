import Contact from "@/components/contact/contact";
import Group from "@/components/group/group";
import NotFound from "@/components/notfound/notfound";
import Settings from "@/components/settings/settings";
import Summary from "@/components/summary/summary";
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
                    <Route path="/contacts/:number" element={<Contact />} />
                    <Route path="/groups/:id" element={<Group />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AppShell.Main>
        </AppShell>
    );
}

export default Shell;
