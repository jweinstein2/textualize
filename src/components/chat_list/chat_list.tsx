import {
    Button,
    Center,
    Group,
    Table,
    Text,
    TextInput,
    UnstyledButton,
    keys,
} from "@mantine/core";
import { IconSettings, IconUniverse } from "@tabler/icons-react";
import {
    IconChevronDown,
    IconChevronUp,
    IconSearch,
    IconSelector,
} from "@tabler/icons-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import classes from "./chat_list.module.css";

export type Chat = {
    name: string;
    number: string;
    message_count: number;
    oldest: Date;
    newest: Date;
    longestStreak: number;
};

interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort(): void;
}

function prettyDate(date: Date): string {
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function ChatList() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [search, setSearch] = useState("");
    const [sortedContacts, setSortedContacts] = useState<Chat[]>([]);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);
    const [sortBy, setSortBy] = useState<keyof Chat | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://127.0.0.1:4242/list_numbers").then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fetched = response.data.map((entry: any) => {
                const name = entry.name;
                const number = entry.number;
                const message_count = entry.sent + entry.received;
                const oldest = new Date(entry.oldest_date);
                const newest = new Date(entry.newest_date);
                const longestStreak = entry.longest_streak;
                return {
                    name,
                    number,
                    message_count,
                    oldest,
                    newest,
                    longestStreak,
                };
            });
            setChats(fetched);
            setSortedContacts(fetched);
        });
    }, []);

    function setSorting(field: keyof Chat) {
        const reversed = field === sortBy ? !reverseSortDirection : true;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedContacts(sortData(chats, field, reversed, search));
    }

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.currentTarget;
        setSearch(value);
        setSortedContacts(sortData(chats, sortBy, reverseSortDirection, value));
    }

    function sortData(
        data: Chat[],
        sortBy: keyof Chat | null,
        reversed: boolean,
        search: string
    ) {
        const sorted = !sortBy
            ? [...data]
            : [...data].sort((a, b) => {
                  if (a[sortBy] == b[sortBy]) return 0;
                  return a[sortBy] > b[sortBy] ? 1 : -1;
              });
        if (reversed) sorted.reverse();
        return filter(sorted, search);
    }

    function filter(data: Chat[], search: string) {
        const query = search.toLowerCase().trim();
        return data.filter((item) =>
            keys(data[0]).some((key) =>
                String(item[key]).toLowerCase().includes(query)
            )
        );
    }

    function Th({ children, reversed, sorted, onSort }: ThProps) {
        const Icon = sorted
            ? reversed
                ? IconChevronUp
                : IconChevronDown
            : IconSelector;
        return (
            <Table.Th>
                <UnstyledButton onClick={onSort}>
                    <Group justify="space-between">
                        <Text fw={500} fz="sm">
                            {children}
                        </Text>
                        <Center>
                            <Icon />
                        </Center>
                    </Group>
                </UnstyledButton>
            </Table.Th>
        );
    }

    function renderRows() {
        return sortedContacts.map((contact) => (
            <Table.Tr
                key={contact.number}
                onClick={() => navigate(`/contacts/${contact.number}`)}
            >
                <Table.Td>{contact.name}</Table.Td>
                <Table.Td>{contact.message_count}</Table.Td>
                <Table.Td>{prettyDate(contact.oldest)}</Table.Td>
                <Table.Td>{prettyDate(contact.newest)}</Table.Td>
                <Table.Td>{contact.longestStreak}</Table.Td>
            </Table.Tr>
        ));
    }

    const table = (
        <Table.ScrollContainer minWidth={800}>
            <TextInput
                placeholder="Search by name"
                mb="md"
                leftSection={<IconSearch />}
                value={search}
                onChange={handleSearchChange}
            />
            <Table highlightOnHover verticalSpacing="xs">
                <Table.Thead>
                    <Table.Tr>
                        <Th
                            sorted={sortBy === "name"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("name")}
                        >
                            Name
                        </Th>
                        <Th
                            sorted={sortBy === "message_count"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("message_count")}
                        >
                            Total Messages
                        </Th>
                        <Th
                            sorted={sortBy === "oldest"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("oldest")}
                        >
                            First Sent
                        </Th>
                        <Th
                            sorted={sortBy === "newest"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("newest")}
                        >
                            Last Sent
                        </Th>
                        <Th
                            sorted={sortBy === "longestStreak"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("longestStreak")}
                        >
                            Longest Streak
                        </Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{renderRows()}</Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );

    return (
        <div className={classes.container}>
            <div className={classes.table}>
                <h2 className={classes.header}>
                    <Button
                        className={classes.backButton}
                        onClick={() => navigate("/")}
                    >
                        <IconUniverse />
                    </Button>
                    Chats
                    <Button
                        variant="light"
                        className={classes.settings}
                        onClick={() => navigate("/settings")}
                    >
                        <IconSettings />
                    </Button>
                </h2>
                {table}
            </div>
        </div>
    );
}

export default ChatList;
