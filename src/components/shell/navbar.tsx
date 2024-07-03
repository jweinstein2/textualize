import { useState } from 'react';
import { Group, Code } from '@mantine/core';
import {
  IconBellRinging,
  IconFingerprint,
  IconKey,
  IconSettings,
  Icon2fa,
  IconChartAreaLine,
  IconDatabaseImport,
  IconReceipt2,
  IconMessage,
  IconUsersGroup,
} from '@tabler/icons-react';
import './navbar.css';

const data = [
  { link: '/summary', label: 'Summary', icon: IconChartAreaLine },
  { link: '/contacts', label: 'Contacts', icon: IconMessage },
  { link: '/groups', label: 'Groups', icon: IconUsersGroup },
  { link: '/ai', label: 'AI', icon: IconFingerprint },
];

function Navbar() {
  const [active, setActive] = useState('Summary');

  const links = data.map((item) => (
    <a
      className="link"
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {setActive(item.label)}} >
      <item.icon className="linkIcon" stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className="navbar">
      <div className="navbarMain">
        {links}
      </div>

      <div className="footer">
        <a href="/settings" className="link">
          <IconSettings className="linkIcon" stroke={1.5} />
          <span>Settings</span>
        </a>
      </div>
    </nav>
  );
}

export default Navbar
