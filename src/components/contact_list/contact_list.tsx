import { Table } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type Contact = {
    name: string;
    number: string;
    message_count: number;
};

function ContactList() {
    const [contacts, setContacts] = useState<Contact[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://127.0.0.1:4242/list_numbers").then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fetched = response.data.map((entry: any) => {
                const name = entry.name;
                const number = entry.number;
                const message_count = entry.sent + entry.received;
                return { name, number, message_count };
            });
            setContacts(fetched);
        });
    }, []);

    function renderRows() {
        return contacts.map((contact) => (
            <Table.Tr
                key={contact.number}
                onClick={() => navigate(contact.number)}
            >
                <Table.Td>{contact.name}</Table.Td>
                <Table.Td>{contact.message_count}</Table.Td>
            </Table.Tr>
        ));
    }

    return (
        <div>
            <h2>Contacts</h2>
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
        </div>
    );
}

export default ContactList;
