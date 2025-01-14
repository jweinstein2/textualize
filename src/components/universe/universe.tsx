import Planet from "@/components/universe/planet";
import { Select } from "@mantine/core";
import axios from "axios";
import { useEffect, useState, ReactElement } from "react";


import classes from "./universe.module.css";

const SPEED_JITTER_THRESHOLD = .5;

// eslint-disable-next-line
const messageCountMap = (data: any, index: number, maxMessageCount: number): ReactElement => {
        console.log(maxMessageCount)
        const link = `/contacts/${data['number']}`;
        const distance = (120 - (data['sent'] / maxMessageCount) * 100) * 5.5
        const tooltip = `${data['name']}:  ${data['sent']} messages`

    const speedJitter = Math.random() * SPEED_JITTER_THRESHOLD - (SPEED_JITTER_THRESHOLD / 2);
    return <Planet firstName={data['first']} lastName={data['last']}
                   tooltip={tooltip} size={40}
                   movement={{distance, speed: 1.5 + speedJitter, type: "orbit"}}
                   key={index} link={link} />
}

// eslint-disable-next-line
const streakMap = (data: any, index: number, maxStreakCount: number): ReactElement => {
        const link = `/contacts/${data['number']}`;
        const distance = (120 - (data['longest_streak'] / maxStreakCount) * 100) * 5.5
        const tooltip = `${data['name']}:  ${data['longest_streak']} days`

    const speedJitter = Math.random() * SPEED_JITTER_THRESHOLD - (SPEED_JITTER_THRESHOLD / 2);
    return <Planet firstName={data['first']} lastName={data['last']}
                   tooltip={tooltip} size={40}
                   movement={{distance, speed: 1.5 + speedJitter, type: "orbit"}}
                   key={index} link={link} />
}

enum DataTypeOption {
    MessageCount = "Messages Sent",
    Streak = "Longest Streak",
}

function Universe() {
    const [selectedDataType, setSelectedDataType] = useState<DataTypeOption>(DataTypeOption.MessageCount);
    const [planetData, setPlanetData] = useState<[]>([]);
    const [planets, setPlanets] = useState<ReactElement[]>([])

    useEffect(() => {
        axios
            .get("http://127.0.0.1:4242/list")
            .then((response) => {
                setPlanetData(response.data)
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        switch (selectedDataType) {
            case DataTypeOption.MessageCount:
                const maxMessageCount = Math.max(...(planetData.map((data) => data['sent'])))
                const countPlanets = planetData.map((d, i) => messageCountMap(d, i, maxMessageCount))
                setPlanets(countPlanets)
                break;
            case DataTypeOption.Streak:
                const maxStreakCount = Math.max(...planetData.map((data) => data['longest_streak']))
                const streakPlanets = planetData.map((d, i) => streakMap(d, i, maxStreakCount))
                setPlanets(streakPlanets)
                break;
            default:
              const exhaustiveCheck: never = selectedDataType;
              throw new Error(`Unhandled color case: ${exhaustiveCheck}`);

        }
    }, [planetData, selectedDataType]);

    return (
        <div className={classes.background}>
            <Select
                className={classes.select}
                data={Object.values(DataTypeOption)}
                value={selectedDataType}
                onChange={(value) => setSelectedDataType(value as DataTypeOption)}
                allowDeselect={false}
                size="md"
            />
            {planets}
            <Planet firstName="Jared" lastName="Weinstein"
                    link="/overview"
                    key="me" size={100}
                    movement={{distance: 0, degree: 0, type: "position"}}>
            </Planet>
        </div>
    );
}

export default Universe;
