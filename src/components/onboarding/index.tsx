import { useState } from 'react';
import { Stepper, rem } from '@mantine/core';
import {Button, Radio, Group, Stack, Text } from '@mantine/core';
import './onboarding.css';

import { IconUserCheck, IconMailOpened, IconShieldCheck } from '@tabler/icons-react';

function Onboarding() {
  const [active, setActive] = useState(0);
  const [source, setSource] = useState<string | null>(null);
  const [backup, setBackup] = useState<string | null>(null);

    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const readFiles = () => {}

    const data = [
        {name: 'iPhone Backup ⭐️', description: 'Messages stored on your iPhone' },
        {name: 'Mac Messages', description: 'Messages stored on your computer'},
        {name: 'WhatsApp', description: 'coming soon...'},
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

    const backupCards = data.map((item) => (
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
          {/*<Radio.Group
              value={backup}
              onChange={setBackup}
              label="Pick a message data source"
              description="What messages do you want to analyze?">
              <Stack pt="md" gap="xs">
                  {backupCards}
              </Stack>
          </Radio.Group> */}

          <Button onClick={readFiles}>
              Console Log Files
          </Button>
          <Button disabled={backup === null} className="next" onClick={nextStep}>
            Next
          </Button>
      </Stepper.Step>
      <Stepper.Step icon={<IconShieldCheck style={{ width: rem(18), height: rem(18) }} />}>
          Completed!
          <Button className="next" onClick={nextStep}>Next</Button>
      </Stepper.Step>
    </Stepper>
  );
}

export default Onboarding
