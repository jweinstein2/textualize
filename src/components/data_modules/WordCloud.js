import React from 'react';
import wordcloud from 'vue-wordcloud';

function WordCloud(props) {
    const data = {
        words: [{
                "name": "Cat",
                "value": 26
            },
            {
                "name": "fish",
                "value": 19
            },
            {
                "name": "things",
                "value": 18
            },
            {
                "name": "look",
                "value": 16
            },
            {
                "name": "two",
                "value": 15
            },
            {
                "name": "fun",
                "value": 9
            },
            {
                "name": "know",
                "value": 9
            },
            {
                "name": "good",
                "value": 9
            },
            {
                "name": "play",
                "value": 6
            }
        ],
        colors: ['#1f77b4', '#629fc9', '#94bedb', '#c9e0ef']
    }

    return (
        <wordcloud
            data={data}
            nameKey="name"
            valueKey="value"
            color="colors"
            showTooltip="true">
        </wordcloud>
    );
}

export default WordCloud;
