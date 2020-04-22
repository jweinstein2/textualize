import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { withRouter } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  root: {
      'padding-top': theme.spacing(2),
      'padding-bottom': theme.spacing(1)
  },
}));

function Header(props) {
    const classes = useStyles();
    const crumbs = props.crumbs ? props.crumbs : []
    const title = props.title;
    const hist = props.history

    function link(label, url) {
        function onClick(hist, url) {
            return () => hist.push(url);
        }

        return (
            <Typography variant='h4' key={label}>
                <Link color="inherit" onClick={onClick(hist, url)}>
                    {label}
                </Link>
            </Typography>
        )
    }

    return (
        <div className={classes.root}>
            <Breadcrumbs separator="•" aria-label="breadcrumb">
              {crumbs.map( x => link(x['label'], x['url'] )) }
              <Typography variant='h4' color="textPrimary">{title}</Typography>
            </Breadcrumbs>
        </div>
    );
}

export default withRouter(Header);
