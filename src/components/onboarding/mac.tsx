import { showError } from "@/util";
import { Button } from "@mantine/core";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Mac() {
    const navigate = useNavigate();

    function analyze() {
        axios
            .post("http://127.0.0.1:4242/process", { type: "mac" })
            .then(() => navigate("/loading"))
            .catch((err) =>
                showError(err, "Select another backup and try again")
            );
    }

    return <Button onClick={analyze}>Continue</Button>;
}

export default Mac;
