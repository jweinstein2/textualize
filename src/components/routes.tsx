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
import ChatList from "@/components/chats/chat_list/chat_list";
import Universe from "@/components/chats/universe/universe";
import { Center, Loader } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { Routes as ReactRoutes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import {ChatProvider} from "@/components/chats/ChatContext";

function OnboardingRoutes() {
    return (
            <ReactRoutes>
                <Route path="*" element={<Splash />} />
                <Route path="/backup" element={<Backup />} />
                <Route path="/mac" element={<Mac />} />
                <Route path="/disk_access" element={<DiskAccess />} />
                <Route path="/loading" element={<Loading />} />
            </ReactRoutes>
    )
}

function AppRoutes() {
    return (
        <ChatProvider>
            <ReactRoutes>
                <Route path="/overview" element={<Summary />} />
                <Route path="/contacts/:number" element={<Contact />} />
                <Route path="/groups/:id" element={<Group />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/list" element={<ChatList/>} />
                <Route path="/universe" element={<Universe/>} />
                <Route path="*" element={<Universe/>} />
            </ReactRoutes>
        </ChatProvider>
    )
}

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
                    navigate("/onboarding/loading");
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
            <Route path="/onboarding/*" element={<OnboardingRoutes />} />
            <Route path="*" element={<AppRoutes />} />
        </ReactRoutes>
    );
}

export default Routes;
