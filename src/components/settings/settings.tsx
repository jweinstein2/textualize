import { Button } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";

import classes from "./settings.module.css"

function Settings() {
    const navigate = useNavigate();

    const [version, setVersion] = useState<string>("");

    useEffect(() => {
        window.ipcRenderer.invoke("get-version").then(setVersion);
    });

    function clearSource() {
        axios
            .delete("http://127.0.0.1:4242/source")
            .then(() => navigate("/onboarding"))
            .catch((error) => console.log(error.response));
    }

    return (
        <div className={classes.container}>
            <h2>
                <Button
                    className={classes.backButton}
                    onClick={() => navigate(-1)}
                >
                    <IconArrowLeft />
                </Button>
            Textual Activity {version}</h2>
            <Button variant="filled" color="red" onClick={clearSource}>
                Clear Data Source
            </Button>
        </div>
    );
}

export default Settings;
