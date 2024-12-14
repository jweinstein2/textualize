import Bubble from "@/components/message/bubble";
import { showError } from "@/util";
import { LineChart } from "@mantine/charts";
import { Container } from "@mantine/core";
import { Center, Loader } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import ReactWordcloud from "react-wordcloud";

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

export type EmojiData = {
    popular_sent: string;
    popular_received: string;
    unique_sent: string;
    unique_received: string;
};

type LanguageData = {
    unique: { text: string; value: number }[];
    received_avg_wordlen: number;
    sent_avg_wordlen: number;
};

function Contact() {
    const [frequency, setFrequency] = useState<FrequencyDay[]>([]);
    const [sentiment, setSentiment] = useState<SentimentData>();
    const [language, setLanguage] = useState<LanguageData>();
    const [emoji, setEmoji] = useState<EmojiData>();
    const [name, setName] = useState("");

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

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/emoji/${params.number}`)
            .then((response) => setEmoji(response.data))
            .catch(() =>
                showError("Failed to load data", "Emoji info not found")
            );
    }, []);

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/sentiment/${params.number}`)
            .then((response) => setSentiment(response.data))
            .catch(() =>
                showError("Failed to load data", "Sentiment info not found")
            );
    }, []);

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/language/${params.number}`)
            .then((response) => {
                console.log(response.data);
                setLanguage(response.data);
            })
            .catch(() =>
                showError("Failed to load data", "Language info failed to load")
            );
    }, []);

    function renderEmoji() {
        if (emoji == null) {
            return (
                <Center>
                    <Loader color="blue" />
                </Center>
            );
        }
        return (
            <div>
                <h4>Most Popular</h4>
                <Bubble
                    message={emoji?.popular_sent}
                    size="40px"
                    isSent
                ></Bubble>
                <Bubble message={emoji?.popular_received} size="40px"></Bubble>
                <h4>Unique</h4>
                <Bubble
                    message={emoji?.unique_sent}
                    size="40px"
                    isSent
                ></Bubble>
                <Bubble message={emoji?.unique_received} size="40px"></Bubble>
            </div>
        );
    }

    function renderSentiment() {
        if (sentiment == null) {
            return (
                <Center>
                    <Loader color="blue" />
                </Center>
            );
        }
        return (
            <div>
                <h5>Positive</h5>
                <Bubble message={sentiment?.pos_sent[0]} isSent></Bubble>
                <Bubble message={sentiment?.pos_sent[1]} isSent></Bubble>
                <Bubble message={sentiment?.pos_sent[2]} isSent></Bubble>
                <Bubble message={sentiment?.pos_received[0]}></Bubble>
                <Bubble message={sentiment?.pos_received[1]}></Bubble>
                <Bubble message={sentiment?.pos_received[2]}></Bubble>
                <h5>Negative</h5>
                <Bubble message={sentiment?.neg_sent[0]} isSent></Bubble>
                <Bubble message={sentiment?.neg_sent[1]} isSent></Bubble>
                <Bubble message={sentiment?.neg_sent[2]} isSent></Bubble>
                <Bubble message={sentiment?.neg_received[0]}></Bubble>
                <Bubble message={sentiment?.neg_received[1]}></Bubble>
                <Bubble message={sentiment?.neg_received[2]}></Bubble>
            </div>
        );
    }

    function renderLanguage() {
        const options = {
            rotations: 3,
            rotationAngles: [-45, 45],
        };

        const callbacks = {
            getWordColor: (word) => "#218aff",
            onWordClick: console.log,
            onWordMouseOver: console.log,
            getWordTooltip: (word) => ``,
        };

        return (
            <ReactWordcloud
                options={options}
                callbacks={callbacks}
                words={language?.unique ?? []}
            />
        );
    }

    return (
        <Container fluid>
            <h2>{name}</h2>
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
            <h3>Emoji</h3>
            {renderEmoji()}
            <h3>Sentiment</h3>
            {renderSentiment()}
            <h3>Language</h3>
            {renderLanguage()}
        </Container>
    );
}

export default Contact;
