import {Chat, useChat} from "@/components/chats/ChatContext"
import Planet, {
    Movement,
    Orbit,
    Position,
} from "@/components/chats/universe/planet";
import { minMax, prettyDate } from "@/util";
import {
    Button,
    Select,
} from "@mantine/core";
import {
    IconList,
    IconSettings,
} from "@tabler/icons-react";
import Particles from "@tsparticles/react";
import { ReactNode, memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Filters, {Filter} from "./filters";
import {STARS} from "@/particles"

import classes from "./universe.module.css";

const SPEED_JITTER_THRESHOLD = 0.5;

const Stars = memo(function Stars({}) {
    return <Particles id="tsparticles" options={STARS} />;
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

function messageCountMap(allChats: Chat[], chats: Chat[]): PlanetParameter[] {
    const [, max] = minMax(allChats.map((c) => c.countTotal));

    return chats.map((chat) => {
        const params = makePlanetParams(chat);

        const distance = (1 - (chat.countTotal / max));
        const speedJitter =
            Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
        const speed = 1.5 + speedJitter;

        params.tooltip = `${chat.name}:  ${chat.countTotal} messages`;
        params.movement = { distance, speed, type: "orbit" } as Orbit;
        return params;
    });
}

function streakMap(allChats: Chat[], chats: Chat[]): PlanetParameter[] {
    const [, max] = minMax(allChats.map((c) => c.longestStreak));

    return chats.map((chat) => {
        const params = makePlanetParams(chat);

        const distance = (1 - (chat.longestStreak / max) * 1);
        const speedJitter =
            Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
        const speed = 1.5 + speedJitter;

        params.tooltip = `${chat.name}:  ${chat.longestStreak} days`;
        params.movement = { distance, speed, type: "orbit" } as Orbit;
        return params;
    });
}

function earliestMap(allChats: Chat[], chats: Chat[]): PlanetParameter[] {
    const [min, max] = minMax(allChats.map((c) => c.oldest.getTime()));
    const maxDelta = min - max;

    return chats.map((chat) => {
        const params = makePlanetParams(chat);

        const dateDelta = chat.oldest.getTime() - max;
        const distance = (1 - (dateDelta / maxDelta));
        const speedJitter =
            Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
        const speed = 1.5 + speedJitter;

        params.tooltip = `${chat.name}: ${prettyDate(chat.oldest)}`;
        params.movement = { distance, speed, type: "orbit" } as Orbit;
        return params;
    });
}

function recentMap(allChats: Chat[], chats: Chat[]): PlanetParameter[] {
    const [min, max] = minMax(allChats.map((c) => c.newest.getTime()));
    const maxDelta = min - max;

    return chats.map((chat) => {
        const params = makePlanetParams(chat);

        const dateDelta = chat.newest.getTime() - max;
        const distance = dateDelta / maxDelta;
        const speedJitter =
            Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
        const speed = 1.5 + speedJitter;
        params.tooltip = `${chat.name}: ${prettyDate(chat.newest)}`;
        params.movement = { distance, speed, type: "orbit" } as Orbit;

        return params;
    });
}

function responseTimeMap(allChats: Chat[], chats: Chat[]): PlanetParameter[] {
    const [min, max] = minMax(allChats.map((c) => c.responseTimeReceived));

    // TODO: Fix this for groups
    return chats
        .filter((c) => !c.isGroup)
        .map((chat) => {
            const params = makePlanetParams(chat);
            const time = chat.responseTimeReceived;

            const distance = Math.random();
            const speed = (1 - (time - max) / (min - max)) * 5 + 0.25;

            params.movement = { distance, speed, type: "orbit" } as Orbit;
            params.tooltip = `${chat.name}: ${Math.ceil(time / 60)} min`;
            return params;
        });
}

const DataTypeToBuildParams: {
    [key in DataTypeOption]: (
        allChats: Chat[],
        chats: Chat[]
    ) => PlanetParameter[];
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

function buildPlanets(
    allChats: Chat[],
    chats: Chat[],
    selectedDataType: DataTypeOption
) {
    const buildParams = DataTypeToBuildParams[selectedDataType];
    const planetParameters = buildParams(allChats, chats);
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

function Universe() {
    const { chats } = useChat();
    const [selectedDataType, setSelectedDataType] = useState<DataTypeOption>(
        DataTypeOption.MessageCount
    );
    const [filters, setFilters] = useState<Filter>({
        maxChats: 25,
        textFilter: "",
        filterGroups: false,
        filterContacts: false,
    });

    const navigate = useNavigate();

    const filteredChats = chats
        .filter((c) => {
            const query = filters.textFilter.toLowerCase().trim();
            if (filters.filterGroups && c.isGroup) return false;
            if (filters.filterContacts && !c.isGroup) return false;
            if (query.length > 0) return c.name.toLowerCase().includes(query);
            return true;
        })
        .slice(0, filters.maxChats);
    const planets = buildPlanets(chats, filteredChats, selectedDataType);


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
                    <Button
                        onClick={() => navigate("/settings")}
                    >
                        <IconSettings />
                    </Button>
                    <Filters setFilters={setFilters} filters={filters} chatLength={chats.length}/>
                </div>
                {planets}
                <Planet
                    link="/overview"
                    key="me"
                    size={100}
                    movement={{ distance: 0, degree: 0, type: "position" }}
                >
                    You
                </Planet>
            </div>
        </>
    );
}

export default Universe;
