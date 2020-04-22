import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Route, Switch, Link } from 'react-router-dom';

import HomeIcon from '@material-ui/icons/Home';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import ViewListIcon from '@material-ui/icons/ViewList';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import ContactSummary from './ContactSummary.js';
import Summary from './Summary.js';
import Setting from './Setting.js';

const drawerWidth = 200;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, .5),
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(0, 2, 0, 2)
    },
}));

export default function Main() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
                open={open}>
            <div className={classes.toolbar}>
                <IconButton onClick={() => setOpen(!open)}>
                {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </div>
            <Divider/>
            <List>
                {menuItem("Summary", <HomeIcon />)}
                {menuItem("Contacts", <PersonIcon />)}
                {menuItem("Groups", <ViewListIcon />)}
            </List>
            <Divider/>
            <List>
                {menuItem("Settings", <SettingsIcon />)}
            </List>
            </Drawer>
            <main className={classes.content}>
            { getContent() }
            </main>
        </div>
    );
}

function getContent() {
    return (
        <Switch>
            <Route exact path={["/summary", "/"]}>
                <Summary />
            </Route>
            <Route path="/contacts">
                <ContactSummary />
            </Route>
            <Route path="/groups">
                <h1>Groups not Implemented</h1>
            </Route>
            <Route path="/settings">
                <Setting />
            </Route>
            <Route path="*">
                <h1> 404: Page</h1>
            </Route>
        </Switch>
    );
}

function menuItem(text, icon) {
    return(
        <ListItem button
            component={Link}
            to={'/' + text.toLowerCase()}
            key={text}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
        </ListItem>
    );
}
