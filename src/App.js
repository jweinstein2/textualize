import React, { useState, useEffect } from 'react';
//import Setup from './components/onboarding/Setup.js';
//import Main from './components/Main.js';
//import Process from './components/onboarding/Process.js';
import Button from '@material-ui/core/Button';


import './style/App.css';

const { ipcRenderer } = window.require('electron');

function App() {
    function showFileSelect() {
        ipcRenderer.on('async-file-reply', (event, arg) => {
            if (arg.cancelled === true) { return }

            //setPath(arg.filePaths[0])
            console.log(arg.filePaths[0])
        })
        ipcRenderer.send('async-file-select', 'ping')
    }

    function zeroCall() {
        console.log('Making Server Call');
        window.zerorpcClient.invoke("calc", "garbage", (error, res) => {
            if(error) {
                console.log('error')
            } else {
                console.log(res)
            }
        });
    }

    //const [stage, setStage] = useState(0);
    //
    //useEffect(() => {
    //    const header = {
    //        method: "GET",
    //        mode: "cors",
    //        dataType: "application/json"
    //    };
    //    fetch('http://127.0.0.1:5000/api/data/state', header)
    //    .then(r => r.json(), e => setStage(4))
    //    .then(json => setStage(json['state']))
    //    .catch(error => {
    //        debugger;
    //        console.log(error)
    //    })
    //}, []);
    //
    //function completeStage() {
    //    console.log("COMPLETE STAGE");
    //    setStage(stage + 1)
    //}
    //
    //switch(stage) {
    //    case 0:
    //        // unset display empty screen
    //        return <div></div>;
    //    case 1:
    //        // guide user through selecting source
    //        return <Setup callback={completeStage} />;
    //    case 2:
    //        // display graphics as data is processed
    //        return <Process callback={completeStage} />;
    //    case 3:
    //        // display full app
    //        return <Main />;
    //    case 4:
    //        return <div>
    //                    Something Went Wrong?
    //                </div>
    //    default:
    //        // unexpected case
    //        debugger;
    //        return (
    //            <div className="app">
    //            <h1> Error </h1>
    //            <h3> Unexpected state. </h3>
    //            </div>
    //        );
    //}
    //

    return (
        <div>
        <h1>Hello from App.js</h1>
        <Button
            variant="contained"
            size="small"
            onClick={showFileSelect}>
        FILE SELECT
        </Button>
        <Button
            variant="contained"
            size="small"
            onClick={zeroCall}>
        ZERO RPC
        </Button>
        </div>
    );

}

export default App
