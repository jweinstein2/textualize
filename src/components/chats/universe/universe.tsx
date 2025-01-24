import { Chat } from "@/components/chats/chats";
import Planet, {
    Movement,
    Orbit,
    Position,
} from "@/components/chats/universe/planet";
import { minMax, prettyDate } from "@/util";
import { Button, Select } from "@mantine/core";
import { IconList, IconSettings } from "@tabler/icons-react";
import { MoveDirection } from "@tsparticles/engine";
import Particles from "@tsparticles/react";
import { ReactNode, memo, useState } from "react";
import { useNavigate } from "react-router-dom";

import classes from "./universe.module.css";

const SPEED_JITTER_THRESHOLD = 0.5;

const OPTIONS = {
    autoPlay: true,
    background: {
        color: {
            value: "#080612",
        },
    },
    particles: {
        number: {
            value: 1000,
            density: {
                enable: true,
                width: 1024,
                height: 1024,
            },
        },
        move: {
            direction: MoveDirection.top,
            enable: true,
            speed: 0.5,
            straight: true,
        },
        opacity: {
            animation: {
                enable: true,
                speed: 0.1,
                sync: false,
            },
            value: { min: 0, max: 0.3 },
        },
        size: {
            value: { min: 0.2, max: 1.5 },
        },
    },
};

const Stars = memo(function Stars({}) {
    return <Particles id="tsparticles" options={OPTIONS} />;
});

interface PlanetParameter {
    movement: Movement;
    tooltip: string;
    size: number;
    key: string;
    link: string;
    contents: ReactNode;
}

enum DataTypeOption {
    MessageCount = "Messages Sent",
    Streak = "Longest Streak",
    Earliest = "First Message",
    Recent = "Most Recent Message",
    ResponseTime = "Your Response Time",
}

function firstChar(str: string) {
    if (str == null || str.length === 0) return "";
    return str.charAt(0).toUpperCase();
}

function buildName(chat: Chat) {
    if (chat.isGroup) {
        return firstChar(chat.name);
    } else {
        const [first, last] = chat.name.split(" ", 2);
        return firstChar(first) + firstChar(last);
    }
}

function makePlanetParams(chat: Chat): PlanetParameter {
    return {
        size: 40,
        tooltip: chat.name,
        key: chat.id,
        link: buildLink(chat),
        movement: { distance: 0, degree: 0, type: "position" } as Position,
        contents: <>{buildName(chat)}</>,
    };
}

function messageCountMap(chats: Chat[]): PlanetParameter[] {
    const [, max] = minMax(chats.map((c) => c.countTotal));

    return chats.map((chat) => {
        const params = makePlanetParams(chat);

        const distance = (120 - (chat.countTotal / max) * 100) * 5.5;
        const speedJitter =
            Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
        const speed = 1.5 + speedJitter;

        params.tooltip = `${chat.name}:  ${chat.countTotal} messages`;
        params.movement = { distance, speed, type: "orbit" } as Orbit;
        return params;
    });
}

function streakMap(chats: Chat[]): PlanetParameter[] {
    const [, max] = minMax(chats.map((c) => c.longestStreak));

    return chats.map((chat) => {
        const params = makePlanetParams(chat);

        const distance = (120 - (chat.longestStreak / max) * 100) * 5.5;
        const speedJitter =
            Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
        const speed = 1.5 + speedJitter;

        params.tooltip = `${chat.name}:  ${chat.longestStreak} days`;
        params.movement = { distance, speed, type: "orbit" } as Orbit;
        return params;
    });
}

function earliestMap(chats: Chat[]): PlanetParameter[] {
    const [min, max] = minMax(chats.map((c) => c.oldest.getTime()));
    const maxDelta = min - max;

    return chats.map((chat) => {
        const params = makePlanetParams(chat);

        const dateDelta = chat.oldest.getTime() - max;
        const distance = (120 - (dateDelta / maxDelta) * 100) * 5.5;
        const speedJitter =
            Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
        const speed = 1.5 + speedJitter;

        params.tooltip = `${chat.name}: ${prettyDate(chat.oldest)}`;
        params.movement = { distance, speed, type: "orbit" } as Orbit;
        return params;
    });
}

function recentMap(chats: Chat[]): PlanetParameter[] {
    const [min, max] = minMax(chats.map((c) => c.newest.getTime()));
    const maxDelta = min - max;

    return chats.map((chat) => {
        const params = makePlanetParams(chat);

        const dateDelta = chat.newest.getTime() - max;
        const distance = (20 + (dateDelta / maxDelta) * 100) * 5.5;
        const speedJitter =
            Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
        const speed = 1.5 + speedJitter;
        params.tooltip = `${chat.name}: ${prettyDate(chat.newest)}`;
        params.movement = { distance, speed, type: "orbit" } as Orbit;

        return params;
    });
}

function responseTimeMap(chats: Chat[]): PlanetParameter[] {
    const [min, max] = minMax(chats.map((c) => c.responseTimeReceived));

    // TODO: Fix this for groups
    return chats
        .filter((c) => !c.isGroup)
        .map((chat) => {
            const params = makePlanetParams(chat);
            const time = chat.responseTimeReceived;

            const distance = (20 + Math.random() * 100) * 5.5;
            const speed = (1 - (time - max) / (min - max)) * 5 + 0.25;

            params.movement = { distance, speed, type: "orbit" } as Orbit;
            params.tooltip = `${chat.name}: ${Math.ceil(time / 60)} min`;
            return params;
        });
}

const DataTypeToBuildParams: {
    [key in DataTypeOption]: (chats: Chat[]) => PlanetParameter[];
} = {
    [DataTypeOption.MessageCount]: messageCountMap,
    [DataTypeOption.Streak]: streakMap,
    [DataTypeOption.Earliest]: earliestMap,
    [DataTypeOption.Recent]: recentMap,
    [DataTypeOption.ResponseTime]: responseTimeMap,
};

function buildLink(chat: Chat): string {
    if (chat.isGroup) {
        return `/groups/${chat.id}`;
    } else {
        return `/contacts/${chat.id}`;
    }
}

function buildPlanets(chats: Chat[], selectedDataType: DataTypeOption) {
    const buildParams = DataTypeToBuildParams[selectedDataType];
    const planetParameters = buildParams(chats);
    const planets = planetParameters.map((params) => {
        return (
            <Planet
                tooltip={params.tooltip}
                size={40}
                movement={params.movement}
                key={params.key}
                link={params.link}
            >
                {params.contents}
            </Planet>
        );
    });
    return planets;
}

function Universe({ chats }: { chats: Chat[] }) {
    const [selectedDataType, setSelectedDataType] = useState<DataTypeOption>(
        DataTypeOption.MessageCount
    );

    const navigate = useNavigate();

    const planets = buildPlanets(chats, selectedDataType);

    return (
        <div>
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
                    <Button
                        onClick={() => navigate("/settings")}
                        variant="light"
                    >
                        <IconSettings />
                    </Button>
                </div>
                {planets.slice(0, 50)} {/* TODO: Customize w. Filter */}
                <Planet
                    link="/overview"
                    key="me"
                    size={100}
                    movement={{ distance: 0, degree: 0, type: "position" }}
                >
                    You
                </Planet>
            </div>
        </div>
    );
}

export default Universe;
