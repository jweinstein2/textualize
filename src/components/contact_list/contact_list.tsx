import { useState, useEffect } from 'react';
import { Table } from '@mantine/core';
import axios from 'axios';

export type Contact = {
    name: string;
    number: string;
    message_count: number;
};

function ContactList() {
    const [contacts, setContacts] = useState<Contact[]>([]);

     useEffect(() => {
         axios.get('http://127.0.0.1:5000/list_numbers')
             .then((response) => {
                 const fetched = response.data.map((entry: any) => {
                     const name = entry.name
                     const number = entry.number
                     // TODO(jaredweinstein): Update API to do this calculation and add inequality
                     const message_count = entry.sent + entry.received
                     return {name, number, message_count};
                 })
                 setContacts(fetched);
             })
     }, []);

    function renderRows() {
        return contacts.map((contact) =>
        <Table.Tr key={contact.number}>
            <Table.Td>{contact.name}</Table.Td>
            <Table.Td>{contact.message_count}</Table.Td>
        </Table.Tr>);
    }

    return (
        <Table.ScrollContainer minWidth={800}>
            <Table highlightOnHover verticalSpacing="xs">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Total Messages</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{renderRows()}</Table.Tbody>
            </Table>
        </Table.ScrollContainer>
        );
}

export default ContactList

