import React from 'react';
import { Pie, Tooltip, ResponsiveContainer, PieChart as PieC } from 'recharts';

function PieChart(props) {
    const data = props.data;

    //const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    //    const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
    //    const x  = cx + radius * Math.cos(-midAngle * RADIAN);
    //    const y = cy  + radius * Math.sin(-midAngle * RADIAN);
    //
    //    return (
    //        <text x={x} y={y} fill="white"
    //        textAnchor={x > cx ? 'start' : 'end'}
    //        dominantBaseline="central">
    //        {`${(percent * 100).toFixed(0)}%`}
    //        </text>
    //    );
    //};

    return (
        <ResponsiveContainer width='99%' aspect={1.0}>
        <PieC width={100} height={100}>
              <Pie data={data}
                dataKey="value"
                label={true}
                labelLine={false}
                nameKey="name"
                cx="50%" cy="50%"
                outerRadius={'80%'}
                innerRadius={'20%'}
                fill="#8884d8" />
            <Tooltip/>
        </PieC>
        </ResponsiveContainer>
    );
}

export default PieChart;
