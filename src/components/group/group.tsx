import { FrequencyDay } from "@/components/contact/contact";
import Card from "@/components/card/card";
import DataWidget from "@/components/data_widget/data_widget";
import { groupName, showError } from "@/util";
import { LineChart } from "@mantine/charts";
import { Grid, Button, Chip, Container } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";

import classes from "./group.module.css";

type GroupInfo = {
    name: string;
    members: string[];
};

function Group() {
    const [frequency, setFrequency] = useState<FrequencyDay[]>([]);
    const [groupInfo, setGroupInfo] = useState<GroupInfo>();

    const params = useParams();
    const navigate = useNavigate();

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

    const options = {
        rotations: 8,
        rotationAngles: [-20, 20] as [number, number],
    };


    return (
        <Container fluid className={classes.container}>
            <h2>
                <Button
                    className={classes.backButton}
                    onClick={() => navigate(-1)}
                >
                    <IconArrowLeft />
                </Button>
                {groupName(groupInfo?.members, groupInfo?.name)}
            </h2>
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
            <h3>Language</h3>
            <Grid>
                <Card title="Common Words" span={6} height={400}>
                    <DataWidget fetchPath={`/chat/${params.id}/wordcloud`} params={{"isGroup": true}} />
                </Card>
                <Card title="Message Time" span={6} height={400}>
                    <DataWidget fetchPath={`/chat/${params.id}/messages_by_time`} params={{"isGroup": true}}/>
                </Card>
            </Grid>
        </Container>
    );
}

export default Group;
