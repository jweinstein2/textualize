import React from 'react';

function BarChart(props) {
    const data = props.data;

    if (!data) {
        return

    }

    return (
        <BarChart
            width={600}
            height={300}
            data={data}
            layout="vertical"
            margin={{top: 5, right: 30, left: 20, bottom: 5}}
        >
        <XAxis type="number"/>
        <YAxis type="category" dataKey="name" />
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip/>
        <Legend />
        <Bar dataKey="pv" fill="#8884d8" />
        <Bar dataKey="uv" fill="#82ca9d" />
        </BarChart>
    );
}
