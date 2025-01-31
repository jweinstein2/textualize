import ReactWordcloud from "react-wordcloud";

import classes from "./wordcloud.module.css";

interface Word {
    text: string;
    value: number; // determines size
    isSent: boolean;
    count: number;
}

interface WordcloudProps {
    words: Word[];
}

const options = {
    rotations: 8,
    rotationAngles: [-20, 20] as [number, number],
};

const callbacks = {
    getWordColor: () => "#218aff",
    getWordTooltip: () => ``,
};

/*
 * NOTE: Because of issues with the wordcloud dependency. The min-height of
 * the wordcloud is 300px
 */
function Wordcloud(props: WordcloudProps) {
    const updatedValueWords = props.words.map((w, i) => {
        const updated = { ...w };
        updated["value"] = Math.ceil((props.words.length - i) / 10) + 10;
        return updated;
    });

    console.log(updatedValueWords);
    return (
        <div className={classes.container}>
            <ReactWordcloud
                callbacks={callbacks}
                options={options}
                words={updatedValueWords ?? []}
            />
        </div>
    );
}

export default Wordcloud;
