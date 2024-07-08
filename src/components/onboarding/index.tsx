import { useState, useEffect } from 'react';
import { Stepper, rem } from '@mantine/core';
import {Button, Radio, Group, Stack, Text } from '@mantine/core';
import { Container } from '@mantine/core';
import './onboarding.css';
import {completeOnboarding} from '@/AppStateSlice';
import {useAppDispatch} from '@/store/hooks';

import { IconUserCheck, IconMailOpened, IconShieldCheck } from '@tabler/icons-react';

const IOS_BACKUP_PATH_MAC = '/Library/Application Support/MobileSync/Backup/'

function Onboarding() {
    const [active, setActive] = useState(0);
    const [source, setSource] = useState<string | undefined>(undefined);
    const [backup, setBackup] = useState<string | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [backupOptions, setBackupOptions] = useState<string[]>([]);

    const dispatch = useAppDispatch();

    useEffect(() => {
        window.ipcRenderer.invoke('listBackups', IOS_BACKUP_PATH_MAC)
            .then(setBackupOptions)
            .catch(setError);
    }, []);

    function nextStep() {
        setActive((current) => (current < 3 ? current + 1 : current))
    }

    const readFiles = async () => {
        const path = '/Library/Application Support/MobileSync/Backup/'
        const filePath = await window.ipcRenderer.invoke('lsDir', path)
    }

    function analyze() {
        dispatch(completeOnboarding(backup));
    }

    const data = [
        {name: 'iPhone Backup ⭐️', description: 'Messages stored on your iPhone', disabled: false},
        {name: 'Mac Messages', description: 'Messages stored on your computer', disabled: false},
        {name: 'WhatsApp', description: 'coming soon...', disabled: true},
        {name: 'Messenger', description: 'coming soon...', disabled: true},
    ];

    function renderSourceCards() {
        return data.map((item) => (
        <Radio.Card className="card" radius="md" value={item.name} key={item.name}>
            <Group wrap="nowrap" align="flex-start">
                <Radio.Indicator />
                <div>
                    <Text className="label">{item.name}</Text>
                    <Text className="description">{item.description}</Text>
                </div>
            </Group>
        </Radio.Card>
        ));
    }

    function renderBackupCards() {
        return backupOptions.map((item) => (
            <Radio.Card className="card" radius="md" value={item} key={item}>
                <Group wrap="nowrap" align="flex-start">
                    <Radio.Indicator />
                    <div>
                        <Text className="label">{item}</Text>
                    </div>
                </Group>
            </Radio.Card>
        ));

    }

    return (
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
            <Stepper.Step icon={<IconUserCheck/>} >
                <Radio.Group
                    value={source}
                    onChange={setSource}
                    label="Pick a message data source"
                    description="What messages do you want to analyze?">
                    <Stack pt="md" gap="xs">
                        {renderSourceCards()}
                    </Stack>
                </Radio.Group>
                <Button disabled={source == null} className="next" onClick={nextStep}>
                    Next
                </Button>
            </Stepper.Step>
            <Stepper.Step icon={<IconMailOpened/>} >
                Create an unencrypted iPhone backup

                This is required to parse message data on your Mac.
                <Button disabled={backup == null} className="next" onClick={nextStep}>
                    Next
                </Button>
            </Stepper.Step>
            <Stepper.Step icon={<IconMailOpened/>} >
                <Radio.Group
                    value={backup}
                    onChange={setBackup}
                    label="What backup would you like to use?">
                    <Stack pt="md" gap="xs">
                        {renderBackupCards()}
                    </Stack>
                </Radio.Group>
                <Button disabled={backup == null} className="next" onClick={nextStep}>
                    Next
                </Button>
            </Stepper.Step>
            <Stepper.Step icon={<IconShieldCheck/>}>
                We understand your data is important and private. That's why your messages never leave your device.
                <Button className="analyze" onClick={analyze}>Analyze</Button>
            </Stepper.Step>
        </Stepper>
    );
}

export default Onboarding
