import { Tooltip } from "@mantine/core";
import { useMouse, useViewportSize } from "@mantine/hooks";
import { motion, useAnimationFrame } from "motion/react";
import { ReactNode, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import classes from "./planet.module.css";

export interface Orbit {
    type: "orbit";
    distance: number; // 0-1: % of radius.
    speed: number; // magic number (sorry)
}

export interface Position {
    type: "position";
    distance: number; // 0-1: % of radius.
    degree: number; // 0-360
}

interface PlanetProps {
    size: number;
    link?: string;
    tooltip?: string;
    movement: Movement;
    children?: ReactNode;
}

export type Movement = Orbit | Position;

interface PlanetPosition {
    radius: number;
    angle: number;
}

function Planet(props: PlanetProps) {
    // Position should only be set by useAnimationFrame. To move the planet use `setPositionOverride`.
    // This queues up the change and prevents a race condition between position updates.
    const [position, setPosition] = useState<PlanetPosition | undefined>(
        undefined
    );
    const [positionOverride, setPositionOverride] = useState<
        PlanetPosition | undefined
    >(undefined);

    const { height, width } = useViewportSize();
    const { x, y } = useMouse();
    const  screenRadius = Math.min(height, width) / 2;

    const navigate = useNavigate();

    function navigateOnClick() {
        if (props.link == null) return;
        navigate(props.link);
    }

    // Calculate Initial Position
    useLayoutEffect(() => {
        switch (props.movement.type) {
            case "position":
                const anglePosition =
                    (props.movement.degree / 360) * 2 * Math.PI;
                setPositionOverride({
                    radius: props.movement.distance * ( screenRadius * .7), 
                    angle: anglePosition,
                });
                break;
            case "orbit":
                const angleOrbit =
                    position == null
                        ? Math.random() * 2 * Math.PI
                        : position.angle;
                setPositionOverride({
                    radius: props.movement.distance * ( screenRadius * .8) + 100, // Add offset to avoid center
                    angle: angleOrbit,
                });
                break;
        }
    }, [props.movement, width, height]);

    // Animate
    useAnimationFrame(() => {
        if (positionOverride != null) {
            setPosition(positionOverride);
            setPositionOverride(undefined);
        } 

        switch (props.movement.type) {
            case "position":
                return;
            case "orbit":
                if (positionOverride != null) {
                    setPosition(positionOverride);
                    setPositionOverride(undefined);
                    return;
                }

                if (position == null) return;

                // Modify speed based on proximity to mouse.
                const positionX =
                    width / 2 +
                    position.radius * Math.cos(position.angle) +
                    props.size / 2;
                const positionY =
                    height / 2 +
                    position.radius * Math.sin(position.angle) +
                    props.size / 2;
                const mouseDistance = Math.sqrt(
                    Math.pow(x - positionX, 2) + Math.pow(y - positionY, 2)
                );
                const flex = 20;
                const speed =
                    mouseDistance - flex < props.size / 2
                        ? props.movement.speed + mouseDistance / 10
                        : props.movement.speed;

                const angleDelta = ((1 / 1000) * (2 * Math.PI)) / speed;
                const newAngle = position.angle + angleDelta;
                setPosition({ radius: position.radius, angle: newAngle });
        }
    });

    if (position == null) {
        return <></>;
    }

    // Convert polar to cartesian
    const positionX =
        width / 2 + position.radius * Math.cos(position.angle) - props.size / 2;
    const positionY =
        height / 2 +
        position.radius * Math.sin(position.angle) -
        props.size / 2;
    const planetStyle = {
        width: `${props.size}px`,
        height: `${props.size}px`,
        fontSize: `${props.size * 0.4}px`,
    };

    const planet = (
        <motion.div
            style={{ position: "fixed" }}
            animate={{
                left: positionX,
                top: positionY,
            }}
            transition={{
                type: "tween",
                ease: "linear",
                duration: 0,
            }}
        >
            <div
                className={classes.circle}
                onClick={navigateOnClick}
                style={planetStyle}
            >
                {props.children}
            </div>
        </motion.div>
    );

    return props.tooltip ? (
        <Tooltip label={props.tooltip}>{planet}</Tooltip>
    ) : (
        <>{planet}</>
    );
}

export default Planet;
