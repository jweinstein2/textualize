import { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Skeleton, Container } from '@mantine/core';
import { useParams } from 'react-router';
import { LineChart } from '@mantine/charts';
import { notifications } from '@mantine/notifications';
import { showError } from '@/util'

export type FrequencyDay = {
    date: string;
    sent: number;
    recieved: number;
};

function Contact() {
    const [frequency, setFrequency] = useState<FrequencyDay[]>([]);
    const [name, setName] = useState("")

    const params= useParams()

     useEffect(() => {
         axios.get(`http://127.0.0.1:4242/frequency/${params.number}`)
             .then((response) => {
                 const fetched = response.data.map((entry: any) => {
                     const date = entry.Label
                     const sent = entry.Sent
                     const received = entry.Received
                     return {date, sent, received};
                 })
                 setFrequency(fetched)
             })
             .catch(() => showError("Failed to load data", "Frequency graph could not be generated"))
     }, []);

     useEffect(() => {
         axios.get(`http://127.0.0.1:4242/contact/${params.number}`)
             .then((response) => setName(response.data.name))
             .catch(() => showError("Failed to load data", "Contact info not found"))
     }, []);

    return (
        <Container fluid>
            <h2>{name}</h2>
            <LineChart
                h={300}
                data={frequency}
                dataKey="date"
                series={[
                    { name: 'sent', color: 'green.6' },
                { name: 'received', color: 'blue.6' }]}
                curveType="linear"
                tickLine="x"
                withDots={false}
            />
        </Container>
        )
}

export default Contact
