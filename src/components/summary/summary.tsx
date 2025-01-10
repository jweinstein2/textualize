import useVisNetwork from "@/components/network/useVisNetwork";
import { showError } from "@/util";
import { Button, Center, Container, Paper, Stack, Text } from "@mantine/core";
import axios from "axios";
import React, { useState } from "react";

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

function Summary() {
    const [edges, setEdges] = useState([]);
    const [nodes, setNodes] = useState([]);

    const { ref } = useVisNetwork({
        options,
        edges,
        nodes,
    });

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
                            The connection graph may take some time to build.
                        </Text>
                        <Button onClick={fetchGroupData}>Generate</Button>
                    </Stack>
                </Center>
            );
        }

        return <div style={{ height: "100%", width: "100%" }} ref={ref} />;
    }

    return (
        <Container fluid>
            <h3></h3>
            <h3>Emoji</h3>
            <h3>Groups</h3>
            <Paper shadow="md" style={{ height: 500, width: "100%" }}>
                {connectionGraph()}
            </Paper>
        </Container>
    );
}

export default Summary;
