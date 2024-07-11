import { Progress } from '@mantine/core';
import { useState, useEffect } from 'react';
import {Center} from '@mantine/core';
import './loading.css';

const STATIC_MESSAGES = [
    'Built with your privacy in mind: your messages never leave your device',
    'The average person sends half a million messages each year',
    'Who have you forgotten to text back?',
]

// TODO(jaredweinstein): Replace w. actual content
const personalizedMessages = [
    'Compiling 20058 messages.',
    'Compiling messages from 158 contacts',
    'Text your mom back',
]


function Loading() {
    const [message, setMessage] = useState(STATIC_MESSAGES[0]);

    return (
        <div className="wrapper">
            <div className="body">
                <Progress value={0}/>
                <Center><p>{message}</p></Center>
            </div>
        </div>
    )
}

export default Loading
