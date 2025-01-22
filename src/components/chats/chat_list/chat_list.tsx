import { prettyDate } from "@/util";
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
import { IconSettings, IconUniverse, IconUsers } from "@tabler/icons-react";
import {
    IconChevronDown,
    IconChevronUp,
    IconSearch,
    IconSelector,
} from "@tabler/icons-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import classes from "./chat_list.module.css";

import { Chat } from "../chats";

interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort(): void;
}

function ChatList({ chats }: { chats: Chat[] }) {
    const [search, setSearch] = useState("");
    const [reverseSortDirection, setReverseSortDirection] = useState(false);
    const [sortBy, setSortBy] = useState<keyof Chat | null>(null);

    const navigate = useNavigate();

    function setSorting(field: keyof Chat) {
        const reversed = field === sortBy ? !reverseSortDirection : true;
        setReverseSortDirection(reversed);
        setSortBy(field);
    }

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.currentTarget;
        setSearch(value);
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

    const sortedContacts = sortData(
        chats,
        sortBy,
        reverseSortDirection,
        search
    );

    function renderRows() {
        return sortedContacts.map((contact) => (
            <Table.Tr
                key={contact.id}
                onClick={() => navigate(contact.detailsLink)}
            >
                <Table.Td>
                    {contact.isGroup ? (
                        <IconUsers className={classes.groupIcon} />
                    ) : (
                        <></>
                    )}
                    {contact.name}
                </Table.Td>
                <Table.Td>{contact.countTotal}</Table.Td>
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
                            sorted={sortBy === "countTotal"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("countTotal")}
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
                <div className={classes.header}>
                    <div className={classes.headerLeft}>
                        <h2>
                            <Button
                                className={classes.backButton}
                                onClick={() => navigate("universe")}
                            >
                                <IconUniverse />
                            </Button>
                            Chats
                        </h2>
                    </div>

                    <Button
                        variant="light"
                        onClick={() => navigate("/settings")}
                    >
                        <IconSettings />
                    </Button>
                </div>
                {table}
            </div>
        </div>
    );
}

export default ChatList;
