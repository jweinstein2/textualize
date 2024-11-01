import { Table } from "@mantine/core";
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

function GroupList() {
    const [groups, setGroups] = useState<Group[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://127.0.0.1:4242/list_groups").then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fetched = response.data.map((entry: any) => {
                const name = entry.name;
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
        });
    }, []);

    function groupName(group: Group): string {
        if (group.name) return group.name;
        return group.members.join(", ");
    }

    function prettyDate(date: Date): string {
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function renderRows() {
        return groups.map((group) => (
            <Table.Tr
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
            >
                <Table.Td>{groupName(group)}</Table.Td>
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
                <Table highlightOnHover verticalSpacing="xs">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Total Messages</Table.Th>
                            <Table.Th>Oldest Message</Table.Th>
                            <Table.Th>Newest Message</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{renderRows()}</Table.Tbody>
                </Table>
            </Table.ScrollContainer>
        </div>
    );
}

export default GroupList;
