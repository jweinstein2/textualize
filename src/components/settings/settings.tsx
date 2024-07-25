import UpdateElectron from "@/components/update";
import { Button } from "@mantine/core";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Settings() {
    const navigate = useNavigate();

    function clearSource() {
        axios
            .delete("http://127.0.0.1:4242/source")
            .then(() => navigate("/onboarding"))
            .catch((error) => console.log(error.response));
    }

    return (
        <div>
            <Button variant="filled" color="red" onClick={clearSource}>
                Clear Data Source
            </Button>
            <UpdateElectron />
        </div>
    );
}

export default Settings;
