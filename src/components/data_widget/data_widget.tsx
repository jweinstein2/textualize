import MessageCarousel from "@/components/data_widget/message_carousel/message_carousel";
import BarChart from "@/components/data_widget/bar_chart/bar_chart";
import Podium from "@/components/data_widget/podium/podium";
import Simple from "@/components/data_widget/simple/simple";
import Wordcloud from "@/components/data_widget/wordcloud/wordcloud";
import Card from "@/components/card/card";
import { FormatType, showError, toFormatEnum } from "@/util";
import { Center, Loader, Select } from "@mantine/core";
import { useShareOption } from "@/components/card/card";
import axios from "axios";
import html2canvas from 'html2canvas';
import { useEffect, useState, useRef } from "react";


import classes from "./data_widget.module.css";

interface WidgetProps {
    fetchPath: string;
    params?: object;
}

function DataWidget(props: WidgetProps) {
    const [type, setType] = useState<string>();
    const [data, setData] = useState();
    const [selectedData, setSelectedData] = useState();
    const [options, setOptions] = useState<{ [key: string]: string[] }>({});
    const [format, setFormat] = useState<FormatType>();
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState<{
        [optionKey: string]: string;
    }>({ type: "Groups" });

    const screenshotRef = useRef<HTMLDivElement>(null);
    const shareContext = useShareOption();

    // Define the share generator function separately
    const shareGenerator = async () => {
        if (screenshotRef.current === null) return "";
        
       // Create a temporary container for the share view
        const shareContainer = document.createElement('div');
        shareContainer.style.width = '800px'; // Fixed width for share view
        shareContainer.style.padding = '20px';
        shareContainer.style.backgroundColor = '#282c34';
        shareContainer.style.display = 'flex';
        shareContainer.style.flexDirection = 'column';
        shareContainer.style.alignItems = 'center';

        const header = document.createElement('div')
        header.style.color = 'white';
        header.style.width = '100%';
        header.style.textAlign = 'center';
        header.style.padding = '1rem';
        header.textContent = selectedData?.shareLabel ?? ""
        shareContainer.appendChild(header)
        
        // Clone the content
        const contentClone = screenshotRef.current.cloneNode(true) as HTMLElement;
        contentClone.style.width = '100%';
        contentClone.style.marginBottom = '20px';
        
        // Add the content
        shareContainer.appendChild(contentClone);
        
        // Add text at the bottom
        const footerText = document.createElement('div');
        footerText.style.color = 'white';
        footerText.style.fontSize = '14px';
        footerText.style.textAlign = 'center';
        footerText.style.padding = '10px';
        footerText.style.width = '100%';
        footerText.textContent = 'Textualize';
        shareContainer.appendChild(footerText);
        
        // Add the container to the document temporarily
        document.body.appendChild(shareContainer);
        
        // Capture the new component
        const canvas = await html2canvas(shareContainer, {
            backgroundColor: '#282c34',
            width: 800,
            height: shareContainer.offsetHeight,
        });
        
        // Clean up
        document.body.removeChild(shareContainer);
        
        return canvas.toDataURL();
    };

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/${props.fetchPath}`, {"params": props.params ?? {}})
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

    useEffect(() => {
        if (loading)  return;
        shareContext.registerShareGenerator(shareGenerator);
    }, [data, selectedOptions, loading]);

    useEffect(() => {
        if (data == null) {
            setSelectedData(undefined)
            return 
        }
        let selected = data;
        if (Object.keys(options).length !== 0) {
            for (const i in Object.keys(options)) {
                const key = Object.keys(options)[i];
                const val = selectedOptions[key] ?? options[key][0];
                selected = selected[val];
            }
        }
        setSelectedData(selected)
    }, [data, options, selectedOptions])

    if (loading) {
        return (
            <Center h="100%">
                <Loader color="blue" />
            </Center>
        );
    }

    function displayData() {
        if (selectedData === undefined) return <></>;
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
            <div ref={screenshotRef} className={classes.contents}>{displayData()}</div>
        </div>
    );
}

export default DataWidget;
