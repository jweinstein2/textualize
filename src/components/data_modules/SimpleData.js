import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    content: {
        height: theme.spacing(8),
    }
}));

function SimpleData(props) {
    // eslint-disable-next-line
    const classes = useStyles();
    const data = props.data;

    return (
       <Typography variant="h3" color="textPrimary" className={classes.content}>
            {data}
        </Typography>
    );
}

export default SimpleData;
