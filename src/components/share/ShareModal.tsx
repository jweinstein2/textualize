import styles from './ShareModal.module.css';
import { Button } from '@mantine/core';
import React, { useState } from 'react';
import { usePostHog } from 'posthog-js/react'
import {
    FacebookShareButton,
    FacebookIcon,
    EmailShareButton,
    EmailIcon,
    WhatsappShareButton,
    WhatsappIcon,
    TwitterShareButton,
    TwitterIcon,
    RedditShareButton,
    RedditIcon,
} from "react-share";
import { openIMessageAndPasteImage } from '@/appleScript';

interface ShareModalProps {
    pngImage?: string;

}

const TEXTUALIZE_URL = "https://jweinstein2.github.io/textualize_web/"
const TITLE = "🤭 Check out my text data!";
const MAIL_BODY =`
...

Generated via Textualize.
`



export default function ShareModal(props: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const posthog = usePostHog();

    function copyToClipboard() {
        if (props.pngImage) {
            window.ipcRenderer.invoke("copy-to-clipboard", props.pngImage)
                .then(() => {
                    posthog?.capture('copy_to_clipboard');
                })
                .catch((error) => {
                    console.error("Failed to copy to clipboard:", error);
                });
        }
    }

    function onCopy() {
        setCopied(true);
        copyToClipboard()
        console.log("Copying to clipboard");
        // Call main renderer process with copy
        setTimeout(() => { setCopied(false) }, 2500);
    }

    function shareToMessages() {
        copyToClipboard()
        openIMessageAndPasteImage()
    }

    return (
        <>
            {props.pngImage ? <img className={styles.img} src={props.pngImage} /> : <></>}
            <div className={styles.share}>
                <Button onClick={shareToMessages} style={{width: "9rem"}} > 
                    Share via Text 
                </Button>
                <div className={styles.socials}>
                    <Button disabled={copied} onClick={onCopy} variant="light" style={{width: "9rem"}} > 
                        {copied ? <>Copied!</> : <>Copy Image</>}
                    </Button>
                    <div className={styles.socialIcons}>
                        { /* https://github.com/nygardk/react-share?tab=readme-ov-file#readme */ }
                        <FacebookShareButton url={TEXTUALIZE_URL}><FacebookIcon size={"2rem"} round={true} /></FacebookShareButton> 
                        <EmailShareButton url={TEXTUALIZE_URL} subject={TITLE} body={MAIL_BODY}><EmailIcon size={"2rem"} round={true} /></EmailShareButton> 
                        <WhatsappShareButton url={TEXTUALIZE_URL} title={TITLE}><WhatsappIcon size={"2rem"} round={true} /></WhatsappShareButton>
                        <TwitterShareButton url={TEXTUALIZE_URL} title={TITLE}><TwitterIcon size={"2rem"} round={true} /></TwitterShareButton>
                        <RedditShareButton url={TEXTUALIZE_URL} title={TITLE}><RedditIcon size={"2rem"} round={true} /></RedditShareButton>
                    </div>
                </div>
            </div> 
        </>
    )
}
