import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import PieChart from './PieChart';
import LineChart from './LineChart';
import Ranked from './Ranked';
import WordCloud from './WordCloud';
import SimpleData from './SimpleData';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        color: theme.palette.text.secondary,
        padding: theme.spacing(2),
    },
    header: {
        'position': 'relative',
    }
}));

const mod = {
    LINE: 'line',
    BAR: 'bar',
    PIE: 'pie',
    SIMPLE: 'simple',
    RANKED: 'ranked',
    WORD: 'word_cloud',
    TEXT: 'text',
}

function Module(props) {
    const classes = useStyles();
    const title = props.title;
    // eslint-disable-next-line
    const info = "to be displayed in the top right corner";
    const data = props.data;
    const type = props.type;

    if (!Object.values(mod).includes(type)) {
        debugger;
        console.error("Module Error: unknown type")
    }


    function content(type, data) {
        switch (type) {
            case mod.LINE:
                return <LineChart data={data} />
            case mod.SIMPLE:
                return <SimpleData data={data} />
            case mod.PIE:
                return <PieChart data={data} />
            case mod.RANKED:
                return <Ranked data={data} />
            case mod.WORD:
                return <WordCloud data={{}} />
            default:
        }

        return <h1> Unknown Module Type </h1>
    }

    return (
        <Paper className={classes.paper}>
            <Typography variant='h6' color='textSecondary'>
                <div className={classes.header}>
                    {title}
                </div>
            </Typography>
            { content(type, data) }
        </Paper>
    );
}

function LoadModule(props) {
    var args = [];
    if (props.args) args = props.args;
    args.unshift(props.endpoint);

    const title = props.title;
    const type = props.type;

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (args.length === 0) return;

        window.zerorpcClient.invoke(...args, (error, res, more) => {
            if (error) {
                console.log(error)
                setError('Component Failed to Load');
            } else {
                setData(res)
            }
        })
    }, [args]);


    if (error) {
        return (
            <h1> Error </h1>
        );
    }
    return <Module data={data} title={title} type={type}/>
}

export {
    Module,
    LoadModule
}
