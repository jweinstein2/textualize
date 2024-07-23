import { Button  } from 'framework7-react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Skeleton, Container } from '@mantine/core';
import { useParams } from 'react-router';
import { LineChart } from '@mantine/charts';
import { notifications } from '@mantine/notifications';
import { showError } from '@/util'
import Bubble from '@/components/message/bubble'

export type FrequencyDay = {
    date: string;
    sent: number;
    recieved: number;
};

export type Sentiment = {
    pos_sent: string[];
    neg_sent: string[];
    pos_received: string[];
    neg_received: string[];
}

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
             .catch(() => showError("Failed to load contact data", "Frequency graph could not be generated"))
     }, []);

     useEffect(() => {
         axios.get(`http://127.0.0.1:4242/contact/${params.number}`)
             .then((response) => setName(response.data.name))
             .catch(() => showError("Failed to load data", "Contact info not found"))
     }, []);

     useEffect(() => {
         axios.get(`http://127.0.0.1:4242/sentiment/${params.number}`)
             .then((response) => {setSentiment(response.data); console.log(response.data)})
             .catch(() => showError("Failed to load data", "Sentiment info not found"))
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
            <h3>Sentiment</h3>
            <h5>Positive</h5>
            <div>
                <Bubble message={sentiment?.pos_sent[0]} isSent></Bubble>
                <Bubble message={sentiment?.pos_sent[1]} isSent></Bubble>
                <Bubble message={sentiment?.pos_sent[2]} isSent></Bubble>
                <Bubble message={sentiment?.pos_received[0]}></Bubble>
                <Bubble message={sentiment?.pos_received[1]}></Bubble>
                <Bubble message={sentiment?.pos_received[2]}></Bubble>
            </div>
            <h5>Negative</h5>
                <Bubble message={sentiment?.neg_sent[0]} isSent></Bubble>
                <Bubble message={sentiment?.neg_sent[1]} isSent></Bubble>
                <Bubble message={sentiment?.neg_sent[2]} isSent></Bubble>
                <Bubble message={sentiment?.neg_received[0]}></Bubble>
                <Bubble message={sentiment?.neg_received[1]}></Bubble>
                <Bubble message={sentiment?.neg_received[2]}></Bubble>
        </Container>
        )
}

export default Contact
