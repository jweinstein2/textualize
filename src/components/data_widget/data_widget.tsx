import Podium from "@/components/data_widget/podium/podium";
import { showError } from "@/util";
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
            <Center>
                <Loader color="blue" />
            </Center>
        );
    }

    function displayData() {
        if (data == null) return <></>;

        const key = Object.keys(options).reduce((acc, curr) => {
            const val = selectedOptions[curr] ?? options[curr][0];
            return acc + val;
        }, "");
        const selectedData = data[key];

        if ("leaderboard" === type) {
            console.log(key);
            return <Podium leaderboard={selectedData} />;
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
        <div>
            <div className={classes.toggles}>{optionToggles()}</div>
            {displayData()}
        </div>
    );
}

export default DataWidget;
