import Backup from "@/components/onboarding/backup";
import DiskAccess from "@/components/onboarding/diskAccess";
import Loading from "@/components/onboarding/loading";
import Mac from "@/components/onboarding/mac";
import Splash from "@/components/onboarding/splash";
import Shell from "@/components/shell/shell";
import { showError } from "@/util";
import { Center, Loader } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { Routes as ReactRoutes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Routes() {
    const [loading, setLoading] = useState(true);
    const [retries, setRetries] = useState(5);

    const navigate = useNavigate();

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
            <Route path="/*" element={<Shell />} />
        </ReactRoutes>
    );
}

export default Routes;
