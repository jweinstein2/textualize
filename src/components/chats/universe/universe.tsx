import {Chat, useChat} from "@/components/chats/ChatContext"
import { useAnimationFrame } from "motion/react";
import { useViewportSize, useMouse } from "@mantine/hooks";
import  { PlanetParameter, buildFunctions } from "@/components/chats/universe/planet_builder";
import Planet from "@/components/chats/universe/planet";
import {
    Button,
    Select,
} from "@mantine/core";
import {
    IconList,
    IconSettings,
} from "@tabler/icons-react";
import Particles from "@tsparticles/react";
import { memo, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Filters, {Filter} from "./filters";
import {STARS} from "@/particles"

import classes from "./universe.module.css";

const CENTER_SIZE = 100;
const UNIVERSE_MARGIN = 50;

const Stars = memo(function Stars({}) {
    return <Particles id="tsparticles" options={STARS} />;
});

enum DataTypeOption {
    MessageCount = "Messages Sent",
    Streak = "Longest Streak",
    Earliest = "First Message",
    Recent = "Most Recent Message",
    ResponseTime = "Your Response Time",
}

const DataTypeToBuildParams: {
    [key in DataTypeOption]: (
        chats: Chat[],
    ) => PlanetParameter[];
} = {
    [DataTypeOption.MessageCount]: buildFunctions.byMessageCount,
    [DataTypeOption.Streak]: buildFunctions.byStreak,
    [DataTypeOption.Earliest]: buildFunctions.byEarliest,
    [DataTypeOption.Recent]: buildFunctions.byRecent,
    [DataTypeOption.ResponseTime]: buildFunctions.byResponseTime,
};

function Universe() {
    const { chats } = useChat();
    const [selectedDataType, setSelectedDataType] = useState<DataTypeOption>(
        DataTypeOption.MessageCount
    );
    const [planets, setPlanets] = useState<JSX.Element[]>([]);
    const [filters, setFilters] = useState<Filter>({
        maxChats: 25,
        textFilter: "",
        filterGroups: false,
        filterContacts: false,
    });

    const planetRefs = useRef<HTMLDivElement[]>([]);
    const planetParameterRefs = useRef<PlanetParameter[]>([]);

    const { height, width } = useViewportSize();
    const navigate = useNavigate();
    const { x, y } = useMouse();

    function buildPlanets(
        chats: Chat[],
        selectedDataType: DataTypeOption
    ) {
        const buildParams = DataTypeToBuildParams[selectedDataType];
        const planetParameters = buildParams(chats);
        planetParameters.unshift({
            movement: {
                type: "position",
                distance: 0, // 0-1: % of radius.
                degree: 0, // 0-360
            },
            tooltip: "Click for Summary Stats",
            size: CENTER_SIZE,
            key: "me",
            link: "/overview",
            contents: <div>You</div>,
            currentRadius: 0, 
            currentAngle: 0,
        })
        const planets = planetParameters.map(initialPosition); 
        planetParameterRefs.current = planets;

        return planets.map((params, index) => {
            return (
                <Planet
                    ref={(p: any) => {
                        if (p) planetRefs.current[index] = p;
                    }}

                    tooltip={params.tooltip}
                    size={params.size}
                    movement={params.movement}
                    key={params.key}
                    link={params.link}
                >
                    {params.contents}
                </Planet>
            );
        });
    }

    useEffect(() => {
        planetRefs.current = [];
        planetParameterRefs.current = [];
        const builtPlanets = buildPlanets(chats, selectedDataType);
        setPlanets(builtPlanets);
    }, [chats, selectedDataType])

    // Hide filters planets
    useEffect(() => {
        if (planets.length !== planetRefs.current.length || planetRefs.current.length != planetParameterRefs.current.length) {
           return; 
        }

        const query = filters.textFilter.toLowerCase().trim();
        let displayed = 0
        planets.forEach((_, index) => {
            if (index === 0) return;
            const planet = planetRefs.current[index]
            const chat = chats[index - 1] // Offset by 1 for the first planet

            const isGroup = chat.isGroup;
            const nameMatches = chat.name.toLowerCase().includes(query);
            const shouldHide =
              (filters.filterGroups && isGroup) ||
              (filters.filterContacts && !isGroup) ||
              (query !==  "" && !nameMatches) ||
              (displayed >= filters.maxChats);

            planet.style.display = shouldHide ? "none" : "flex";
            if (!shouldHide) displayed += 1
        })
    }, [planets, filters])

    function calcRadius(distance: number, isOrbit = true) {
        const maxOrbit = Math.min(height, width) / 2;
        return (isOrbit) 
            ? distance * (maxOrbit - CENTER_SIZE - UNIVERSE_MARGIN) + CENTER_SIZE
            : distance * (maxOrbit)
    }

    function initialPosition(params: PlanetParameter): PlanetParameter {
        let currentRadius, currentAngle;
        switch (params.movement.type) {
            case "position":
                currentAngle = (params.movement.degree / 360) * 2 * Math.PI;
                currentRadius = calcRadius(params.movement.distance, /* isOrbit */ false);
                return {...params, currentRadius, currentAngle}
            case "orbit":
                currentAngle = Math.random() * 2 * Math.PI
                currentRadius = calcRadius(params.movement.distance);
                return {...params, currentRadius, currentAngle}
        }
    }

    function polarToCartesian(params: PlanetParameter) {
        const size = params.size
        const radius = params.currentRadius ?? 0;
        const widthMid = width / 2
        const heightMid = height / 2
        const positionX =
            widthMid + radius * Math.cos(params.currentAngle) - size / 2;
        const positionY =
            heightMid + radius * Math.sin(params.currentAngle) - size / 2;
        return [positionX, positionY]
    }

    function mouseDistance(x: number, y: number, params: PlanetParameter): number {
        const [positionX, positionY] = polarToCartesian(params);
        const midX = positionX + params.size / 2;
        const midY = positionY + params.size / 2;

        const sqrt = Math.sqrt(
            Math.pow(x - midX, 2) + Math.pow(y - midY, 2)
        );
        return sqrt
    }

    function quadraticEaseSpeedMultiplier(distance: number, radius: number) {
        if (distance < radius) return 0;
        if (distance > 3 * radius) return 1;

        const t = (distance - radius) / (2 * radius);
        return t * t;
    };

    function updatePosition(params: PlanetParameter, delta: number): PlanetParameter {
        const distance = mouseDistance(x, y, params);
        const speedMultiplier = quadraticEaseSpeedMultiplier(distance, params.size / 3);

        let currentAngle, currentRadius;
        switch (params.movement.type) {
            case "position":
                currentAngle = (params.movement.degree / 360) * 2 * Math.PI;
                currentRadius = calcRadius(params.movement.distance, /* isOrbit */ false);
                return {...params, currentRadius, currentAngle}
            case "orbit":
                currentAngle = params.currentAngle + params.movement.speed * delta / 3000 * speedMultiplier;
                currentRadius = calcRadius(params.movement.distance);
                return {...params, currentRadius, currentAngle}
        }
    }

    useAnimationFrame((_, delta) => {
        planetRefs.current.forEach((planetRef: any, index) => {
            const parameter = planetParameterRefs.current[index];
            planetParameterRefs.current[index] = updatePosition(parameter, delta);
            const [positionX, positionY] = polarToCartesian(parameter);
            planetRef.style.left = `${positionX}px`;
            planetRef.style.top = `${positionY}px`;
        })
    });

    return (
        <>
            <Stars />
            <div className={classes.background}>
                <div className={classes.floatLeft}>
                    <Select
                        className={classes.select}
                        data={Object.values(DataTypeOption)}
                        value={selectedDataType}
                        onChange={(value) =>
                            setSelectedDataType(value as DataTypeOption)
                        }
                        allowDeselect={false}
                        size="md"
                    />
                    <Button onClick={() => navigate("list")}>
                        <IconList />
                    </Button>
                </div>
                <div className={classes.floatRight}>
                    <Button onClick={() => navigate("/settings")}>
                        <IconSettings />
                    </Button>
                    <Filters setFilters={setFilters} filters={filters} chatLength={chats.length}/>
                </div>
                {planets}
            </div>
        </>
    );
}

export default Universe;
