import Card from "@/components/card/card";
import DataWidget from "@/components/data_widget/data_widget";
import { showError } from "@/util";
import { LineChart } from "@mantine/charts";
import { Button, Container } from "@mantine/core";
import {  Grid } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";

import classes from "./contact.module.css";

export type FrequencyDay = {
    date: string;
    sent: number;
    recieved: number;
};

export type SentimentData = {
    pos_sent: string[];
    neg_sent: string[];
    pos_received: string[];
    neg_received: string[];
};

function Contact() {
    const [frequency, setFrequency] = useState<FrequencyDay[]>([]);
    const [name, setName] = useState("");

    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/frequency/${params.number}`)
            .then((response) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fetched = response.data.map((entry: any) => {
                    const date = entry.Label;
                    const sent = entry.Sent;
                    const received = entry.Received;
                    return { date, sent, received };
                });
                setFrequency(fetched);
            })
            .catch(() =>
                showError(
                    "Failed to load contact data",
                    "Frequency graph could not be generated"
                )
            );
    }, []);

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/contact/${params.number}`)
            .then((response) => setName(response.data.name))
            .catch(() =>
                showError("Failed to load data", "Contact info not found")
            );
    }, []);

    return (
        <Container fluid>
            <h2>
                <Button
                    className={classes.backButton}
                    onClick={() => navigate(-1)}
                >
                    <IconArrowLeft />
                </Button>
                {name}
            </h2>
            <LineChart
                h={200}
                data={frequency}
                dataKey="date"
                series={[
                    { name: "sent", color: "green.6" },
                    { name: "received", color: "blue.6" },
                ]}
                curveType="linear"
                tickLine="x"
                withYAxis={false}
                withDots={false}
            />
            <h3>General</h3>
            <Grid>
                <Card title="Message Count" span={3}>
                    <DataWidget fetchPath={`/chat/${params.number}/count`} />
                </Card>
                <Card title="Oldest Message" span={3}>
                    <DataWidget
                        fetchPath={`/chat/${params.number}/firstmessage`}
                    />
                </Card>
                <Card title="Response Time" span={3}>
                    <DataWidget
                        fetchPath={`/chat/${params.number}/responsetime`}
                    />
                </Card>
                <Card title="Text Inequality (TODO)" span={3} />
                <Card title="Message Time" span={6} >
                    <DataWidget fetchPath={`/chat/${params.number}/messages_by_time`} />
                </Card>
                <Card title="Top Groups" span={6} >
                    <DataWidget fetchPath={`/chat/${params.number}/top_groups`} />
                </Card>
                <Card title="Longest Streak" span={3}>
                    <DataWidget fetchPath={`/chat/${params.number}/streak`} />
                </Card>
                <Card title="Double Texts (TODO)" span={3} />
                <Card title="TODO" span={3} />
                <Card title="TODO" span={3} />
            </Grid>
            <h3>Language</h3>
            <Grid>
                <Card title="Common Words" span={6} height={380}>
                    <DataWidget
                        fetchPath={`/chat/${params.number}/wordcloud`}
                    />
                </Card>
                <Card title="Commonly Mispelled (TODO)" span={6} />
                <Card title="Sentiment" span={4}>
                    <DataWidget
                        fetchPath={`/chat/${params.number}/sentiment`}
                    />
                </Card>
            </Grid>
            <h3>Emoji & Tapback</h3>
            <Grid>
                <Card title="Emoji Usage" span={3}>
                    <DataWidget fetchPath={`/chat/${params.number}/emoji`} />
                </Card>
                <Card title="Emoji Density (TODO)" span={4} />
                <Card title="Usage over Time (TODO)" span={12} />
                <Card title="Linguistic Diversity (TODO)" span={3} />
                <Card title="Tapback Density (TODO)" span={4} />
                <Card title="Tapback Graph (TODO)" span={6} />
                <Card title="Tapbacks over Time (TODO)" span={12} />
            </Grid>
        </Container>
    );
}

export default Contact;
