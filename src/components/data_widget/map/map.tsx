import { USAMap } from '@mirawision/usa-map-react';
import axios from "axios"
import { showError } from "@/util";

import {useEffect, useState} from 'react'

interface StateData {
    value: number,
    numbers: string[],
}

function Map () {
    const [stateData, setStateData] = useState<{[key: string]: StateData}>({})

    function getColor (value: number, min: number, max: number): string  {
        const logMin = Math.log(min + 1); // Avoid log(0)
        const logMax = Math.log(max + 1);
        const logValue = Math.log(value + 1);

        // Normalize log value to range [55, 255]
        const intensity = Math.round(255 - ((logValue - logMin) / (logMax - logMin)) * 200);

        return `rgb(${intensity}, ${intensity}, 255)`;
    };

    const values = Object.values(stateData).map((d) => d.value) 
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    const formattedState: Record<string, { fill: string }> = {};
    for (const [state, data] of Object.entries(stateData)) {
        formattedState[state] = { fill: getColor(data.value, minVal, maxVal) };
    }

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:4242/summary/statemap`)
            .then((response) => {
                    setStateData(response.data)
            })
            .catch(() =>
                showError(
                    "Failed to load contact data",
                    "Frequency graph could not be generated"
                )
            );
    }, []);

    return <USAMap customStates={formattedState}/> // TODO: Use a library that supports hover
}

export default Map
