import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import Intro from './Intro.js';
import Backup from './Backup.js';
import Permissions from './Permissions.js';
import Select from './Select.js';


const useStyles = makeStyles(theme => ({
    root: {
        marginTop: theme.spacing(5)
    },
    backButton: {
        marginRight: theme.spacing(1),
    },
    nextButton: {

    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));

function Setup(props) {
    const finished = props.callback;
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const [ready, setReady] = React.useState(true);
    const steps = [
        {
            title: 'About',
            content: <Intro />,
            ready: true,
        },
        {
            title: 'Permissions',
            content: <Permissions />,
            ready: true,
        },
        {
            title: 'Backup',
            content: <Backup />,
            ready: true,
        },
        {
            title: 'Select',
            content: <Select enableNext={setReady}/>,
            ready: false
        }
    ];


    const handleNext = () => {
        const nextStep = activeStep + 1
        if (nextStep === steps.length) {
            finished();
            return;
        }

        setReady(steps[nextStep]['ready'])
        setActiveStep(nextStep);
    };

    const handleBack = () => {
        const nextStep = activeStep - 1

        setReady(steps[nextStep]['ready'])
        setActiveStep(nextStep);
    };

    return (
        <div className={classes.root}>
        <Container maxWidth='sm'>
        <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(step => (
            <Step key={step['title']}>
            <StepLabel>{step['title']}</StepLabel>
            </Step>
        ))}
        </Stepper>
        <div>
        {activeStep === steps.length ? (
            <div>
            <Typography className={classes.instructions}>All steps completed</Typography>
            </div>
        ) : (
            <div>
            { steps[activeStep]['content'] }
            <div>
            <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.backButton}
            >
            Back
            </Button>
            <Button
                disabled = {!ready}
                variant="contained"
                color="primary"
                onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Analyze' : 'Next'}
            </Button>
            </div>
            </div>
        )}
        </div>
        </Container>
        </div>
    );
}

export default Setup;
