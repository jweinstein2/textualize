import Planet from "@/components/universe/planet";
import { Button, Select } from "@mantine/core";
import { IconList, IconSettings } from "@tabler/icons-react";
import axios from "axios";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import classes from "./universe.module.css";

const SPEED_JITTER_THRESHOLD = 0.5;

enum DataTypeOption {
    MessageCount = "Messages Sent",
    Streak = "Longest Streak",
    Earliest = "First Message",
    Recent = "Most Recent Message",
    ResponseTime = "Your Response Time",
}

const messageCountMap = (
    data: any, // eslint-disable-line
    index: number,
    maxMessageCount: number,
): ReactElement => {
    const link = `/contacts/${data["number"]}`;
    const distance = (120 - (data["sent"] / maxMessageCount) * 100) * 5.5;
    const tooltip = `${data["name"]}:  ${data["sent"]} messages`;

    const speedJitter =
        Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
    return (
        <Planet
            firstName={data["first"]}
            lastName={data["last"]}
            tooltip={tooltip}
            size={40}
            movement={{ distance, speed: 1.5 + speedJitter, type: "orbit" }}
            key={index}
            link={link}
        />
    );
};

const streakMap = (
    data: any, // eslint-disable-line
    index: number,
    maxStreakCount: number,
): ReactElement => {
    const link = `/contacts/${data["number"]}`;
    const distance =
        (120 - (data["longest_streak"] / maxStreakCount) * 100) * 5.5;
    const tooltip = `${data["name"]}:  ${data["longest_streak"]} days`;

    const speedJitter =
        Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
    return (
        <Planet
            firstName={data["first"]}
            lastName={data["last"]}
            tooltip={tooltip}
            size={40}
            movement={{ distance, speed: 1.5 + speedJitter, type: "orbit" }}
            key={index}
            link={link}
        />
    );
};

function prettyDate(date: Date): string {
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

const earliestMap = (
    data: any, // eslint-disable-line
    index: number,
    firstDate: number,
    lastDate: number,
): ReactElement => {
    const link = `/contacts/${data["number"]}`;

    const date = new Date(data["oldest_date"]);
    const dataDate = date.getTime();
    const maxDelta = lastDate - firstDate;
    const dateDelta = dataDate - firstDate;
    const distance = (120 - (dateDelta / maxDelta) * 100) * 5.5;
    const tooltip = `${data["name"]}: ${prettyDate(date)}`;

    const speedJitter =
        Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
    return (
        <Planet
            firstName={data["first"]}
            lastName={data["last"]}
            tooltip={tooltip}
            size={40}
            movement={{ distance, speed: 1.5 + speedJitter, type: "orbit" }}
            key={index}
            link={link}
        />
    );
};

const recentMap = (
    data: any, // eslint-disable-line
    index: number,
    firstDate: number,
    lastDate: number,
): ReactElement => {
    const link = `/contacts/${data["number"]}`;

    const date = new Date(data["newest_date"]);
    const dataDate = date.getTime();
    const maxDelta = lastDate - firstDate;
    const dateDelta = dataDate - firstDate;
    const distance = (20 + (dateDelta / maxDelta) * 100) * 5.5;
    const tooltip = `${data["name"]}: ${prettyDate(date)}`;

    const speedJitter =
        Math.random() * SPEED_JITTER_THRESHOLD - SPEED_JITTER_THRESHOLD / 2;
    return (
        <Planet
            firstName={data["first"]}
            lastName={data["last"]}
            tooltip={tooltip}
            size={40}
            movement={{ distance, speed: 1.5 + speedJitter, type: "orbit" }}
            key={index}
            link={link}
        />
    );
};

const responseTimeMap = (
    data: any, // eslint-disable-line
    index: number,
    quickest: number,
    slowest: number,
): ReactElement => {
    const link = `/contacts/${data["number"]}`;

    const time = data["received_response_time"];
    const distance = (20 + Math.random() * 100) * 5.5;
    const tooltip = `${data["name"]}: ${Math.ceil(time / 60)} min`;
    const speed = (1 - (time - quickest) / (slowest - quickest)) * 5 + 0.25;

    return (
        <Planet
            firstName={data["first"]}
            lastName={data["last"]}
            tooltip={tooltip}
            size={40}
            movement={{ distance, speed, type: "orbit" }}
            key={index}
            link={link}
        />
    );
};

function Universe() {
    const [selectedDataType, setSelectedDataType] = useState<DataTypeOption>(
        DataTypeOption.MessageCount,
    );
    const [planetData, setPlanetData] = useState<[]>([]);
    const [planets, setPlanets] = useState<ReactElement[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://127.0.0.1:4242/list")
            .then((response) => {
                setPlanetData(response.data);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        switch (selectedDataType) {
            case DataTypeOption.MessageCount:
                const maxMessageCount = Math.max(
                    ...planetData.map((data) => data["sent"]),
                );
                const countPlanets = planetData.map((d, i) =>
                    messageCountMap(d, i, maxMessageCount),
                );
                setPlanets(countPlanets);
                break;
            case DataTypeOption.Streak:
                const maxStreakCount = Math.max(
                    ...planetData.map((data) => data["longest_streak"]),
                );
                const streakPlanets = planetData.map((d, i) =>
                    streakMap(d, i, maxStreakCount),
                );
                setPlanets(streakPlanets);
                break;
            case DataTypeOption.Earliest:
                const firstMessages = planetData.map((d) =>
                    new Date(d["oldest_date"]).getTime(),
                );
                const first = Math.max(...firstMessages);
                const last = Math.min(...firstMessages);

                const oldestPlanets = planetData.map((d, i) =>
                    earliestMap(d, i, first, last),
                );
                setPlanets(oldestPlanets);
                break;
            case DataTypeOption.Recent:
                const latestMessages = planetData.map((d) =>
                    new Date(d["newest_date"]).getTime(),
                );
                const firstLatest = Math.max(...latestMessages);
                const lastLatest = Math.min(...latestMessages);
                //
                const recentPlanets = planetData.map((d, i) =>
                    recentMap(d, i, firstLatest, lastLatest),
                );
                setPlanets(recentPlanets);
                break;
            case DataTypeOption.ResponseTime:
                const responseTimes = planetData.map(
                    (d) => d["received_response_time"],
                );
                const quickest = Math.max(...responseTimes);
                const slowest = Math.min(...responseTimes);

                const responseTimePlanets = planetData.map((d, i) =>
                    responseTimeMap(d, i, quickest, slowest),
                );
                setPlanets(responseTimePlanets);
                break;
            default:
                const exhaustiveCheck: never = selectedDataType;
                throw new Error(`Unhandled color case: ${exhaustiveCheck}`);
        }
    }, [planetData, selectedDataType]);

    return (
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
                <Button onClick={() => navigate("/chats")}>
                    <IconList />
                </Button>
            </div>
            <div className={classes.floatRight}>
                <Button onClick={() => navigate("/settings")} variant="light">
                    <IconSettings />
                </Button>
            </div>
            {planets}
            <Planet
                firstName="Jared"
                lastName="Weinstein"
                link="/overview"
                key="me"
                size={100}
                movement={{ distance: 0, degree: 0, type: "position" }}
            ></Planet>
        </div>
    );
}

export default Universe;
