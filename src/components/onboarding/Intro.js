import React from 'react';
import Typography from '@material-ui/core/Typography';

function Intro(props) {
    return (
        <div>
            <Typography variant='h6'> Please Note </Typography>
            <ul>
                <li> All data is processed locally to guarantee your security </li>
                <li> Currently only macOS and iOS are supported.</li>
                <li>Made with love by Jared Weinstein. 2019 </li>
            </ul>
        </div>
    );
}

export default Intro;
