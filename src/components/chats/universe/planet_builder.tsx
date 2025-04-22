import {Chat} from "@/components/chats/ChatContext"
import { minMax, prettyDate } from "@/util";

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

const SPEED_JITTER_THRESHOLD = 0.5;

export type Movement = Orbit | Position;

export interface PlanetParameter {
    movement: Movement;
    tooltip: string;
    size: number;
    key: string;
    link: string;
    contents: ReactNode;
    currentRadius: number;
    currentAngle: number;
}

function makePlanetParams(chat: Chat): PlanetParameter {
    return {
        size: 40,
        tooltip: chat.name,
        key: chat.id,
        link: buildLink(chat),
        movement: { distance: 0, degree: 0, type: "position" } as Position,
        contents: <>{buildName(chat)}</>,
        currentRadius: 0,
        currentAngle: 0,
    };
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


function buildLink(chat: Chat): string {
    if (chat.isGroup) {
        return `/groups/${chat.id}`;
    } else {
        return `/contacts/${chat.id}`;
    }
}

export class buildFunctions {
    static byMessageCount = messageCountMap;
    static byStreak = streakMap;
    static byEarliest = earliestMap;
    static byRecent = recentMap;
    static byResponseTime = responseTimeMap;
}

function messageCountMap(chats: Chat[]): PlanetParameter[] {
    const [, max] = minMax(chats.map((c) => c.countTotal));

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

function streakMap(chats: Chat[]): PlanetParameter[] {
    const [, max] = minMax(chats.map((c) => c.longestStreak));

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

function earliestMap(chats: Chat[]): PlanetParameter[] {
    const [min, max] = minMax(chats.map((c) => c.oldest.getTime()));
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

function recentMap(chats: Chat[]): PlanetParameter[] {
    const [min, max] = minMax(chats.map((c) => c.newest.getTime()));
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

function responseTimeMap(chats: Chat[]): PlanetParameter[] {
    const [min, max] = minMax(chats.map((c) => c.responseTimeReceived));

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

