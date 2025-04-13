import Card from "@/components/card/card";
import DataWidget from "@/components/data_widget/data_widget";
import useVisNetwork from "@/components/network/useVisNetwork";
import { showError } from "@/util";
import { LineChart } from "@mantine/charts";
import { Button, Center, Container, Grid, Stack, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {StateMap} from "@/components/map/StateMap";

import classes from "./summary.module.css";

const options = {
    edges: {
        color: "#000000",
    },
    physics: {
        stabilization: {
            enabled: true,
        },
        timestep: 0.3, // Required to avoid the shakes
    },
};

// TODO: Move to type file
export type FrequencyDay = {
    date: string;
    sent: number;
    recieved: number;
};

function Summary() {
    const [edges, setEdges] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [frequency, setFrequency] = useState<FrequencyDay[]>([]);

    const navigate = useNavigate();
    const { ref } = useVisNetwork({
        options,
        edges,
        nodes,
    });

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/frequency/`)
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

    function fetchGroupData() {
        axios
            .get(`http://127.0.0.1:4242/group_connection_graph`)
            .then((response) => {
                const edges = response.data.edges;
                const nodes = response.data.nodes;
                setEdges(edges);
                setNodes(nodes);
            })
            .catch((err) => {
                showError(
                    "Failed to load data",
                    "Connection graph could not be generated"
                );
                console.log(err);
            });
    }

    // TODO: Let user select min group chat size and node count
    function connectionGraph() {
        if (nodes.length === 0) {
            return (
                <Center style={{ height: "100%" }}>
                    <Stack align="flex-start" justify="center">
                        <Text c="gray">
                            The graph may take some time to build.
                        </Text>
                        <Button onClick={fetchGroupData}>Generate</Button>
                    </Stack>
                </Center>
            );
        }

        return <div style={{ height: "100%", width: "100%" }} ref={ref} />;
    }

    return (
        <Container fluid className={classes.container}>
            <h2>
                <Button
                    className={classes.backButton}
                    onClick={() => navigate(-1)}
                >
                    <IconArrowLeft />
                </Button>
                Summary
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
                <Card title="Most Active" span={6}>
                    <DataWidget fetchPath="/summary/activity" />
                </Card>
                <Card title="Response Time" span={6}>
                    <DataWidget fetchPath="/summary/responsetime" />
                </Card>
                {/*
                <Card title="Group Connection Graph" span={12} height={600}>
                    {connectionGraph()}
                </Card>
                */}
                <Card title="Contact Locations" span={6} height={800}>
                    <StateMap />
                </Card>
            </Grid>
        </Container>
    );
}

export default Summary;
