import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import { LoadModule, Module } from './data_modules/Module';

function Contact({ match }) {
    const id = match.params.id;
    const [name, setName] = useState('');
    const [langData, setLangData] = useState({});
    const [emojiData, setEmojiData] = useState({});
    const [sentimentData, setSentimentData] = useState({});

    const classes = makeStyles(theme => ({
      root: {
        flexGrow: 1,
      },
    }))

    useEffect(() => {
        window.zerorpcClient.invoke('contact_info', id.toString(), (error, res, more) => {
            if (error) {
                console.log(error);
            } else {
                setName(res['name'])
            }
        })
    }, [id, setName]);

    useEffect(() => {
        window.zerorpcClient.invoke('language_stats', id.toString(), (error, res, more) => {
            if (error) {
                console.log(error);
            } else {
                setLangData(res);
            }
        });
    }, [id]);

    useEffect(() => {
        window.zerorpcClient.invoke('emoji', id.toString(), (error, res, more) => {
            if (error) {
                console.log(error);
            } else {
                setEmojiData(res);
            }
        });
    }, [id]);

    useEffect(() => {
        window.zerorpcClient.invoke('sentiment', id.toString(), (error, res, more) => {
            if (error) {
                console.log(error);
            } else {
                setSentimentData(res);
            }
        });
    }, [id]);

    const crumbs = [{'url': '/contacts', 'label': 'Contacts'}];
    return (
        <div className={classes.root}>
            <Header title={name} crumbs={crumbs} />
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <LoadModule title = "Frequency"
                    endpoint = 'frequency'
                    args = {[id.toString()]}
                    type = "line"/>
                </Grid>
            </Grid>
            <Header title="Emoji" />
            <Grid container spacing={3}>
                <Grid item xs={3}>
                    <Module title="Popular"
                    data={emojiData ? emojiData['popular_pie'] : {}}
                    type="pie"/>
                </Grid>
                <Grid item xs={3}>
                    <Module title="Unique"
                    data={emojiData ? emojiData['unique'] : {}}
                    type="pie"/>
                </Grid>
                <Grid item xs={3}>
                    <Module title="Total Emojis"
                    data={emojiData ? emojiData['total_sent'] : {}}
                    type="simple"/>
                </Grid>
            </Grid>
            <Header title="Language" />
            <Grid container spacing={3}>
                <Grid item xs={3}>
                    <Module title="Average Wordlength Sent"
                    data={langData ? langData['sent_avg_wordlen'] : {}}
                    type="simple"/>
                </Grid>
                <Grid item xs={3}>
                    <Module title="Average Word Length R"
                    data={langData ? langData['received_avg_wordlen'] : {}}
                    type="simple"/>
                </Grid>
        {
                //<Grid item xs={3}>
                //    <Module title="English Words (sent)"
                //    data={langData ? langData['sent_perc_proper'] : {}}
                //    type="simple"/>
                //</Grid>
                //<Grid item xs={3}>
                //    <Module title="English Words (received)"
                //    data={langData ? langData['received_perc_proper'] : {}}
                //    type="simple"/>
                //</Grid>
                //<Grid item xs={3}>
                //    <Module title="Readability (s)"
                //    data={langData ? langData['sent_readability'] : {}}
                //    type="simple"/>
                //</Grid>
                //<Grid item xs={3}>
                //    <Module title="Readability (r)"
                //    data={langData ? langData['received_readability'] : {}}
                //    type="simple"/>
                //</Grid>
        }
                <Grid item xs={12}>
                {
                    //<Module title="Wordcloud"
                    //data={langData ? langData['received_readability'] : {}}
                    //type="word_cloud"/>
                }
                </Grid>
            </Grid>
            <Header title="Sentiment" />
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Module title="Negative Sent"
                    data={sentimentData ? sentimentData['neg_sent'] : {}}
                    type="ranked"/>
                </Grid>
                <Grid item xs={6}>
                    <Module title="Negative Received"
                    data={sentimentData ? sentimentData['neg_received'] : {}}
                    type="ranked"/>
                </Grid>
                <Grid item xs={6}>
                    <Module title="Postive Sent"
                    data={sentimentData ? sentimentData['pos_sent'] : {}}
                    type="ranked"/>
                </Grid>
                <Grid item xs={6}>
                    <Module title="Postive Received"
                    data={sentimentData ? sentimentData['pos_received'] : {}}
                    type="ranked"/>
                </Grid>
            </Grid>
        </div>
    );
}

export default Contact
