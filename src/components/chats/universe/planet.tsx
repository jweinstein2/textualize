import { Tooltip } from "@mantine/core";
import { forwardRef, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {Movement, Position} from "./planet_builder";

import classes from "./planet.module.css";

interface PlanetProps {
    size: number;
    link?: string;
    tooltip?: string;
    movement: Movement;
    children?: ReactNode;
}

const Planet = forwardRef<HTMLDivElement, PlanetProps>((props, ref) => {
    const navigate = useNavigate();

    function navigateOnClick() {
        if (props.link == null) return;
        navigate(props.link);
    }

    const planetStyle = {
        width: `${props.size}px`,
        height: `${props.size}px`,
        fontSize: `${props.size * 0.4}px`,
        willChange: "left top",
        position: "absolute", 
    };

    const planet = (
        <div
            ref={ref}
            className={classes.circle}
            onClick={navigateOnClick}
            style={planetStyle}>
            {props.children}
        </div>
    );

    return props.tooltip ? (
        <Tooltip label={props.tooltip}>{planet}</Tooltip>
    ) : (
        <>{planet}</>
    );
})

export default Planet;
