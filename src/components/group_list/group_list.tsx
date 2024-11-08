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

export type Group = {
    name: string;
    id: string;
    message_count: number;
    people: number;
    members: string[];
    oldest: Date;
    newest: Date;
};

interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort(): void;
}

function GroupList() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [sortedGroups, setSortedGroups] = useState<Group[]>([]);
    const [sortBy, setSortBy] = useState<keyof Group | null>(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://127.0.0.1:4242/list_groups").then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fetched = response.data.map((entry: any) => {
                const name = entry.name || entry.members.join(", ");
                const id = entry.id;
                const message_count = entry.count;
                const people = entry.people;
                const members = entry.members;
                const oldest = new Date(entry.oldest_date);
                const newest = new Date(entry.newest_date);
                return {
                    name,
                    id,
                    message_count,
                    people,
                    members,
                    oldest,
                    newest,
                };
            });
            setGroups(fetched);
            setSortedGroups(fetched);
        });
    }, []);

    function setSorting(field: keyof Group) {
        const reversed = field === sortBy ? !reverseSortDirection : true;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedGroups(sortData(groups, field, reversed, search));
    }

    function sortData(
        data: Group[],
        sortBy: keyof Group | null,
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

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.currentTarget;
        setSearch(value);
        setSortedGroups(sortData(groups, sortBy, reverseSortDirection, value));
    }

    function filter(data: Group[], search: string) {
        const query = search.toLowerCase().trim();
        return data.filter((item) =>
            keys(data[0]).some((key) =>
                String(item[key]).toLowerCase().includes(query)
            )
        );
    }

    function prettyDate(date: Date): string {
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
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

    function truncateWithEllipses(text: string, max: number) {
        return text.substr(0, max - 1) + (text.length > max ? "..." : "");
    }

    function renderRows() {
        return sortedGroups.map((group) => (
            <Table.Tr
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
            >
                <Table.Td>{truncateWithEllipses(group.name, 40)}</Table.Td>
                <Table.Td>{group.message_count}</Table.Td>
                <Table.Td>{prettyDate(group.oldest)}</Table.Td>
                <Table.Td>{prettyDate(group.newest)}</Table.Td>
            </Table.Tr>
        ));
    }

    return (
        <div>
            <h2>Groups</h2>
            <Table.ScrollContainer minWidth={800}>
                <TextInput
                    placeholder="Search by any field"
                    mb="md"
                    leftSection={<IconSearch />}
                    value={search}
                    onChange={handleSearchChange}
                />
                <Table highlightOnHover verticalSpacing="xs">
                    <Table.Tbody>
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
                                Message Count
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
                        </Table.Tr>
                    </Table.Tbody>
                    <Table.Tbody>{renderRows()}</Table.Tbody>
                </Table>
            </Table.ScrollContainer>
        </div>
    );
}

export default GroupList;
