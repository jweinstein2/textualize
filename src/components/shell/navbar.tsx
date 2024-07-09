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
import {useLocation} from 'react-router-dom';
import {useEffect} from 'react';



const data = [
  { link: '/summary', label: 'Summary', icon: IconChartAreaLine },
  { link: '/contacts', label: 'Contacts', icon: IconMessage },
  { link: '/groups', label: 'Groups', icon: IconUsersGroup },
  { link: '/ai', label: 'AI', icon: IconFingerprint },
  { link: '/settings', label: 'Settings', icon: IconSettings },
];

function Navbar() {
    const [active, setActive] = useState('Summary');

    const location = useLocation();

    useEffect(() => {
        const activeIndex = data.find((item) => item.link === location.pathname)
        if (activeIndex?.label != undefined) {
            setActive(activeIndex.label)
        }
    }, [location]);

    function renderLinks(data: any) {
        return data.map((item: any) => (
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
    }

  return (
    <nav className="navbar">
      <div className="navbarMain">
          {renderLinks(data.slice(0,4))}
      </div>

      <div className="footer">
         {renderLinks(data.slice(4,5))}
      </div>
    </nav>
  );
}

export default Navbar
