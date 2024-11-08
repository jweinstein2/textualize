import { Button } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <div>
            <h5>Textualize {version}</h5>
            <Button variant="filled" color="red" onClick={clearSource}>
                Clear Data Source
            </Button>
        </div>
    );
}

export default Settings;
