import React from 'react';
import TagCloud from 'react-tag-cloud';
import randomColor from 'randomcolor';

function WordCloud(props) {
    const data = props.data ?? []

    return (
        <TagCloud
        style={{
            fontFamily: 'sans-serif',
                color: () => '#248CF5',
                padding: 5,
                width: '100%',
                height: '500px'
        }}>
        {
            data.map(w => <div key={w['name']}>{w['name']}</div>)
        }
        </TagCloud>
    );
}

export default WordCloud;
