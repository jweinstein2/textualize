import { useState, useEffect } from 'react';
import { Table } from '@mantine/core';
import axios from 'axios';

export type Group = {
  name: string;
  id: string;
  message_count: number;
  people: number;
};

function GroupList() {
    const [groups, setGroups] = useState<Group[]>([]);

     useEffect(() => {
         axios.get('http://127.0.0.1:5000/list_groups')
             .then((response) => {
                 const fetched = response.data.map((entry: any) => {
                     const name = entry.name
                     const id = entry.id
                     const message_count = entry.count
                     const people = entry.people
                     return {name, id, message_count, people};
                 })
                 setGroups(fetched);
             })
     }, []);

    function renderRows() {
        return groups.map((group) =>
        <Table.Tr key={group.id}>
            <Table.Td>{group.name}</Table.Td>
            <Table.Td>{group.message_count}</Table.Td>
        </Table.Tr>);
    }

    return (
        <Table.ScrollContainer minWidth={800}>
            <Table highlightOnHover verticalSpacing="xs">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Total Messages</Table.Th>
                        <Table.Th>Activity</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{renderRows()}</Table.Tbody>
            </Table>
        </Table.ScrollContainer>
        );
}

export default GroupList