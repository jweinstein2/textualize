import { groupName } from "@/util";
import axios from "axios";
import { useEffect, useState } from "react";
import { Routes as ReactRoutes, Route } from "react-router-dom";

import ChatList from "./chat_list/chat_list";
import Universe from "./universe/universe";

export type Chat = {
    name: string;
    id: string;
    countTotal: number;
    oldest: Date;
    newest: Date;
    longestStreak: number;
    isGroup: boolean;
    detailsLink: string;
    responseTimeReceived: number;
    responseTimeSent: number;
};

function Chats() {
    const [chats, setChats] = useState<Chat[]>([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:4242/chats").then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fetched = response.data.map((entry: any) => {
                const isGroup = entry.is_group;
                const name = isGroup
                    ? groupName(entry.members, entry.name)
                    : entry.name;
                const id = isGroup ? entry.id : entry.number;
                const countTotal = entry.count_total;
                const oldest = new Date(entry.oldest_date);
                const newest = new Date(entry.newest_date);
                const longestStreak = entry.longest_streak;
                const responseTimeReceived = entry.received_response_time;
                const responseTimeSent = entry.sent_response_time;
                const detailsLink = isGroup
                    ? `/groups/${id}`
                    : `/contacts/${id}`;
                return {
                    name,
                    id,
                    countTotal,
                    oldest,
                    newest,
                    longestStreak,
                    detailsLink,
                    isGroup,
                    responseTimeReceived,
                    responseTimeSent,
                };
            });
            setChats(fetched);
        });
    }, []);

    return (
        <ReactRoutes>
            <Route path="/*" element={<ChatList chats={chats} />} />
            <Route path="/list" element={<ChatList chats={chats} />} />
            <Route path="/universe" element={<Universe chats={chats} />} />
        </ReactRoutes>
    );
}

export default Chats;
