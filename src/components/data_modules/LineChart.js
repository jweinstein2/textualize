import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
//import { makeStyles } from '@material-ui/core/styles';

//const classes = makeStyles(theme => ({
//    h6: {
//        'padding-top': theme.spacing(1),
//        'padding-left': theme.spacing(4),
//    }
//}))

function FrequencyChart(props) {
    const data = props.data;

    if (!data) {
        return (
            <ResponsiveContainer width='99%' aspect={5.6/1.0}>
            <LineChart width={900} height={300} data={null}
            margin={{top: 0, right: 20, left: 0, bottom: 0}}>
            <XAxis stroke="#248CF5" />
            <YAxis stroke="#248CF5" />
            </LineChart>
            </ResponsiveContainer>
        );
    } else {
        return (
            <ResponsiveContainer width='99%' aspect={5.6/1.0}>
            <LineChart width={900} height={300} data={data}
            margin={{top: 0, right: 20, left: 0, bottom: 0}}>
            <XAxis dataKey="Label" stroke="#248CF5"/>
            <YAxis stroke="#248CF5" />
            <Tooltip/>
            <Legend align="right" verticalAlign="top"/>
            <Line type="monotone" dataKey="Sent" stroke="#248CF5" dot={false}/>
            <Line type="monotone" dataKey="Received" stroke="#82ca9d" dot={false}/>
            </LineChart>
            </ResponsiveContainer>
        );
    }
}

export default FrequencyChart;
