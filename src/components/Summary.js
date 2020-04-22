import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Module, LoadModule } from './data_modules/Module';
import Grid from '@material-ui/core/Grid';
import Header from './Header';

const useStyle = makeStyles(theme => ({
    root: {
    },
}))

function Summary() {
    const classes = useStyle()
    const [generalData, setGeneralData] = useState({})

    useEffect(() => {
        window.zerorpcClient.invoke('summary', (error, res, more) => {
            if (error) {
                console.log(error)
            } else {
                setGeneralData(res)
            }
        })
    }, []);

    return (
        <div className={classes.root}>
            <Header title="Summary" ></Header>
            <Grid container spacing={3} className={classes.root}>
                <Grid item xs={12}>
                    <LoadModule title="Frequency"
                     endpoint={'frequency'}
                     type={'line'}/>
                </Grid>
                <Grid item xs={3}>
                    <Module title="Group v. Individual"
                        data={generalData ? generalData['individual_group_pie'] : {}}
                        type={'pie'} />
                </Grid>
                <Grid item xs={3}>
                    <Module title="Sent Received in Groups"
                        data={generalData ? generalData['sent_received_group_pie'] : {}}
                        type={'pie'} />
                </Grid>
                <Grid item xs={3}>
                    <Module title="Individual Sent Received"
                        data={generalData ? generalData['sent_received_individual_pie'] : {}}
                        type={'pie'} />
                </Grid>
                <Grid item xs={3}>
                    <Module title="Received per Day"
                        data={generalData ? generalData['received_daily'] : {}}
                        type={'simple'} />
                </Grid>
                <Grid item xs={3}>
                    <Module title="Sent per Day"
                        data={generalData ? generalData['sent_daily'] : {}}
                        type={'simple'} />
                </Grid>
            </Grid>
        </div>
    );
}


export default Summary
