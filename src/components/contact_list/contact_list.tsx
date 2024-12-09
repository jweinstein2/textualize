import {
    Center,
    Group,
    Table,
    Text,
    TextInput,
    UnstyledButton,
    keys,
} from "@mantine/core";
import {
    IconChevronDown,
    IconChevronUp,
    IconSearch,
    IconSelector,
} from "@tabler/icons-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type Contact = {
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

function ContactList() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [search, setSearch] = useState("");
    const [sortedContacts, setSortedContacts] = useState<Contact[]>([]);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);
    const [sortBy, setSortBy] = useState<keyof Contact | null>(null);

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
            setContacts(fetched);
            setSortedContacts(fetched);
        });
    }, []);

    function setSorting(field: keyof Contact) {
        const reversed = field === sortBy ? !reverseSortDirection : true;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedContacts(sortData(contacts, field, reversed, search));
    }

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.currentTarget;
        setSearch(value);
        setSortedContacts(
            sortData(contacts, sortBy, reverseSortDirection, value)
        );
    }

    function sortData(
        data: Contact[],
        sortBy: keyof Contact | null,
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

    function filter(data: Contact[], search: string) {
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
                onClick={() => navigate(contact.number)}
            >
                <Table.Td>{contact.name}</Table.Td>
                <Table.Td>{contact.message_count}</Table.Td>
                <Table.Td>{prettyDate(contact.oldest)}</Table.Td>
                <Table.Td>{prettyDate(contact.newest)}</Table.Td>
                <Table.Td>{contact.longestStreak}</Table.Td>
            </Table.Tr>
        ));
    }

    return (
        <div>
            <h2>Contacts</h2>
            <Table.ScrollContainer minWidth={800}>
                <TextInput
                    placeholder="Search by any field"
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
        </div>
    );
}

export default ContactList;
