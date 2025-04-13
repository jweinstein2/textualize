import styles from './ShareModal.module.css';
import { Button } from '@mantine/core';
import React, { useState } from 'react';
import { usePostHog } from 'posthog-js/react'

interface ShareModalProps {
    pngImage?: string;

}



export default function ShareModal(props: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const posthog = usePostHog();

    function onCopy() {
        setCopied(true);
        console.log("Copying to clipboard");
        // Call main renderer process with copy
        if (props.pngImage) {
            window.ipcRenderer.invoke("copy-to-clipboard", props.pngImage)
                .then(() => {
                    posthog?.capture('copy_to_clipboard');
                })
                .catch((error) => {
                    console.error("Failed to copy to clipboard:", error);
                });
        }
        setTimeout(() => { setCopied(false) }, 2500);
    }

    return (
        <>
            {props.pngImage ? <img className={styles.img} src={props.pngImage} /> : <></>}
            <div className={styles.socials}>
                <Button disabled={copied} onClick={onCopy} variant="light" style={{width: "9rem"}} > 
                    {copied ? <>Copied!</> : <>Copy Image</>}
                </Button>
            </div> 
        </>
    )
}
