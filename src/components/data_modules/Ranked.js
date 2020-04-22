import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    content: {
        height: theme.spacing(8),
    }
}));

function Ranked(props) {
    // eslint-disable-next-line
    const classes = useStyles();
    const data = props.data;

    if (!data || data.length < 3) {
        return <p>Insufficient Data</p>
    }

    return (
        <ol>
            <li>{data[0]}</li>
            <li>{data[1]}</li>
            <li>{data[2]}</li>
        </ol>
    );
}

export default Ranked;
