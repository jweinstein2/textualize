import { useNavigate } from "react-router-dom";

import c from "./contact_icon.module.css";

interface IconProps {
    text?: string;
    size: number;
    link?: string;
}

function ContactIcon(props: IconProps) {
    const navigate = useNavigate();

    function navigateOnClick() {
        if (props.link == null) return;
        navigate(props.link);
    }

    const planetStyle = {
        width: `${props.size}px`,
        height: `${props.size}px`,
        fontSize: `${props.size * 0.4}px`,
    };

    return (
        <div className={c.circle} style={planetStyle} onClick={navigateOnClick}>
            {props.text}
        </div>
    );
}

export default ContactIcon;
