import { usePostHog } from 'posthog-js/react'
import Chats from "@/components/chats/chats";
import Contact from "@/components/contact/contact";
import Group from "@/components/group/group";
import Backup from "@/components/onboarding/backup";
import DiskAccess from "@/components/onboarding/diskAccess";
import Loading from "@/components/onboarding/loading";
import Mac from "@/components/onboarding/mac";
import Splash from "@/components/onboarding/splash";
import Settings from "@/components/settings/settings";
import Summary from "@/components/summary/summary";
import { showError } from "@/util";
import { Center, Loader } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { Routes as ReactRoutes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

function Routes() {
    const [loading, setLoading] = useState(true);
    const [retries, setRetries] = useState(5);

    const location = useLocation();
    const navigate = useNavigate();
    const posthog = usePostHog();

    useEffect(() => {
        const pathname = location.pathname;
        const sensitivePattern = /(\/(contacts|groups)\/)([\w+.-]+@[\w.-]+|\+\d{10,15}|\d+)/g;
        const sanitized =  pathname.replace(sensitivePattern, (_, prefix) => `${prefix}[...]`);
        console.log(`Pageview: ${sanitized}`);
        posthog?.capture('$pageview', {'$pathname': sanitized})
    }, [location]);

    // In production the server takes non-trivial time to spin up
    // Retry 5 times at a 1 second interval.
    //
    // TODO(jaredweinstein): Use axios-retry to clean this up
    useEffect(() => {
        axios
            .get("http://127.0.0.1:4242/process")
            .then((response) => {
                if (response.data.error) {
                    showError(
                        "Fatal error while processing messages",
                        response.data.error
                    );
                }
                setLoading(false);
                const status = response.data.status;
                if (status === "unstarted") {
                    navigate("/onboarding");
                } else if (status === "in_progress") {
                    navigate("/loading");
                }
            })
            .catch(() => {
                if (retries === 0) {
                    showError("Critical error", "Server failed to load");
                }
                setTimeout(() => setRetries(retries - 1), 1000);
            });
    }, [retries]);

    if (loading) {
        return (
            <Center style={{ height: "100vh" }}>
                <Loader color="blue" />
            </Center>
        );
    }

    return (
        <ReactRoutes>
            <Route path="/onboarding/*" element={<Splash />} />
            <Route path="/onboarding/backup" element={<Backup />} />
            <Route path="/onboarding/mac" element={<Mac />} />
            <Route path="/disk_access" element={<DiskAccess />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/" element={<Chats />} />
            <Route path="/*" element={<Chats />} />
            <Route path="/overview" element={<Summary />} />
            <Route path="/contacts/:number" element={<Contact />} />
            <Route path="/groups/:id" element={<Group />} />
            <Route path="/settings" element={<Settings />} />
        </ReactRoutes>
    );
}

export default Routes;
