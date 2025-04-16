import { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { groupName } from "@/util";
import axios from "axios";

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

type ChatContextType = {
  chats: Chat[];
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
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
    <ChatContext.Provider value={{chats}}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
