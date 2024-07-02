import { useState, useEffect } from 'react';
import { Stepper, rem } from '@mantine/core';
import {Button, Radio, Group, Stack, Text } from '@mantine/core';
import { Container } from '@mantine/core';
import './onboarding.css';
import {completeOnboarding} from '@/AppStateSlice';
import {useAppDispatch} from '@/store/hooks';

import { IconUserCheck, IconMailOpened, IconShieldCheck } from '@tabler/icons-react';

function Onboarding() {
  const [active, setActive] = useState(0);
  const [source, setSource] = useState<string | null>(null);
  const [backup, setBackup] = useState<string | null>(null);
  const [backupOptions, setBackupOptions] = useState<string[] | null>(null);

    const dispatch = useAppDispatch();

    useEffect(() => {
        const path = '/Library/Application Support/MobileSync/Backup/'
        window.ipcRenderer.invoke('listBackups', path)
            .then(response => {
                setBackupOptions(response)
            })
         .catch(error => {
             // TODO(jaredweinstein): Handle error case
             console.log('ERROR')
         });
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

    const sourceCards = data.map((item) => (
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

    const backupCards = () => {
        if (backupOptions === null) {
            return <div>Error State</div>
        }
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
          <Stepper.Step icon={<IconUserCheck style={{ width: rem(18), height: rem(18) }} />} >
              <Radio.Group
                  value={source}
                  onChange={setSource}
                  label="Pick a message data source"
                  description="What messages do you want to analyze?">
                  <Stack pt="md" gap="xs">
                      {sourceCards}
                  </Stack>
              </Radio.Group>
              <Button disabled={source === null} className="next" onClick={nextStep}>
                  Next
              </Button>
          </Stepper.Step>
          <Stepper.Step icon={<IconMailOpened style={{ width: rem(18), height: rem(18) }} />} >
              <Radio.Group
                  value={backup}
                  onChange={setBackup}
                  label="What backup would you like to use?">
                  <Stack pt="md" gap="xs">
                      {backupCards()}
                  </Stack>
              </Radio.Group>

              <Button disabled={backup === null} className="next" onClick={nextStep}>
                  Next
              </Button>
          </Stepper.Step>
          <Stepper.Step icon={<IconShieldCheck style={{ width: rem(18), height: rem(18) }} />}>
              We understand your data is important and private. That's why your messages never leave your device.
              <Button className="analyze" onClick={analyze}>Analyze</Button>
          </Stepper.Step>
      </Stepper>
  );
}

export default Onboarding
