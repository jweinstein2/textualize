import { FrequencyDay } from "@/components/contact/contact";
import { showError } from "@/util";
import { LineChart } from "@mantine/charts";
import { Chip, Container } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import classes from "./group.module.css";

type GroupInfo = {
    name: string;
    members: string[];
};

function Group() {
    const [frequency, setFrequency] = useState<FrequencyDay[]>([]);
    const [groupInfo, setGroupInfo] = useState<GroupInfo>();

    const params = useParams();

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/group_frequency/${params.id}`)
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
                    "Failed to load group data",
                    "Frequency graph could not be generated"
                )
            );
    }, []);

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/group/${params.id}`)
            .then((response) => {
                setGroupInfo(response.data);
            })
            .catch(() =>
                showError(
                    "Failed to load group data",
                    "Frequency graph could not be generated"
                )
            );
    }, []);

    function renderGroupMembers() {
        if (groupInfo?.members == null) return <div />;
        return groupInfo.members.map((name: string) => (
            <Chip key={name}>{name}</Chip>
        ));
    }

    return (
        <Container fluid>
            <h2>{groupInfo?.name}</h2>
            <div className={classes.contacts}>{renderGroupMembers()}</div>
            <LineChart
                h={300}
                data={frequency}
                dataKey="date"
                series={[
                    { name: "sent", color: "green.6" },
                    { name: "received", color: "blue.6" },
                ]}
                curveType="linear"
                withYAxis={false}
                tickLine="x"
                withDots={false}
            />
        </Container>
    );
}

export default Group;
