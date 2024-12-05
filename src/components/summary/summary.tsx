import useVisNetwork from "@/components/network/useVisNetwork";
import { showError } from "@/util";
import { Container, Paper } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useState } from "react";

const options = {
    edges: {
        color: "#000000",
    },
    physics: {
        stabilization: {
            enabled: true,
        },
        timestep: 0.4, // Required to avoid the shakes
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

    useEffect(() => {
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
    }, []);

    return (
        <Container fluid>
            <h3></h3>
            <h3>Emoji</h3>
            <h3>Groups</h3>
            <Paper shadow="md">
                <div style={{ height: 700, width: "100%" }} ref={ref} />
            </Paper>
        </Container>
    );
}

export default Summary;
