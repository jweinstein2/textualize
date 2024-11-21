import { showError } from "@/util";
import { Button } from "@mantine/core";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Mac() {
    const BACKUP_PATH = "BACKUP_PATH";
    const navigate = useNavigate();

    function analyze() {
        axios
            .post("http://127.0.0.1:4242/source", { source: BACKUP_PATH })
            .then(() => navigate("/loading"))
            .catch(() =>
                showError(
                    "Invalid data source",
                    "Select another backup and try again"
                )
            );
    }

    return <Button onClick={analyze}>Continue</Button>;
}

export default Mac;
