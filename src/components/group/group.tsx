import { Container } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { FrequencyDay } from '@/components/contact/contact'
import axios from 'axios';
import { showError } from '@/util'

function Group () {
    const [frequency, setFrequency] = useState<FrequencyDay[]>([]);

    const params= useParams()

    useEffect(() => {
        axios.get(`http://127.0.0.1:4242/group_frequency/${params.id}`)
            .then((response) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fetched = response.data.map((entry: any) => {
                    const date = entry.Label
                    const sent = entry.Sent
                    const received = entry.Received
                    return {date, sent, received};
                })
                setFrequency(fetched)
            })
            .catch(() => showError("Failed to load group data", "Frequency graph could not be generated"))
    }, []);

    return (
        <Container fluid>
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

export default Group
