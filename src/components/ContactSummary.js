import React, {forwardRef, useEffect, useState} from 'react';
import MaterialTable from "material-table";
import { Route, Switch, withRouter } from 'react-router-dom';
//import { makeStyles } from '@material-ui/core/styles';
//import Paper from '@material-ui/core/Paper';
//import Typography from '@material-ui/core/Typography';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

import Contact from './Contact.js';
import Header from './Header.js';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

function ContactSummary(props) {
    const [data, setData] = useState([]);
    const hist = props.history
    const columns = [
        {title: "First", field: "first"},
        {title: "Last", field: "last"},
        {title: "Number", field: "number"},
        {title: "Sent", field: "sent"},
        {title: "Received", field: "received"},
        {title: "Conversations Started", field: "started"},
        {title: "Conversations Ended", field: "ended"},
        {title: "Your Response Time", field: "sent_response_time"},
        {title: "Their Response Time", field: "received_response_time"},
    ];

    useEffect(() => {
        window.zerorpcClient.invoke('get_numbers', (error, res, more) => {
            if (error) {
                console.log(error)
            } else {
                setData(res)
            }
        })
    }, []);
     //const [data, setData] = useState(data_default);

    function onClick(hist) {
        return (evt, selectedRow) => {
            hist.push('/contacts/' + selectedRow['number'])
        }
    }

    return (
        <Switch>
            <Route path={'/contacts/:id/'} component={Contact} />
            <Route exact path={'/contacts/'}>
                <Header title='Contacts'></Header>
                <MaterialTable icons={tableIcons}
                    columns={columns}
                    data={data}
                    title=""
                    onRowClick={onClick(hist)} />
            </Route>
      </Switch>
    );
}

export default withRouter(ContactSummary);
