import { Grid, Paper, Text } from "@mantine/core";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { IconUpload } from "@tabler/icons-react";
import { useShareModal } from '@/components/share/ShareModalContext';

import classes from "./card.module.css";

export interface CardProps {
    title: string;
    span: number;
    children?: ReactNode;
    height?: number;
    shareContent?: ReactNode;
}

type ShareOptionContextType = {
    registerShareGenerator: (callback: () => Promise<string>) => void;
};

const ShareOptionContext = createContext<ShareOptionContextType | undefined>(undefined);

export const useShareOption = (): ShareOptionContextType => {
    const context = useContext(ShareOptionContext);
    if (!context) {
        throw new Error("useShareOption must be used within a ShareOptionProvider");
    }
    return context;
};

function Card(props: CardProps) {
    const { openShareModal } = useShareModal();
    const [shareContentGenerator, setShareContentGenerator] = useState<() => Promise<string>>();

    function registerShareGenerator(callback: () => Promise<string>) {
        setShareContentGenerator(() => callback);
    }

    function onShare() {
        if (!shareContentGenerator) {
            console.error("No share content generator registered");
            return;
        }
        shareContentGenerator().then((data) => {
            openShareModal(data);
        });
    }

    const shareIcon = shareContentGenerator != null 
        ? <IconUpload size={20} onClick={() => onShare()}/> 
        : null;

    return (
        <Grid.Col span={props.span}>
            <Paper
                shadow="md"
                style={{ padding: 8, height: props.height ?? 320 }}
                className={classes.container}
            >
                <ShareOptionContext.Provider value={{registerShareGenerator}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>{props.title}</Text>
                        {shareIcon}
                    </div>
                    <div className={classes.child}>{props.children}</div>
                </ShareOptionContext.Provider>
            </Paper>
        </Grid.Col>
    );
}

export default Card;
