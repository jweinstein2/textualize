import { Route, Routes } from "react-router-dom";

import "./onboarding.css";

import Backup from "./backup";
import Home from "./home";

function Onboarding() {
    return (
        <Routes>
            <Route path="/*" element={<Home />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/mac" element={<></>} />
        </Routes>
    );
}

export default Onboarding;
