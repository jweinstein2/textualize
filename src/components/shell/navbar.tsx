import {
    Icon,
    IconChartAreaLine,
    IconMessage,
    IconSettings,
    IconUsersGroup,
} from "@tabler/icons-react";
import { useState } from "react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import "./navbar.css";

interface NavBarItem {
    link: string;
    label: string;
    icon: Icon;
}

const data: NavBarItem[] = [
    { link: "/summary", label: "Summary", icon: IconChartAreaLine },
    { link: "/contacts", label: "Contacts", icon: IconMessage },
    { link: "/groups", label: "Groups", icon: IconUsersGroup },
    { link: "/settings", label: "Settings", icon: IconSettings },
];

function Navbar() {
    const [active, setActive] = useState("Summary");

    const location = useLocation();

    useEffect(() => {
        const activeIndex = data.find(
            (item) => item.link === location.pathname
        );
        if (activeIndex?.label != undefined) {
            setActive(activeIndex.label);
        }
    }, [location]);

    function renderLinks(data: NavBarItem[]) {
        return data.map((item: NavBarItem) => (
            <Link
                className="link"
                data-active={item.label === active || undefined}
                to={item.link}
                key={item.label}
                onClick={() => {
                    setActive(item.label);
                }}
            >
                <item.icon className="linkIcon" stroke={1.5} />
                <span>{item.label}</span>
            </Link>
        ));
    }

    return (
        <nav className="navbar">
            <div className="navbarMain">{renderLinks(data.slice(0, 3))}</div>
            <div className="footer">{renderLinks(data.slice(3, 4))}</div>
        </nav>
    );
}

export default Navbar;
