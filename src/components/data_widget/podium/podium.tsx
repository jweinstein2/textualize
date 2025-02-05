import ContactIcon from "@/components/contact_icon/contact_icon";
import { FormatType, format as utilFormat } from "@/util";
import { Center } from "@mantine/core";
import React from "react";

import c from "./podium.module.css";

interface PodiumProps {
    leaderboard: { name: string; value: number; id: string }[];
    format?: FormatType;
}

function Podium({ format, leaderboard }: PodiumProps) {
    function value(index: number) {
        const v = leaderboard[index].value;
        return format != null ? utilFormat(v, format) : `${v}`;
    }

    return (
        <Center>
            <div className={c.container}>
                <div key={leaderboard[1].id} className={c.second}>
                    <div className={c.stand}>
                        <div className={c.bubble}>
                            <ContactIcon text="" size={60}></ContactIcon>
                        </div>
                        <div className={c.name}>{leaderboard[1].name}</div>
                        <div>{value(1)}</div>
                    </div>
                    <Center>
                        <div className={`${c.medal} ${c.silver}`}>2</div>
                    </Center>
                </div>
                <div key={leaderboard[0].id} className={c.first}>
                    <div className={c.stand}>
                        <div className={c.bubble}>
                            <ContactIcon text="" size={70}></ContactIcon>
                        </div>
                        <div className={c.name}>{leaderboard[0].name}</div>
                        <div>{value(0)}</div>
                    </div>
                    <Center>
                        <div className={`${c.medal} ${c.gold}`}>1</div>
                    </Center>
                </div>
                <div key={leaderboard[2].id} className={c.third}>
                    <div className={c.stand}>
                        <div className={c.bubble}>
                            <ContactIcon text="" size={60}></ContactIcon>
                        </div>
                        <div className={c.name}>{leaderboard[2].name}</div>
                        <div>{value(2)}</div>
                    </div>
                    <Center>
                        <div className={`${c.medal} ${c.bronze}`}>3</div>
                    </Center>
                </div>
            </div>
        </Center>
    );
}

export default Podium;
