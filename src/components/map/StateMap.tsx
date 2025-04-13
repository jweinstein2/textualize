import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip as ReactTooltip } from "react-tooltip";
import axios from "axios";
import { getStateNameByStateCode } from "us-state-codes";

// TopoJSON URL for US states
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// FIPS code mapping
const stateFips: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09", DE: "10", FL: "12",
  GA: "13", HI: "15", ID: "16", IL: "17", IN: "18", IA: "19", KS: "20", KY: "21", LA: "22",
  ME: "23", MD: "24", MA: "25", MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31",
  NV: "32", NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38", OH: "39", OK: "40",
  OR: "41", PA: "42", RI: "44", SC: "45", SD: "46", TN: "47", TX: "48", UT: "49", VT: "50",
  VA: "51", WA: "53", WV: "54", WI: "55", WY: "56"
};

// Create stateNames object using us-state-codes package
const stateNames: Record<string, string> = Object.keys(stateFips).reduce((acc, stateCode) => {
  const stateName = getStateNameByStateCode(stateCode);
  if (stateName) {
    acc[stateCode] = stateName;
  }
  return acc;
}, {} as Record<string, string>);

// Define the data type
interface StateData {
  numbers: (string | null)[];
  value: number;
}

export function StateMap() {
  const [tooltipContent, setTooltipContent] = React.useState("");
  const [data, setData] = useState<Record<string, StateData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:4242/summary/statemap");
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching state map data:", err);
        setError("Failed to load state data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Color scale based on value
  const colorScale = scaleLinear<string>()
    .domain([0, Math.max(...Object.values(data).map(d => d.value), 1)])
    .range(["#f0f9e8", "#0868ac"]);

  const handleMouseEnter = (stateAbbr: string) => {
    const stateData = data[stateAbbr];
    const name = stateNames[stateAbbr] || stateAbbr;

    if (stateData) {
      const filteredNumbers = stateData.numbers.filter(Boolean) as string[];
      let namesDisplay = "No contacts available";
      
      if (filteredNumbers.length > 0) {
        if (filteredNumbers.length <= 3) {
          namesDisplay = filteredNumbers.join(", ");
        } else {
          namesDisplay = `${filteredNumbers.slice(0, 3).join(", ")} and ${filteredNumbers.length - 3} more`;
        }
      }

      setTooltipContent(`${stateData.value} ${name} Contacts:\n[${namesDisplay}]`);
    } else {
      setTooltipContent(`${name}\nNo data`);
    }
  };

  if (loading) {
    return <div className="w-full max-w-4xl mx-auto text-center p-8">Loading map data...</div>;
  }

  if (error) {
    return <div className="w-full max-w-4xl mx-auto text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ReactTooltip id="state-tooltip" />
      <ComposableMap projection="geoAlbersUsa" width={980} height={551}>
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const stateAbbr = Object.keys(stateFips).find(
                (abbr) => stateFips[abbr] === geo.id
              );
              const stateData = stateAbbr ? data[stateAbbr] : null;
              const fill = stateData ? colorScale(stateData.value) : "#2a2a2a";
              
              // Prepare tooltip content for this state
              let tooltipText = "";
              if (stateAbbr) {
                const name = stateNames[stateAbbr] || stateAbbr;
                if (stateData) {
                  const filteredNumbers = stateData.numbers.filter(Boolean) as string[];
                  let namesDisplay = "No named contacts";
                  
                  if (filteredNumbers.length > 0) {
                    if (filteredNumbers.length <= 3) {
                      namesDisplay = filteredNumbers.join(", ");
                    } else {
                      namesDisplay = `${filteredNumbers.slice(0, 3).join(", ")} and ${filteredNumbers.length - 3} more`;
                    }
                  }
                  
                  tooltipText = `${name}: ${namesDisplay}`;
                } else {
                  tooltipText = `No messages from ${name}`;
                }
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#444"
                  data-tooltip-id="state-tooltip"
                  data-tooltip-content={tooltipText}
                  onMouseEnter={() => stateAbbr && handleMouseEnter(stateAbbr)}
                  onMouseLeave={() => setTooltipContent("")}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#ffa500" },
                    pressed: { outline: "none" }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <ReactTooltip id="state-tooltip">{tooltipContent}</ReactTooltip>
    </div>
  );
}
