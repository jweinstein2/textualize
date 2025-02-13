import MessageCarousel from "@/components/data_widget/message_carousel/message_carousel";
import BarChart from "@/components/data_widget/bar_chart/bar_chart";
import Podium from "@/components/data_widget/podium/podium";
import Simple from "@/components/data_widget/simple/simple";
import Wordcloud from "@/components/data_widget/wordcloud/wordcloud";
import { FormatType, showError, toFormatEnum } from "@/util";
import { Center, Loader, Select } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";

import classes from "./data_widget.module.css";

interface WidgetProps {
    fetchPath: string;
}

function DataWidget(props: WidgetProps) {
    const [type, setType] = useState<string>();
    const [data, setData] = useState();
    const [options, setOptions] = useState<{ [key: string]: string[] }>({});
    const [format, setFormat] = useState<FormatType>();
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState<{
        [optionKey: string]: string;
    }>({ type: "Groups" });

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/${props.fetchPath}`)
            .then((response) => {
                setType(response.data.type ?? "");
                setData(response.data.data);
                setOptions(response.data.options);
                setFormat(toFormatEnum(response.data.format));
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                showError(
                    "Failed to load data",
                    `Internal error when fetching ${props.fetchPath}`
                );
            });
    }, [props.fetchPath]);

    if (loading) {
        return (
            <Center h="100%">
                <Loader color="blue" />
            </Center>
        );
    }

    function displayData() {
        if (data == null) return <></>;

        let selectedData = data;
        if (Object.keys(options).length !== 0) {
            for (const i in Object.keys(options)) {
                const key = Object.keys(options)[i];
                const val = selectedOptions[key] ?? options[key][0];
                selectedData = selectedData[val];
            }
        }

        if (type === "leaderboard") {
            return <Podium leaderboard={selectedData} format={format} />;
        }

        if (type === "message") {
            return <MessageCarousel messages={selectedData} />;
        }

        if (type === "wordcloud") {
            return <Wordcloud words={selectedData} />;
        }

        if (type === "simple") {
            return <Simple data={selectedData} format={format} />;
        }

        if (type == "bar_chart") {
            return  <BarChart data={selectedData['data']} 
                              series={selectedData['series']} />
        }

        return <>Error!</>;
    }

    function updateOption(key: string, value: string | null) {
        if (value == null) return;
        const updatedOptions = { ...selectedOptions };
        updatedOptions[key] = value;
        setSelectedOptions(updatedOptions);
    }

    function optionToggles() {
        if (options == null) return <></>;
        const keys = Object.keys(options);
        return keys.map((optionKey, index) => {
            return (
                <Select
                    className={classes.select}
                    key={index}
                    placeholder={optionKey}
                    data={options[optionKey]}
                    value={selectedOptions[optionKey] ?? options[optionKey][0]}
                    onChange={(v) => updateOption(optionKey, v)}
                    allowDeselect={false}
                />
            );
        });
    }

    return (
        <div className={classes.container}>
            <div className={classes.toggles}>{optionToggles()}</div>
            <div className={classes.contents}>{displayData()}</div>
        </div>
    );
}

export default DataWidget;
