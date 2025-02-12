import { BarChart as MantineBarChart } from '@mantine/charts';

interface BarChartProps {
    data: BarChartData[];
    series: {name: string, color: string}[];
}

// TODO: Abstract out sent and received.
interface BarChartData {
    Sent: number; 
    Received: number;
    key: string;
}

function BarChart(props: BarChartProps) {
  return (
    <MantineBarChart
      h={220}
      data={props.data}
      dataKey="key"
      type="stacked"
      series={props.series}/>
  );
}

export default BarChart
