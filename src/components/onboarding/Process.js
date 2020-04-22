/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
    progress: {
        flexGrow: 1,
    },
}));

function Process(props) {
    const finished = props.callback;
    const classes = useStyles();
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        function beginProcess() {
            window.zerorpcClient.invoke('process', (error, res, more) => {
                if (error) {
                    console.error(error)
                    return
                }
                if (res === false) {
                    console.error('PROCESS FAILED')
                    return
                }
                console.log('PROCESS STARTED')
            })
        }

        function poll() {
            window.zerorpcClient.invoke('get_process_progress', (error, res, more) => {
                if (error) {
                    console.error(error)
                    return
                }
                console.log(res[0], res[1])
                switch(res[0]) {

                    case "unstarted":
                        console.log("BEGIN PROCESS");
                        beginProcess();
                        break;
                    case "in_progress":
                        console.log("UPDATE PROCESS");
                        setProgress(res[1]);
                        break;
                    case "error":
                        console.log("SET ERROR");
                        setError(res[1]);
                        break;
                    case "completed":
                        console.log("SET COMPLETE");
                        setComplete(true)
                        break;
                    default:
                        setError("improperly handled json response");
                }
            })
        }

        const timer = setInterval(poll, 500);
        return () => {
            clearInterval(timer);
        };
    }, [setError, setComplete, setProgress]);


    if (error) {
        return (
            <div>
                Error
            </div>
        );
    }

    if (complete) {
        return (
            <Button variant="contained" color="primary" onClick={finished} className={classes.button}>
                Continue
            </Button>
        );

    }

    return (
        <div>
            <LinearProgress className={classes.progress}
                variant="determinate"
                value={progress} />
        </div>
    );
}

export default Process;
