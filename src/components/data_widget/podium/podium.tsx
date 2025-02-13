import ContactIcon from "@/components/contact_icon/contact_icon";
import { FormatType, format as utilFormat, idPath } from "@/util";
import { Center, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import c from "./podium.module.css";

// TODO: Replace w. generic contact type
interface Chat {
    name: string;
    value: number; 
    id: string;
}

interface PodiumProps {
    leaderboard: Chat[];
    format?: FormatType;
}

function Podium({ format, leaderboard }: PodiumProps) {
    const navigate = useNavigate();


    function value(index: number) {
        const v = leaderboard[index].value;
        return format != null ? utilFormat(v, format) : `${v}`;
    }

    function navigateToId(id: string) {
        const path = idPath(id)
        navigate(path);
    }

    function buildPodium(index: number, size: number) {
        const containerClass = [c.first, c.second, c.third][index];
        const medalClass = [c.gold, c.silver, c.bronze][index];

        if (leaderboard.length <= index) {
            return (
                    <div key={index} className={containerClass} onClick={() => navigateToId(leaderboard[index].id)}>
                        <div className={c.stand}>
                            <Center style={{"height": "90%"}}>
                                <Text fs="italic">No Data</Text>
                            </Center>
                        </div>
                        <Center>
                            <div className={`${c.medal} ${medalClass}`}>{index + 1}</div>
                        </Center>
                    </div>)
        }

        return (
                <div key={index} className={containerClass} onClick={() => navigateToId(leaderboard[index].id)}>
                    <div className={c.stand}>
                        <div className={c.bubble}>
                            <ContactIcon text="" size={size}></ContactIcon>
                        </div>
                        <div className={c.name}>{leaderboard[index].name}</div>
                        <div>{value(index)}</div>
                    </div>
                    <Center>
                        <div className={`${c.medal} ${medalClass}`}>{index + 1}</div>
                    </Center>
                </div>)
    };

    return (
        <Center>
            <div className={c.container}>
                {buildPodium(1, 60)}
                {buildPodium(0, 70)}
                {buildPodium(2, 60)}
            </div>
        </Center>
    );
}

export default Podium;
