import { useNavigate } from "react-router-dom";
import { Tooltip } from '@mantine/core';
import { useState, useEffect } from 'react';
import { motion, useAnimationFrame } from "motion/react"
import { useMouse, useViewportSize } from '@mantine/hooks';

import classes from "./planet.module.css";

interface Orbit {
    type: "orbit";
    distance: number; // px from center
    speed: number; // magic number (sorry)
}

interface Position {
    type: "position";
    distance: number; // px from center
    degree: number; // 0 - 360
}

interface PlanetProps {
    firstName: string;
    lastName: string;
    size: number;
    link?: string;
    tooltip?: string;
    movement: Movement;
}

type Movement = Orbit | Position

function firstChar(str: string) {
    if (str == null || str.length === 0) return "";
    return str.charAt(0);
}

interface PlanetPosition {
    radius: number;
    angle: number;
}

function Planet(props: PlanetProps) {
    // Position should only be set by useAnimationFrame. To move the planet use `setPositionOverride`.
    // This queues up the change and prevents a race condition between position updates.
    const [position, setPosition] = useState<PlanetPosition | undefined>(undefined);
    const [positionOverride, setPositionOverride] = useState<PlanetPosition | undefined>(undefined);

    const { height, width } = useViewportSize();
    const { x, y } = useMouse();

    const navigate = useNavigate();

    function navigateOnClick() {
        if (props.link == null) return;
        navigate(props.link);
    }

    // Calculate Initial Position
    useEffect(() => {
        switch(props.movement.type) {
            case "position":
                const anglePosition = props.movement.degree / 360 * 2 * Math.PI;
                setPositionOverride({radius: props.movement.distance, angle: anglePosition})
                break
            case "orbit":
                const angleOrbit = (position == null) ?  Math.random() * 2 * Math.PI : position.angle
                setPositionOverride({radius: props.movement.distance, angle: angleOrbit})
                break
        }
    }, [props.movement, width, height]);

    // Animate
    useAnimationFrame(() => {
        if (positionOverride != null) {
            setPosition(positionOverride)
            setPositionOverride(undefined)
        }

        switch (props.movement.type) {
            case "position":
                return
            case "orbit":
                if (positionOverride != null) {
                    setPosition(positionOverride)
                    setPositionOverride(undefined)
                    return
                }

                if (position == null) return;

                // Modify speed based on proximity to mouse.
                const positionX = (width / 2) + position.radius * Math.cos(position.angle) + (props.size / 2)
                const positionY = (height / 2) + position.radius * Math.sin(position.angle) + (props.size / 2)
                const mouseDistance = Math.sqrt(Math.pow(x - positionX, 2) + Math.pow(y - positionY, 2))
                const flex = 20
                const speed = (mouseDistance - flex < (props.size / 2)) ? props.movement.speed + (mouseDistance / 10): props.movement.speed;

                const angleDelta = (1 / 1000) * (2 * Math.PI) / speed
                const newAngle = position.angle + angleDelta
                setPosition({ radius: position.radius, angle: newAngle });
        }
    });

    const initials =
        `${firstChar(props.firstName)}${firstChar(props.lastName)}`.toUpperCase();

    if (position == null) {return <></> }

    // Convert polar to cartesian
    const positionX = (width / 2) + position.radius * Math.cos(position.angle) - (props.size / 2)
    const positionY = (height / 2) + position.radius * Math.sin(position.angle) - (props.size / 2)
    const planetStyle = {width: `${props.size}px`, height: `${props.size}px`, fontSize: `${props.size * .4}px`};

    const planet =(
        <motion.div
            style={{position: "fixed"}}
            animate={{
                left: positionX,
                top: positionY,
            }}
            transition={{
                type: "tween",
                ease: "linear",
                duration: 0,
            }}>
            <div className={classes.circle} onClick={navigateOnClick} style={planetStyle}>
                 <span>{initials}</span>
             </div>
        </motion.div>)

    return props.tooltip ? (
        <Tooltip label={props.tooltip}>
            {planet}
        </Tooltip>
    ) : (
        <>{planet}</>
    );
}

export default Planet;
