import React from 'react';
import { Pie, Tooltip, ResponsiveContainer, PieChart as PieC } from 'recharts';

function PieChart(props) {
    const data = props.data;

    return (
        <ResponsiveContainer width='99%' aspect={1.0}>
        <PieC width={100} height={100}>
              <Pie data={data}
                dataKey="value"
                label={true}
                labelLine={false}
                nameKey="name"
                cx="50%" cy="50%"
                outerRadius={'70%'}
                innerRadius={'20%'}
                fill="#248CF5" />
            <Tooltip
                formatter={(value, name, props) => {return [name, null]}}/>
        </PieC>
        </ResponsiveContainer>
    );
}
        //<PieC width={100} height={100}>
        //      <Pie data={data}
        //        dataKey="value"
        //        label={true}
        //        labelLine={false}
        //        nameKey="name"
        //        cx="50%" cy="50%"
        //        outerRadius={'70%'}
        //        innerRadius={'20%'}
        //        fill="#248CF5" />

export default PieChart;
